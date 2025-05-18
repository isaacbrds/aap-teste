module Admin
  class CertificatesController < BaseController
    before_action :authenticate_user!
    before_action :load_event
    before_action :load_certificate, only: [ :show ]
    # GET /certificates
    def index
      @certificates = @event.certificates
    end


    def show
    end

    private

    def load_event
      @event = Event.find(params[:event_id])
    end

    def load_certificate
      @certificate = Certificate.find(params[:id])
    end
  end
end
