import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const migrations = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
  )`,

  // Subscriptions table
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan_type ENUM('free', 'basic', 'pro') DEFAULT 'free',
    status ENUM('active', 'canceled', 'past_due', 'trialing') DEFAULT 'active',
    current_period_start TIMESTAMP NULL,
    current_period_end TIMESTAMP NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    generations_used INT DEFAULT 0,
    generations_limit INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_stripe_customer (stripe_customer_id)
  )`,

  // Fursonas table (generated fursonas)
  `CREATE TABLE IF NOT EXISTS fursonas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
  )`,

  // Payment history
  `CREATE TABLE IF NOT EXISTS payment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    amount INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
  )`
];

async function runMigrations() {
  let connection;
  
  try {
    // First, connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'fursona_db'}`);
    console.log(`✅ Database '${process.env.DB_NAME}' ready`);
    
    await connection.query(`USE ${process.env.DB_NAME || 'fursona_db'}`);

    // Run migrations
    for (const migration of migrations) {
      await connection.query(migration);
      console.log('✅ Migration executed');
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default runMigrations;
