module Admin
  class CertificatesController < BaseController
    before_action :authenticate_user!
    before_action :load_event
    before_action :load_certificate, only: [ :show, :download ]
    # GET /certificates
    def index
      @certificates = @event.certificates
    end


    def show
      @certificate.calculate_hours
      @attended_activities = @certificate.attended_activities
    end

    def download
    @certificate.calculate_hours
    pdf = CertificateGeneratorService.new(@certificate).generate_pdf

    send_data pdf.render,
              filename: "certificado_#{@certificate.certificate_number}.pdf",
              type: "application/pdf",
              disposition: "attachment"
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
