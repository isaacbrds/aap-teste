module Admin
  class EventsController < BaseController
    PERMITED_PARAMS = [
      :name, :local, :period_start, :period_end, :email, :responsable,
      :txtEnter, :txtAbout, :comission, :primaryColor,
      :secondaryColor, :status, :banner ].freeze

    before_action :authenticate_user!, except: %i[ index ]
    before_action :load_event, only: [ :show, :edit, :update, :destroy ]

    def index
      @pagy, @events = pagy(Event.order(period_start: :desc))
      @registration = current_user.registrations.new if current_user
    end

    def new
      @event = current_user.events.build
    end

    def create
      @event = current_user.events.build event_params
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
        #      current_user.role = :manager unless current_user.admin?
        flash[:notice] = "Evento atualizado com sucesso"
        redirect_to admin_events_path
      else
        flash[:alert] = "Erro ao atualizar o evento"
        render :edit, status: :unprocessable_entity
      end
    end

    def show;end

    def edit
      authorize @event
    end

    def destroy
      authorize @event
      @event.destroy
      flash[:notice] = "Evento excluido com sucesso"
      redirect_to admin_events_path
    end

    private

    def event_params
      params.require(:event).permit(*PERMITED_PARAMS)
    end

    def load_event
      @event = Event.find(params[:id])
    end
  end
end
