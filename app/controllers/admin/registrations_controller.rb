module Admin
  class RegistrationsController < BaseController
    before_action :authenticate_user!
    before_action :load_event
    before_action :load_registration, only: [ :show, :edit, :update, :destroy ]
    def index
      @registrations = @event.registrations.order(:id)
    end

    def new
      @registrations = @event.registrations
      @users = User.where.not(id: @registrations.pluck(:user_id)).order(:email) if @registrations.any?
      @registration = Registration.new
    end
    def create
      @registration = @event.registrations.new(registration_params)
      if @registration.save
        redirect_to admin_event_registration_path(@event, @registration), notice: "Registro cadastrado com sucesso!"
      else
        render :new
      end
    end

    def show;end

    def edit;end
    def update
      if @registration.update(registration_params)
        redirect_to admin_event_registration_path(@event, @registration), notice: "Registro atualizado com sucesso!"
      else
        render :edit
      end
    end

    def destroy
      @registration.destroy
      redirect_to admin_event_registrations_path(@event), notice: "Registro destruído com sucesso!."
    end
    private
    def load_event
      @event = Event.find(params[:event_id])
    end

    def load_registration
      @registration = @event.registrations.find(params[:id])
    end

    def registration_params
      params.require(:registration).permit(:event_id, :user_id, :status)
    end
  end
end
