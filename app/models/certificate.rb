class Certificate < ApplicationRecord
  belongs_to :user
  belongs_to :event

  validates :certificate_number, presence: true, uniqueness: true

  before_validation :generate_certificate_number, on: :create

  def calculate_hours
    # Assuming you have a method to calculate hours based on activities
    self.hours = user.activity_registrations.joins(:activity)
                      .where(activities: { event_id: event.id }, status: 'confirmed')
                      .sum('activities.certificate_hours')
  end

  def attended_activities
    Activity.joins(:activity_registrations)
            .where(activity_registrations: { user: user, status: 'confirmed' })
            .where(event: event)
  end

  private

  def generate_certificate_number
    self.certificate_number ||= "CERT-#{SecureRandom.hex(8)}"
  end
end
