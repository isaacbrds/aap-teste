class PresenceListGeneratorService < Prawn::Document
  def initialize(alunos, atividade)
    super()
    @alunos = alunos
    @atividade = atividade
  end

  def presence_list_generator
    Prawn::Document.new(page_size: "A4", top_margin: 80, bottom_margin: 40) do |pdf|
      add_header(pdf)
      add_alunos_list(pdf)
      add_page_number(pdf)
    end
  end

  private

  def add_header(pdf)
    date_hour_format = "%d/%m/%Y %H:%M:%S"
    pdf.move_down 5
    pdf.indent(2) do
      pdf.text "Lista de Presença", size: 15, style: :bold, align: :center
      pdf.text "Evento: #{@atividade.event.name}", size: 11,  style: :bold
      pdf.text "Atividade: #{@atividade.name}", size: 11, style: :bold
      pdf.text "Início: #{@atividade.period_start.strftime(date_hour_format)}", size: 11, style: :bold
      pdf.text "Fim: #{@atividade.period_end.strftime(date_hour_format)}", size: 11, style: :bold
      pdf.text "Total de inscritos: #{@alunos.count}", size: 11, style: :bold
    end
    pdf.move_down 9
    pdf.bounding_box([ 0, 700 ], width: 520, height: 72) do
      pdf.stroke_bounds
    end
    pdf.move_down 5
  end

  def alumno_data
    [ [ "ID", "E-mail", "Assinatura" ] ] + @alunos.map { |aluno| [ aluno.id, aluno.email, "" ] }
  end

  def add_alunos_list(pdf)
    pdf.table alumno_data do |t|
      t.row(0).font_style = :bold
      t.column_widths = [ 40, 250, 230 ] # id, e-mail, assinatura
      t.cell_style = { size: 10 }
      t.row_colors = [ "DDDDDD", "FFFFFF" ]
    end
  end

  def add_page_number(pdf)
    pdf.number_pages "Página <page> de <total>", {
    start_count_at: 1,
    align: :right,
    size: 10,
    at: [ pdf.bounds.right - 70, 5 ]
  }
  end
end
