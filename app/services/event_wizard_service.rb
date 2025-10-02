# app/services/event_wizard_service.rb
class EventWizardService
  include ActiveModel::Model
  include ActiveModel::Attributes

  STEPS = {
    1 => :general_info,
    2 => :agenda,
    3 => :publish
  }.freeze

  attr_accessor :session, :params, :current_user

  def initialize(session:, params:, current_user:)
    @session = session
    @params = params
    @current_user = current_user
  end

  def process_step(step)
    case step
    when 1 then process_general_info
    when 2 then process_agenda
    when 3 then process_publish
    else
      { success: false, error: 'Step inválido' }
    end
  end

  def build_event_from_session
    general_params = session[:event_general] || {}
    event = Event.new(general_params.except('banner'))
    event.user = current_user
    
    if general_params[:banner].present? && general_params[:banner].is_a?(ActionDispatch::Http::UploadedFile)
        event.banner.attach(general_params[:banner])
    end
    event
  end

  def build_activities_from_session
    # (session[:event_activities] || []).map { |activity_data| 
    #   Activity.new(activity_data) 
    # }

    activities_data = session[:event_activities] || {}
  
    activities_data.map do |index, activity_data|
      # Usar OpenStruct em vez de Activity model
      OpenStruct.new(activity_data.merge(
        period_start: parse_datetime(activity_data['period_start']),
        period_end: parse_datetime(activity_data['period_end']),
        certificate_hours: activity_data['certificate_hours'].to_f
      ))
    end
  end

  def clear_session
    session.delete(:event_general)
    session.delete(:event_activities)
  end

  private

  def process_general_info
    event = Event.new(general_info_params)
    event.user = current_user

    if event.valid?
      event.save
      session[:event_general] = general_info_params.to_h
      { success: true, next_step: 2, message: 'Informações gerais salvas!' }
    else
      { success: false, errors: event.errors, model: event }
    end
  end

  def process_agenda
    activities_data = params[:activities] || {}
    
    # Processar cada atividade individualmente
    activities = []
    clean_data = {}
    
    activities_data.each do |index, activity_params|
      # Permitir parâmetros específicos
      permitted_data = activity_params.permit(
        :name, :title, :speaker, :local, :period_start, :period_end,
        :certificate_hours, :subscriptions_open
      )
      
      # Converter para hash
      activity_hash = permitted_data.to_h
      
      # Criar OpenStruct
      activities << OpenStruct.new(activity_hash)
      
      # Salvar dados limpos
      clean_data[index] = activity_hash
    end
    
    if valid_activities_data?(activities)
      session[:event_activities] = clean_data
      { success: true, next_step: 3, message: 'Agenda configurada!' }
    else
      { success: false, errors: extract_errors(activities), models: activities }
    end
  end


  def process_publish
    event = build_event_from_session
    activities = build_activities_from_session

    if event.valid?
      result = create_event_with_activities(event, activities)
      clear_session if result[:success]
      result
    else
      { success: false, errors: [event.errors, activities.map(&:errors)].flatten }
    end
  end

  def create_event_with_activities(event, activities)
    
    ActiveRecord::Base.transaction do
      event.save!
      activities.each do |activity_data|
        activity = Activity.new(activity_data.to_h)
        activity.event = event
        activity.save!
      end

      #send_notifications_if_requested(event)
      
      { success: true, event: event, message: 'Evento criado com sucesso!' }
    end
  rescue ActiveRecord::RecordInvalid => e
    { success: false, error: e.message }
  end

  def send_notifications_if_requested(event)
    return unless params[:send_notifications] == 'true'
    
    AdminNotificationMailer.new_event_created(event).deliver_later
  end

  # def valid_activities?(activities)
  #   return true if activities.empty?
    
  #   activities.all? do |activity|
  #     activity.valid?(:basic_info) && 
  #     activity.period_start.present? && 
  #     activity.period_end.present?
  #   end
  # end
  def valid_activities_data?(activities)
    activities.all? do |activity|
      activity.name.present? && 
      activity.period_start.present? && 
      activity.period_end.present? &&
      (activity.period_end.blank? || activity.period_start.blank? || 
      Time.parse(activity.period_end) > Time.parse(activity.period_start))
    end
  rescue
    false
  end

  def parse_datetime(datetime_str)
    return nil if datetime_str.blank?
    Time.parse(datetime_str)
  rescue
    nil
  end
  def general_info_params
    params.require(:event).permit(:id,
      :name, :description, :local, :period_start, :period_end, :email,
      :txtAbout,:txtEnter, :responsable, :comission, :primaryColor,
      :status, :secondaryColor, :banner
    )
  end

  def permitted_activities_params
    return [] unless params[:activities].present?

    # Permitir parâmetros aninhados
    permitted = params.require(:activities).map do |index, activity_params|
      activity_params.permit(
        :name, :title, :speaker, :local, :period_start, :period_end,
        :certificate_hours, :subscriptions_open
      ).to_h
    end

      permitted
  end

end
