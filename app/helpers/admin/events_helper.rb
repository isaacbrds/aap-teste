module Admin::EventsHelper
def step_classes(step_number)
    if step_number < @step
      "completed"
    elsif step_number == @step
      "active"
    else
      "inactive"
    end
  end

  def step_labels
    {
      1 => "Informações Gerais",
      2 => "Agenda",
      3 => "Publicar"
    }
  end
end
