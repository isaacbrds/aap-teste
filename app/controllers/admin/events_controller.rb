module Admin
  class EventsController < BaseController
    PERMITED_PARAMS = [
      :name, :local, :period_start, :period_end, :email, :responsable,
      :txtEnter, :txtAbout, :comission, :primaryColor,
      :secondaryColor, :status, :banner, :user_id ].freeze

    before_action :authenticate_user!
    before_action :load_event, only: [ :show, :edit, :update, :destroy, :presence_list ]

    def index
      @events = Event.all if current_user.admin?
      @events = Event.where(user_id: current_user.id) if current_user.manager?
      @pagy, @events = pagy(@events.order(period_start: :desc))
      @registration = current_user.registrations.new if current_user
    end

    def new
      @event = current_user.owned_events.build
      authorize @event
    end

    def create
      @event = current_user.owned_events.build event_params
      authorize @event
      respond_to do |format|
        if @event.save
          current_user.role = :manager unless current_user.admin?
          format.json { 
            render json: { 
              event: @event.as_json(include: :activities),
              message: 'Evento criado com sucesso!' 
            }, status: :created 
          }
          format.html { redirect_to admin_event_path(@event), notice: 'Evento criado com sucesso!' }
        else
          format.json { 
            render json: { 
              errors: @event.errors.full_messages,
              details: @event.errors.as_json 
            }, status: :unprocessable_entity 
          }
          format.html { render :new, status: :unprocessable_entity }
        end
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
      params.require(:event).permit(*PERMITED_PARAMS, activities_attributes: [ :name, :title, :local, :speaker, :period_start, :period_end,
        :certificate_hours, :subscriptions_open ])
    end

    def load_event
      @event = Event.find(params[:id])
    end
  end
end
