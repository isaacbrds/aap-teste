class Event < ApplicationRecord
  belongs_to :user
  has_many :registrations
  has_many :users, through: :registrations
  has_many :activities, dependent: :destroy
  has_one_attached :banner

  has_rich_text :txtEnter
  has_rich_text :txtAbout

  enum status: { registrations_open: "registrations_open", event_in_progress: "event_in_progress", event_closed: "event_closed",
  cancelled: "cancelled" }

  validates :name, :local, :period_start, :period_end, presence: true
  validates :banner, attached: true, content_type: [ :png, :jpg, :jpeg ]
end
