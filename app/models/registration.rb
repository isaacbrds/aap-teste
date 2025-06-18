class Registration < ApplicationRecord
  belongs_to :user
  belongs_to :event

  enum status: { pending: "pending", confirmed: "confirmed", cancelled: "cancelled" }

  validates_presence_of :status
  scope :for_user_and_event, ->(user, event) { where(user: user, event: event) }
end
