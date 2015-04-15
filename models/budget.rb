class Budget < ActiveRecord::Base
  has_many :categories
  has_many :expenses, :through => :categories
end