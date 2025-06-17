class Activity < ApplicationRecord
  belongs_to :event
  has_many :activity_registrations
  has_many :users, through: :activity_registrations

  validates :name, :title, :speaker, :local, :certificate_hours, :period_start, :period_end, presence: true
end
