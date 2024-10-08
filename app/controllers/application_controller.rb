class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  include Pundit::Authorization
  include Pagy::Backend
  allow_browser versions: :modern

  # before_action :authenticate_user!

  rescue_from Pundit::NotAuthorizedError do
    flash[:alert] = "Você não tem autorização para essa ação"
    redirect_to root_path
  end
end
