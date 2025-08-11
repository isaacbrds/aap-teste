class ActivitiesController < ApplicationController
  layout "evento_show", only: [ :index, :show ]

  before_action :load_event
  before_action :load_activity, only: %i[  show  ]


  def index
    @activities = @event.activities.order(period_start: :desc)
    @primary_color = @event.primaryColor
    @secundary_color = @event.secondaryColor
  end

  def show;end

  private

  def load_event
    @event = Event.find(params[:event_id])
  end

  def load_activity
    @activity = @event.activities.find(params[:id])
  end
end
