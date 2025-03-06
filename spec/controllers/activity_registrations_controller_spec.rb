require "rails_helper"

RSpec.describe ActivityRegistrationsController, type: :controller do
  let(:event) { create(:event) }
  let(:activity) { create(:activity) }
  let(:user) { create(:user) }

  describe 'POST #register' do
    context 'with valid parameters' do
      before(:each) do
        sign_in user
      end

      it 'returns a successful response' do
        post :register, params: { event_id: event.id, activity_id: activity.id }
        expect(response).to redirect_to(event_activities_path)
      end

      it 'creates a new registration' do
        expect {
          post :register, params: { event_id: event.id, activity_id: activity.id }
        }.to change(ActivityRegistration, :count).by(1)
      end
    end

    context 'with invalid parameters' do
      it 'returns a redirect response' do
        post :register, params: { event_id: event.id, activity_id: activity.id }
        expect(response).to redirect_to(new_user_session_path)
      end

      it 'do not creates a new activity registration' do
        expect {
          post :register, params: { event_id: event.id, activity_id: activity.id }
        }.to change(ActivityRegistration, :count).by(0)
      end
    end
  end
end
