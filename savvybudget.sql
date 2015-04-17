CREATE DATABASE savvybudget;

\c savvybudget

CREATE TABLE budgets (
  id SERIAL4 PRIMARY KEY,
  title VARCHAR(300),
  budget DECIMAL(18,2),
  created_at TIMESTAMP,
  password_digest VARCHAR(300)
);

CREATE TABLE categories (
  id SERIAL4 PRIMARY KEY,
  title VARCHAR(200),
  sub_total DECIMAL(18,2),
  budget_id INTEGER,
  created_at TIMESTAMP
);

CREATE TABLE expenses (
  id SERIAL4 PRIMARY KEY,
  category_id INTEGER,
  title VARCHAR(200),
  cost DECIMAL(18,2),
  created_at TIMESTAMP
);

-- ALTER TABLE budgets ADD password_digest VARCHAR(300);
