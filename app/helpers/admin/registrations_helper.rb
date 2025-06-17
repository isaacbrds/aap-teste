module Admin::RegistrationsHelper
  def user_selection_field(form)
    if form.object.persisted?
      user = User.find(form.object.user_id)

      label_tag("E-mail do usuário:", nil, class: "mb-2") +# Exibe o email do usuário para visualização ao invés de edição
      content_tag(:input, nil, type: "text", value: "#{user.email}", readonly: true, class: "form-control") +
      # Campo hidden para manter o user_id original
      form.hidden_field(:user_id)
    else
      label_tag("E-mail do usuário:", nil, class: "mb-2") +
      # Fornece uma dropdown list de usuários para novos registros
      form.collection_select(:user_id, @users, :id, :email, { prompt: "Selecione um usuário" }, { class: "form-control" })
    end
  end
end
