class Category < ActiveRecord::Base
  has_many :expenses, dependent: :destroy
  belongs_to :budget
end