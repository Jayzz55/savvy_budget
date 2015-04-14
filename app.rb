require 'sinatra'
require 'sinatra/reloader'
require 'pg'
require 'json'
require 'pry'
require 'active_record'
require './category'
require './expense'
require './config'


# require './seed'

after do
  ActiveRecord::Base.connection.close
end

get '/' do
  erb :index
end

# API route and controller

get '/api/categories' do
  content_type :json
  Category.all.to_json
end

put '/api/categories/:id' do
  request_body = JSON.parse(request.body.read.to_s)
  category_title = request_body["title"]
  category_done = request_body["done"]

  category = Category.find(params[:id])
  category.update(title: category_title, done: category_done)
  content_type :json
  category.to_json
end

post '/api/categories' do
  request_body = JSON.parse(request.body.read.to_s)
  category_title = request_body["title"]
  category_done = request_body["done"]
  category_order_num = request_body["order"]

  category = Category.create(title: category_title, done: category_done, order_num: category_order_num)
  content_type :json
  category.to_json
end

delete '/api/categories/:id' do
  category = Category.find(params[:id])
  category.delete
  content_type :json
  category.to_json
end
