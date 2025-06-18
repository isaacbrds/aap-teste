class AlunosPdf < Prawn::Document
  def initialize(alunos, atividade)
    super()
    @alunos = alunos
    @atividade = atividade
    header
    alunos_list
  end

  pdf = Prawn::Document.new(page_size: "A4", top_margin: 80, bottom_margin: 40)

  def header
    move_down 5
    indent(2) do
      text "Lista de Presença", size: 15, style: :bold, align: :center
      text "Evento: #{@atividade.event.name}", size: 11,  style: :bold
      text "Atividade: #{@atividade.name}", size: 11, style: :bold
      text "Início: #{@atividade.period_start.strftime('%d/%m/%Y %H:%M:%S')}", size: 11, style: :bold
      text "Fim: #{@atividade.period_end.strftime('%d/%m/%Y %H:%M:%S')}", size: 11, style: :bold
      text "Total de inscritos: #{@alunos.count}", size: 11, style: :bold
    end
    move_down 9
    bounding_box([0, 700], width: 539, height: 72) do
      stroke_bounds
    end
    move_down 5
  end

  def alumno_data
    [["ID", "E-mail", "Assinatura"]] + @alunos.map { |aluno| [aluno.id, aluno.email, ''] }
  end

  def alunos_list
    table alumno_data do |t|
      t.row(0).font_style = :bold
      t.column_widths = [ 40, 250, 249 ] #id, e-mail, assinatura
      t.cell_style = { size: 10 }
      t.row_colors = ["DDDDDD", "FFFFFF"]
    end
  end

  string = 'page <page> of <total>'
  # Green page numbers 1 to 7
  options = {
    at: [pdf.bounds.right - 150, 0],
    width: 150,
    align: :right,
    page_filter: (1..7),
    start_count_at: 1,
    color: '007700',
  }
  pdf.number_pages string, options
end