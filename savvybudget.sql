CREATE DATABASE savvybudget;

\c savvybudget

CREATE TABLE categories (
  id SERIAL4 PRIMARY KEY,
  title VARCHAR(200),
  order_num INTEGER,
  done BOOLEAN,
  max_limit DECIMAL(18,2),
  value DECIMAL(18,2),
  budget_id INTEGER,
  created_at TIMESTAMP
);

CREATE TABLE expenses (
  id SERIAL4 PRIMARY KEY,
  category_id INTEGER,
  title VARCHAR(200),
  order_num INTEGER,
  done BOOLEAN,
  cost DECIMAL(18,2),
  created_at TIMESTAMP
);
