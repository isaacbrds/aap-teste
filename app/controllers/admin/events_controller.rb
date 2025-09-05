module Admin
  class EventsController < BaseController
    before_action :authenticate_user!
    before_action :load_event, only: [ :show, :edit, :update, :destroy, :presence_list ]
    before_action :set_step, only: [ :new, :create_step ]
    STEPS = {
        1 => :general_info,
        2 => :agenda,
        3 => :publish
    }.freeze

    PERMITED_PARAMS = [
      :name, :local, :period_start, :period_end, :email, :responsable,
      :txtEnter, :txtAbout, :comission, :primaryColor,
      :secondaryColor, :status, :banner, :user_id ].freeze

    
    def index
      @events = Event.all if current_user.admin?
      @events = Event.where(user_id: current_user.id) if current_user.manager?
      @pagy, @events = pagy(@events.order(period_start: :desc))
      @registration = current_user.registrations.new if current_user
    end

    def new
      @event = build_event_from_session
      @activities = session[:activities] || []
      authorize @event

      render "admin/events/steps/step_#{@step}"
    end

    def create_step
      case @step
      when 1 then handle_general_info
      when 2 then handle_agenda
      when 3 then handle_publish
      else
        redirect_to new_admin_events_path
      end
    end

    def destroy_session
      clear_event_session
      redirect_to new_event_path, notice: 'Formulário reiniciado'
    end

    def create
      @event = current_user.owned_events.build event_params
      authorize @event
      if @event.save
        current_user.role = :manager unless current_user.admin?
        flash[:notice] = "Evento salvo com sucesso"
        redirect_to admin_events_path
      else
        flash[:alert] = "Erro ao criar o evento"
        render :new, status: :unprocessable_entity
      end
    end

    def update
      authorize @event
      if @event.update event_params
        current_user.role = :manager unless current_user.admin?
        flash[:notice] = "Evento atualizado com sucesso"
        redirect_to admin_events_path
      else
        flash[:alert] = "Erro ao atualizar o evento"
        render :edit, status: :unprocessable_entity
      end
    end

    def show
      @pagy, @activities = pagy(@event.activities.order(created_at: :desc))
    end

    def edit
      authorize @event
    end

    def destroy
      authorize @event
      @event.destroy
      flash[:notice] = "Evento excluido com sucesso"
      redirect_to admin_events_path
    end

    def presence_list
      @pagy, @presence_list = pagy(@event.users)
    end

    private

    def event_params
      params.require(:event).permit(*PERMITED_PARAMS)
    end

    def load_event
      @event = Event.find(params[:id])
    end

    def set_step
      @step = params[:step]&.to_i&.between?(1, 3) ? params[:step].to_i : 1
      @step_name = STEPS[@step]
    end
    def handle_general_info
      @event = Event.new(general_info_params)
      @event.user = current_user

      if @event.valid?(:general_info)
        session[:event_general] = general_info_params.to_h
        redirect_to new_admin_event_path(step: 2), notice: 'Informações gerais salvas!'
      else
        flash[:alert] = "Erro ao criar o evento"
        render "admin/events/steps/step_1", status: :unprocessable_entity
      end
    end


    def handle_agenda
      activities_data = params[:activities] || []
    
      # Validar atividades básicas
      activities_hash = Hash.new activities_data.to_enum
      @activities = activities_hash.map { |activity| Activity.new(activity) }
    
      if valid_activities?(@activities)
        session[:event_activities] = activities_data
        redirect_to new_admin_event_path(step: 3), notice: 'Agenda configurada!'
      else
        render "admin/events/steps/step_2", status: :unprocessable_entity
      end
    end

    def handle_publish
      @event = build_event_from_session
      @activities = (session[:event_activities] || []).map { |activity_data|
        Activity.new(activity_data)
      }

      # Validações finais
      if @event.valid? && @activities.all?(&:valid?)
        ActiveRecord::Base.transaction do
          @event.save!
          @activities.each { |activity| activity.update!(event: @event) }
          clear_event_session
        end

        redirect_to @event, notice: 'Evento criado com sucesso!'
      else
        render "admin/events/steps/step_3", status: :unprocessable_entity
      end
    end

    def build_event_from_session
      general_params = session[:event_general] || {}
      event = current_user.owned_events.build(general_params)
      event
    end

    def valid_activities?(activities)
      return true if activities.empty? # Permite eventos sem atividades
      
      activities.all? do |activity|
        activity.valid?(:basic_info) &&
        activity.period_start.present? &&
        activity.period_end.present?
      end
    end

    def clear_event_session
      session.delete(:event_general)
      session.delete(:event_activities)
    end

    def general_info_params
      params.require(:event).permit(
        :name, :local, :period_start, :period_end, :email,
        :responsable, :comission, :primaryColor, :secondaryColor
      )
    end

    def activity_params
      params.require(:activities).map do |activity|
        activity.permit(:name, :title, :speaker, :local, :period_start,
                         :period_end, :certificate_hours, :subscriptions_open)
      end
    end
  end
end
