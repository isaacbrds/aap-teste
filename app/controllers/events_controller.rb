class EventsController < ApplicationController
  layout "evento_show", only: [ :show ]

  before_action :load_event, only: [  :show  ]

  def index
    @pagy, @events = pagy(Event.order(period_start: :desc))
  end


  def show
    @registration = current_user.registrations.new if current_user
    @primary_color = @event.primaryColor
    @secundary_color = @event.secondaryColor
  end

  private

  def load_event
    @event = Event.find(params[:id])
  end
end
