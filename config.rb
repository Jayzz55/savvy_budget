ActiveRecord::Base.establish_connection(
  :adapter => 'postgresql',
  :database => 'savvybudget'
)

local_db = {
  :adapter => 'postgresql',
  :database => 'savvybudget'
}

ActiveRecord::Base.establish_connection(ENV['DATABASE_URL'] || local_db)
ActiveRecord::Base.logger = Logger.new(STDERR) #show sql in the terminal