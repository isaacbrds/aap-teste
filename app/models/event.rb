class Event < ApplicationRecord
  belongs_to :user
  has_many :registrations
  has_many :users, through: :registrations
  has_many :activities, dependent: :destroy
  has_one_attached :banner
  has_many :certificates, dependent: :destroy
  has_rich_text :txtEnter
  has_rich_text :txtAbout

  enum status: { registrations_open: "registrations_open", event_in_progress: "event_in_progress", event_closed: "event_closed",
  cancelled: "cancelled" }

  validates :name, :local, :period_start, :period_end, presence: true
  validates :banner, attached: true, content_type: [ :png, :jpg, :jpeg ]
  validate :period_start_cannot_be_in_past, :period_end_must_be_after_period_start

  private


  # Prevents past period_start
  def period_start_cannot_be_in_past
    if period_start.present? && period_start < Date.current
      errors.add(:period_start, "Não pode ser no passado.")
    end
  end

  # Ensures period_end > period_start
  def period_end_must_be_after_period_start
    if period_end.present? && period_start.present? && period_end <= period_start
      errors.add(:period_end, "Deve ser depois do início do evento")
    end
  end
end
