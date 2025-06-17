require 'rails_helper'

RSpec.describe Activity, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:speaker) }
    it { is_expected.to validate_presence_of(:local) }
    it { is_expected.to validate_presence_of(:period_start) }
    it { is_expected.to validate_presence_of(:period_end) }
    it { is_expected.to validate_presence_of(:certificate_hours) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:event) }
  end
end
