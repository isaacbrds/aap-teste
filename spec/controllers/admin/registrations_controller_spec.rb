require "rails_helper"
module Admin
  RSpec.describe RegistrationsController, type: :controller do
    let!(:event) { create(:event) }
    let!(:registration) { create(:registration, event: event) }

    describe "GET #index" do
      context 'without authentication' do
          it "returns a login page response" do
            get :index, params: { event_id: event.id }
            expect(response).to redirect_to(new_user_session_path)
          end
      end
      context 'with authentication' do
        before(:each) do
          sign_in create(:user)
        end

        it "assigns @registrations" do
          get :index, params: { event_id: event.id }
          expect(assigns(:registrations)).to eq([ registration ])
        end

        it "renders the index template" do
          get :index, params: { event_id: event.id }
          expect(response).to render_template(:index)
        end
      end
    end

    describe "GET #show" do
      context 'without authentication' do
          it "returns a login page response" do
            get :index, params: { event_id: event.id }
            expect(response).to redirect_to(new_user_session_path)
          end
      end

      context 'with authentication' do
        before(:each) do
          sign_in create(:user)
        end

        it "assigns @registration" do
          get :show, params: { event_id: event.id, id: registration.id }
          expect(assigns(:registration)).to eq(registration)
        end

        it "renders the show template" do
          get :show, params: { event_id: event.id, id: registration.id }
          expect(response).to render_template(:show)
        end
      end
    end

    describe "GET #new" do
      context 'without authentication' do
          it "returns a login page response" do
            get :new, params: { event_id: event.id }
            expect(response).to redirect_to(new_user_session_path)
          end
      end

      context 'with authentication' do
        before(:each) do
          sign_in create(:user)
        end

        it "assigns @registration" do
          get :new, params: { event_id: event.id }
          expect(assigns(:registration)).to be_a_new(Registration)
        end

        it "renders the new template" do
          get :new, params: { event_id: event.id }
          expect(response).to render_template(:new)
        end
      end
    end

    describe "POST #create" do
      let!(:event) { create(:event) }
      let!(:user) { create(:user) }
      let(:registration_params) { attributes_for(:registration, event: event, user_id: user.id) }

      context 'without authentication' do
          it "returns a login page response" do
            post :create, params: { event_id: event.id, registration: { user_id: 1 } }
            expect(response).to redirect_to(new_user_session_path)
          end
      end

      context 'with authentication' do
        before(:each) do
          sign_in create(:user)
        end

        it 'returns a successful response' do
          post :create, params: { event_id: event.id, registration: registration_params }
          expect(response).to redirect_to(admin_event_registration_path(event, assigns(:registration)))
        end

        it 'returns an authorized message' do
          post :create, params: { event_id: event.id, registration: registration_params }
          expect(flash[:notice]).to eq("Registro cadastrado com sucesso!")
        end
      end
    end

    describe "GET #edit" do
      context 'without authentication' do
          it "returns a login page response" do
            get :edit, params: { event_id: event.id, id: registration.id }
            expect(response).to redirect_to(new_user_session_path)
          end
      end

      context 'with authentication' do
        before(:each) do
          sign_in create(:user)
        end

        it "assigns @registration" do
          get :edit, params: { event_id: event.id, id: registration.id }
          expect(assigns(:registration)).to eq(registration)
        end

        it "renders the edit template" do
          get :edit, params: { event_id: event.id, id: registration.id }
          expect(response).to render_template(:edit)
        end
      end
    end

    describe "PATCH #update" do
      let!(:event) { create(:event) }
      let!(:user) { create(:user) }
      let!(:registration) { create(:registration, event: event, user: user) }
      let(:updated_registration_params) { attributes_for(:registration, event: event, user_id: user.id, status: :confirmed) }

      context 'without authentication' do
          it "returns a login page response" do
            patch :update, params: { event_id: event.id, id: registration.id, registration: updated_registration_params }
            expect(response).to redirect_to(new_user_session_path)
          end
      end

      context 'with authentication' do
        before(:each) do
          sign_in create(:user)
        end

        it 'returns a successful response' do
          patch :update, params: { event_id: event.id, id: registration.id, registration: updated_registration_params }
          expect(response).to redirect_to(admin_event_registration_path(event, assigns(:registration)))
        end

        it 'returns an authorized message' do
          patch :update, params: { event_id: event.id, id: registration.id, registration: updated_registration_params }
          expect(flash[:notice]).to eq("Registro atualizado com sucesso!")
        end
      end
    end
    describe "DELETE #destroy" do
      context 'without authentication' do
          it "returns a login page response" do
            delete :destroy, params: { event_id: event.id, id: registration.id }
            expect(response).to redirect_to(new_user_session_path)
          end
      end

      context 'with authentication' do
        before(:each) do
          sign_in create(:user)
        end

        it 'returns a successful response' do
          delete :destroy, params: { event_id: event.id, id: registration.id }
          expect(response).to redirect_to(admin_event_registrations_path(event))
        end

        it 'returns an authorized message' do
          delete :destroy, params: { event_id: event.id, id: registration.id }
          expect(flash[:notice]).to eq("Registro destruído com sucesso!.")
        end
      end
    end
  end
end
