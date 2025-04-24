FactoryBot.define do
  factory :event do
    name { Faker::Name.name }
    responsable { Faker::Name.name }
    email { Faker::Internet.email }
    local { Faker::Address.city }
    period_start { Date.today }
    period_end { Date.today + 2.days }
    banner { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/banner.jpeg'), 'image/jpeg') }
    user
  end
end
