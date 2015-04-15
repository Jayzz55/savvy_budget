require 'pry'
require 'active_record'
require './models/budget'
require './models/category'
require './models/expense'
require './config'

ActiveRecord::Base.logger = Logger.new(STDERR) # show sql in the terminal

binding.pry

puts '.'