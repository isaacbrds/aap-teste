class Registration < ApplicationRecord
  belongs_to :user
  belongs_to :event

  enum status: { pending: "pending", confirmed: "confirmed", cancelled: "cancelled" }

  validates_presence_of :status
  scope :for_user_and_event, ->(user, event) { where(user: user, event: event) }
  # scope :for_event, ->(event) { where(event: event) }
  # scope :for_user, ->(user) { where(user: user) }

  after_update :generate_certificate
  private
  def generate_certificate
    Certificate.create(user: self.user, event: self.event) if self.status == "confirmed"
  end
end
