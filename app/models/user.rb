class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  has_many :owned_events, class_name: "Event", foreign_key: "user_id", dependent: :destroy
  has_many :registrations
  has_many :registered_events, through: :registrations, source: :event
  has_many :activity_registrations
  has_many :activities, through: :activity_registrations

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  enum role: { registered: "registered", organizer: "organizer", manager: "manager", admin: "admin" }
end
