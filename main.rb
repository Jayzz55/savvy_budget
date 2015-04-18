require 'sinatra'
require 'sinatra/reloader'
require 'json'
require 'active_record'
require 'bcrypt'
require './models/budget'
require './models/category'
require './models/expense'
require './config'

enable :sessions

after do
  ActiveRecord::Base.connection.close
end

get '/' do
  erb :index, :layout => :index_layout
end

get '/app' do
  redirect to '/' unless current_budget
  @budget = current_budget
  erb :app, :layout => :app_layout
end

# Sessions

get '/session/new' do
  erb :index, :layout => :index_layout
end

post '/session' do
  @budget = Budget.where(title: params[:title]).first
  if @budget && @budget.authenticate(params[:password])
    session[:budget_id] = @budget.id
    redirect to '/app'
  else
    erb :index, :layout => :index_layout
  end
end

delete '/session' do
  session[:budget_id] = nil
  redirect to '/'
end

helpers do
  def logged_in?
    !!current_budget
  end

  def current_budget
    Budget.find_by(id: session[:budget_id])
  end
end

# Create new budget

post '/budgets' do
  @budget = Budget.create(title: params[:title], budget: params[:budget], password: params[:password])
  session[:budget_id] = @budget.id
  
  redirect to '/app'
end

# Budget API route and controller

get '/api/budgets' do
  content_type :json
  current_budget.to_json
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
  current_budget.expenses.order(:id).all.to_json
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
  current_budget.categories.order(:id).all.to_json
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
