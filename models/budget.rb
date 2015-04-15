class Budget < ActiveRecord::Base
  has_many :categories, dependent: :destroy
  has_many :expenses, :through => :categories
end