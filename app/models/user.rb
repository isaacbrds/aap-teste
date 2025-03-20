class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
 
  has_many :registrations
  has_many :events, through: :registrations
  has_many :activity_registrations
  has_many :activities, through: :activity_registrations

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  enum role: { registered: "registered", manager: "manager", admin: "admin" }
end
