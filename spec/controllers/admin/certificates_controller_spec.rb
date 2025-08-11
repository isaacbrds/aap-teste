require "rails_helper"
module Admin
  RSpec.describe CertificatesController, type: :controller do
    let!(:event) { create(:event) }
    let!(:certificate) { create(:certificate, event: event) }

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

        it "assigns @certificates" do
          get :index, params: { event_id: event.id }
          expect(assigns(:certificates)).to eq([ certificate ])
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
          get :show, params: { id: certificate.id, event_id: event.id }
          expect(response).to redirect_to(new_user_session_path)
        end
      end

      context 'with authentication' do
        before(:each) do
          sign_in create(:user)
        end

        it "assigns @certificate" do
          get :show, params: { id: certificate.id, event_id: event.id }
          expect(assigns(:certificate)).to eq(certificate)
        end

        it "renders the show template" do
          get :show, params: { id: certificate.id, event_id: event.id }
          expect(response).to render_template(:show)
        end
      end
    end
  end
end
