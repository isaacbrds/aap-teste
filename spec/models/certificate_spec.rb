# spec/models/certificate_spec.rb

require 'rails_helper'

RSpec.describe Certificate, type: :model do
  let(:user) { create(:user) }
  let(:event) { create(:event, user: user) }
  subject(:certificate) { build(:certificate, user: user, event: event) }

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:event) }
  end

  describe 'callbacks' do
    it 'generates a unique certificate_number before validation' do
      expect(certificate.certificate_number).to be_nil
      certificate.valid?  # Trigger validations
      expect(certificate.certificate_number).to be_present
      expect(certificate.certificate_number).to start_with('CERT-')
    end
  end
end
