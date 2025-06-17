
class CertificateGeneratorService
 def initialize(certificate)
    @certificate = certificate
    @user = certificate.user
    @event = certificate.event
  end

  def generate_pdf
    Prawn::Document.new(page_size: [ 842, 595 ], margin: 50) do |pdf| # A4 landscape
      add_background_image(pdf)
      add_header(pdf)
      add_content(pdf)
      add_activities(pdf)
      add_footer(pdf)
      add_border(pdf)
    end
  end

  private

  def add_background_image(pdf)
    # Imagem cobrindo toda a página
    return unless @certificate.event.banner.attached?

    begin
      # Pega o caminho do arquivo
      if Rails.env.development?
        # Desenvolvimento: arquivo local
        image_path = @certificate.event.banner.blob.service.path_for(@certificate.event.banner.key)
      else
        # Produção: download temporário
        image_path = download_banner_temporarily
      end

      # Adiciona como fundo com opacidade
      pdf.transparent(0.9) do  # 80% de opacidade para não interferir no texto
        pdf.image image_path,
                  at: [ -50, pdf.bounds.height + 50 ],
                  width: 842,
                  height: 595
      end

    rescue => e
      Rails.logger.error "Erro ao carregar banner: #{e.message}"
      # Fallback caso dê erro
      add_gradient_background(pdf)
    end
  end


  def add_header(pdf)
    # Logo da instituição (se existir)
    # pdf.image "app/assets/images/logo.png", at: [0, 545], width: 100
    pdf.move_down 30
    pdf.font_size 24
    pdf.text "CERTIFICADO", align: :center, style: :bold
    pdf.move_down 20

    pdf.font_size 16
    pdf.text "Certificamos que", align: :center
    pdf.move_down 10

    # Nome do participante
    pdf.font_size 16
    pdf.text @user.email, align: :center, style: :bold
    pdf.move_down 20
  end

  def add_content(pdf)
    pdf.font_size 14
    pdf.span(700, position: :center) do
      text = "participou do evento <b>#{@event.name}</b>, realizado no período de " \
            "#{I18n.l(@event.period_start, format: :long)} a #{I18n.l(@event.period_end, format: :long)}, " \
            "com carga horária total de <b>#{@certificate.hours} horas</b>."
      pdf.text text, align: :justify, inline_format: true
      pdf.move_down 30
    end
  end

  def add_activities(pdf)
    return if @certificate.attended_activities.empty?
    pdf.span(700, position: :center) do
    pdf.font_size 12
    pdf.text "Atividades participadas:", style: :bold
    pdf.move_down 10

    activities_data = [ [ "Atividade", "Palestrante", "Carga Horária" ] ]

    @certificate.attended_activities.each do |activity|
      activities_data << [
        activity.name,
        activity.speaker || "N/A",
        "#{activity.certificate_hours}h"
      ]
    end

      pdf.table(activities_data, header: true, width: pdf.bounds.width) do
        row(0).font_style = :bold
        cells.borders = [ :top, :bottom ]
        cells.padding = [ 5, 10 ]
      end
    end

    pdf.move_down 30
  end

  def add_footer(pdf)
    pdf.font_size 10
    pdf.span(700, position: :center) do
      # Data de emissão
      pdf.text "Emitido em: #{I18n.l(@certificate.created_at, format: :long)}", align: :left

      # Número do certificado
      pdf.text "Certificado nº: #{@certificate.certificate_number}", align: :right

      pdf.move_down 20

      # Assinatura (se tiver responsável)
      if @event.responsable.present?
        pdf.text "_" * 40, align: :center
        pdf.text @event.responsable, align: :center, style: :bold
        pdf.text "Responsável pelo evento", align: :center
      end

      if @event.user.present?
        pdf.move_down 10
        pdf.text "_" * 40, align: :center
        pdf.text @certificate.user.email, align: :center, style: :bold
        pdf.text "Participante do evento", align: :center
      end
    end
  end

  def add_border(pdf)
    # Borda decorativa
    pdf.stroke_color "cccccc"
    pdf.stroke_rectangle [ 0, pdf.bounds.height ], pdf.bounds.width, pdf.bounds.height
    pdf.stroke_color "000000" # Reset para preto
  end
end
