module Admin
  class UsersController < BaseController
    before_action :authenticate_user!
    before_action :load_user, only: [ :show, :edit, :update, :destroy ]
    def index
      @pagy, @users = pagy(User.all)
    end

    def edit
      authorize @user
    end

    def show;end

    def new
      @user = User.new
      authorize current_user
    end

    def create
      @user = User.new user_params
      authorize @user
      if @user.save
        flash[:notice] = "Usuário cadastrado com sucesso!"
        redirect_to admin_users_path
      else
        flash[:alert] = "Erro ao criar o usuario"
        render :new, status: :unprocessable_entity
      end
    end

    def update
      authorize @user
      update_params = user_params
      if update_params[:password].blank?
        update_params.delete(:password)
        update_params.delete(:password_confirmation)
      end

      if @user.update update_params
        flash[:notice] = "Usuário atualizado com sucesso!"
        redirect_to admin_users_path
      else
        flash[:alert] = "Erro ao atualizar o usuario"
        render :new, status: :unprocessable_entity
      end
    end

    def destroy
      authorize @user
      @user.destroy
      flash[:notice] = "Usuário excluido com sucesso!"
      redirect_to admin_users_path
    end

    private

    def load_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation, :role)
    end
  end
end
