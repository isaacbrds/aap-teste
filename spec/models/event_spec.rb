require 'rails_helper'

RSpec.describe Event, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:local) }
    it { is_expected.to validate_presence_of(:period_start) }
    it { is_expected.to validate_presence_of(:banner) }
  end
  describe 'associations' do
    it { is_expected.to belong_to :user }
  end
  describe 'banner format validation' do
    let(:event) { build(:event) }

    context 'when banner is a JPEG' do
      it 'is valid' do
        event.banner.attach(Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/banner.jpeg'), 'image/jpeg'))
        expect(event).to be_valid
      end
    end

    context 'when banner is a PNG' do
      it 'is valid' do
        event.banner.attach(Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/banner.png'), 'image/png'))
        expect(event).to be_valid
      end
    end
  end
end
