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
      @wizard = EventWizardService.new(
        session: session, 
        params: params, 
        current_user: current_user
      )
      
      @event = @wizard.build_event_from_session
      @activities = @wizard.build_activities_from_session
      authorize @event

      render "admin/events/steps/step_#{@step}"
    end

    def create_step
      @wizard = EventWizardService.new(
      session: session, 
      params: params, 
      current_user: current_user
    )
    
      result = @wizard.process_step(@step)
      
      if result[:success]
        if result[:next_step]
          redirect_to new_admin_event_path(step: result[:next_step]), 
                      notice: result[:message]
        else
          redirect_to admin_event_path(result[:event]), 
                      notice: result[:message]
        end
      else
        @event = result[:model] || @wizard.build_event_from_session
        @activities = result[:models] || @wizard.build_activities_from_session
        
        flash.now[:alert] = 'Por favor, corrija os erros abaixo.'
        render "admin/events/steps/step_#{@step}", status: :unprocessable_entity
      end
    end

    def destroy_session
      EventWizardService.new(session: session, params: {}, current_user: current_user)
                     .clear_session
    redirect_to new_admin_event_path, notice: 'Formulário reiniciado'
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
    end
    

    def general_info_params
      params.require(:event).permit(
        :name, :local, :period_start, :period_end, :email, :txtAbout, :txtEnter,
        :responsable, :comission, :primaryColor, :secondaryColor, :status, :banner
      )
    end

    def activity_params
      params.require(:activities).map do |activity|
        activity.permit(:name, :title, :speaker, :local, :period_start,
                         :period_end, :certificate_hours, :subscriptions_open)
      end
    end

    def permitted_activity_params(activity_params)
      activity_params.permit(
        :name, :title, :speaker, :local, :period_start, :period_end,
        :certificate_hours, :subscriptions_open
      )
    end
  end
end
