require 'sinatra'
require 'sinatra/reloader'
require 'json'
require 'active_record'
require './models/budget'
require './models/category'
require './models/expense'
require './config'


# require './seed'

after do
  ActiveRecord::Base.connection.close
end

get '/' do
  @budget = Budget.first
  erb :index
end

# Budget API route and controller

get '/api/budgets' do
  content_type :json
  Budget.all.to_json
end

put '/api/budgets/:id' do
  request_body = JSON.parse(request.body.read.to_s)
  budget_params = request_body["budget"]
  budget = Budget.find(params[:id])
  budget.update(budget: budget_params)
  content_type :json
  budget.to_json
end

# Expense API route and controller

get '/api/expenses' do
  content_type :json
  Expense.order(:id).all.to_json
end

put '/api/expenses/:id' do
  request_body = JSON.parse(request.body.read.to_s)
  expense_title = request_body["title"]
  expense_cost = request_body["cost"]

  expense = Expense.find(params[:id])
  expense.update(title: expense_title, cost: expense_cost)
  content_type :json
  expense.to_json
end

post '/api/expenses' do
  request_body = JSON.parse(request.body.read.to_s)
  expense_title = request_body["title"]
  expense_cost = request_body["cost"]
  expense_category_id = request_body["category_id"]

  expense = Expense.create(title: expense_title, cost: expense_cost, category_id: expense_category_id)
  content_type :json
  expense.to_json
end

delete '/api/expenses/:id' do
  expense = Expense.find(params[:id])
  expense.delete
  content_type :json
  expense.to_json
end


# Category API route and controller

get '/api/categories' do
  content_type :json
  Category.order(:id).all.to_json
end

put '/api/categories/:id' do
  request_body = JSON.parse(request.body.read.to_s)
  category_title = request_body["title"]
  category_subtotal = request_body["sub_total"]

  category = Category.find(params[:id])
  category.update(title: category_title, sub_total: category_subtotal)
  content_type :json
  category.to_json
end

post '/api/categories' do
  request_body = JSON.parse(request.body.read.to_s)
  category_title = request_body["title"]
  category_subtotal = request_body["sub_total"]
  category_budget_id = request_body["budget_id"]

  category = Category.create(title: category_title, sub_total: category_subtotal, budget_id: category_budget_id)
  content_type :json
  category.to_json
end

delete '/api/categories/:id' do
  category = Category.find(params[:id])
  category.delete
  content_type :json
  category.to_json
end
