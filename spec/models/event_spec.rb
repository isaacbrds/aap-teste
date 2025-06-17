require 'rails_helper'

RSpec.describe Event, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:local) }
    it { is_expected.to validate_presence_of(:period_start) }
    it { is_expected.to validate_presence_of(:period_end) }
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

  describe "When event is created in the past" do
    let(:event) { build(:event) }

    context "when start_time is in the past" do
      it "is invalid" do
        event.period_start = 1.day.ago
        expect(event).not_to be_valid
        expect(event.errors[:period_start]).to include("Não pode ser no passado.")
      end
    end

    context "when end_time is before period_start" do
      it "is invalid" do
        event.period_end = event.period_start - 1.day
        expect(event).not_to be_valid
        expect(event.errors[:period_end]).to include("Deve ser depois do início do evento")
      end
    end

    context "when period_start and period_end are valid" do
      it "is valid" do
        expect(event).to be_valid
      end
    end
  end
end
