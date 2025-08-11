module Admin
  class ActivitiesController < BaseController
    PERMITED_PARAMS = [
      :name, :local, :period_start, :period_end, :title, :speaker,
      :certificate_hours, :subscriptions_open, :event_id ].freeze

    before_action :authenticate_user!
    before_action :load_event
    before_action :load_activity, only: %i[ edit show update destroy activity_presence_list activity_presence_list_pdf ]


    # def index
    #   @activities = @event.activities.order(period_start: :desc)
    # end

    def show;end

    def edit
      authorize @activity
    end

    def new
      @activity = @event.activities.build
      authorize @activity
    end

    def create
      @activity = @event.activities.build activity_params
      authorize @activity
      if @activity.save
        flash[:notice] = "Atividade cadastrada com sucesso!"
        redirect_to admin_event_path(@event)
      else
        flash[:alert] = "Erro ao criar a atividade "
        render :new, status: :unprocessable_entity
      end
    end

    def update
      authorize @activity
      if @activity.update activity_params
        flash[:notice] = "Atividade atualizada com sucesso!"
        redirect_to admin_event_path(@event)
      else
        flash[:alert] = "Erro ao atualizar a atividade"
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      authorize @activity
      @activity.destroy
      flash[:notice] = "Atividade Excluida com sucesso!"
      redirect_to admin_event_path(@event)
    end

    def activity_presence_list
      @activity
      authorize @activity
      @activity_presence_list = @activity.users # Busca os usuário inscritos em uma atividade específica
    end

    def activity_presence_list_pdf
      respond_to do |format|
        format.pdf do
          pdf = PresenceListGeneratorService.new(@activity.users, @activity).presence_list_generator
          send_data pdf.render, filename: "lista_de_presença.pdf", type: "application/pdf", disposition: "inline"
        end
      end
    end

    private

    def load_event
      @event = Event.find(params[:event_id])
    end

    def load_activity
      @activity = @event.activities.find(params[:id])
    end

    def activity_params
      params.require(:activity).permit(*PERMITED_PARAMS)
    end
  end
end
