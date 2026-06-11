USE moris_agroconnect;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'farmer', 'driver', 'admin') NOT NULL,
  location VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'kg',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (farmer_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS demand_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  required_date DATE NOT NULL,
  status ENUM('pending', 'forecasted', 'matched', 'quoted', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (buyer_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  farmer_id INT NOT NULL,
  buyer_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (request_id) REFERENCES demand_requests(id)
    ON DELETE CASCADE,

  FOREIGN KEY (farmer_id) REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY (buyer_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL,
  buyer_id INT NOT NULL,
  farmer_id INT NOT NULL,
  status ENUM('confirmed', 'in_transit', 'delivered', 'cancelled') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (quotation_id) REFERENCES quotations(id)
    ON DELETE CASCADE,

  FOREIGN KEY (buyer_id) REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY (farmer_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('pending', 'paid') DEFAULT 'pending',
  pdf_url VARCHAR(255),

  FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  driver_id INT,
  route TEXT,
  eta VARCHAR(50),
  status ENUM('assigned', 'picked_up', 'delivered') DEFAULT 'assigned',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,

  FOREIGN KEY (driver_id) REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS food_waste_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  product VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  expiry_date DATE NOT NULL,
  status ENUM('available', 'sold', 'donated') DEFAULT 'available',

  FOREIGN KEY (farmer_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sustainability_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  period VARCHAR(50),
  local_pct DECIMAL(5,2) DEFAULT 0,
  carbon_kg DECIMAL(10,2) DEFAULT 0,
  waste_saved_kg DECIMAL(10,2) DEFAULT 0,
  farmer_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (buyer_id) REFERENCES users(id)
    ON DELETE CASCADE
);
