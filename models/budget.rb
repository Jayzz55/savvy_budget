class Budget < ActiveRecord::Base
  validates :title, uniqueness: true
  has_many :categories, dependent: :destroy
  has_many :expenses, :through => :categories
  has_secure_password
end