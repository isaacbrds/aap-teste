class ActivityRegistrationsController < ApplicationController
before_action :authenticate_user!
  def register
    @activity = Activity.find(params[:activity_id])
    @activity_registration = @activity.activity_registrations.build(user: current_user)
    @activity_registration.status = :confirmed
    if @activity_registration.save
      flash[:notice] = "Inscrição realizada com sucesso."
      redirect_to event_activities_path
    else
      flash[:alert] =  "Não foi possível realizar a inscrição."
      redirect_to @activity
    end
  end
end
