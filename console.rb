require 'pry'
require 'active_record'
require './budget'
require './category'
require './expense'
require './config'

ActiveRecord::Base.logger = Logger.new(STDERR) # show sql in the terminal

binding.pry

puts '.'