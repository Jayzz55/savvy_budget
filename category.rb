class Category < ActiveRecord::Base
  has_many :expenses
  belongs_to :budget
end