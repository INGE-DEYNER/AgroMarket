#!/bin/bash
set -e

echo "=== Starting Initialization ==="

# Ensure directories exist
mkdir -p /app/mysql/data /app/mysql/run /app/mysql/log

# Check if database is initialized
if [ ! -d "/app/mysql/data/mysql" ]; then
    echo "Initializing MySQL database..."
    mysqld --defaults-file=/app/mysql/my.cnf --initialize-insecure
    echo "MySQL database initialized."
fi

# Start MySQL
echo "Starting MySQL daemon..."
mysqld --defaults-file=/app/mysql/my.cnf &

# Wait for MySQL to start
echo "Waiting for MySQL to start..."
until mysqladmin --socket=/app/mysql/run/mysqld.sock -u root ping >/dev/null 2>&1; do
    echo "MySQL is not ready yet, sleeping..."
    sleep 2
done

echo "MySQL is up and running."

# Configure database and users
echo "Configuring MySQL database and users..."
mysql --socket=/app/mysql/run/mysqld.sock -u root -e "CREATE DATABASE IF NOT EXISTS agromarket_db;"
mysql --socket=/app/mysql/run/mysqld.sock -u root -e "CREATE USER IF NOT EXISTS 'mysql'@'127.0.0.1' IDENTIFIED BY 'AgroMarketUserPassword2026!';"
mysql --socket=/app/mysql/run/mysqld.sock -u root -e "GRANT ALL PRIVILEGES ON agromarket_db.* TO 'mysql'@'127.0.0.1';"
mysql --socket=/app/mysql/run/mysqld.sock -u root -e "CREATE USER IF NOT EXISTS 'mysql'@'localhost' IDENTIFIED BY 'AgroMarketUserPassword2026!';"
mysql --socket=/app/mysql/run/mysqld.sock -u root -e "GRANT ALL PRIVILEGES ON agromarket_db.* TO 'mysql'@'localhost';"
mysql --socket=/app/mysql/run/mysqld.sock -u root -e "CREATE USER IF NOT EXISTS 'mysql'@'%' IDENTIFIED BY 'AgroMarketUserPassword2026!';"
mysql --socket=/app/mysql/run/mysqld.sock -u root -e "GRANT ALL PRIVILEGES ON agromarket_db.* TO 'mysql'@'%';"
mysql --socket=/app/mysql/run/mysqld.sock -u root -e "FLUSH PRIVILEGES;"
echo "MySQL configuration completed."

# Start Spring Boot Application
echo "Starting AgroMarket Spring Boot backend on port 7860..."
exec java -Djava.security.egd=file:/dev/./urandom \
          -XX:+UseContainerSupport \
          -XX:MaxRAMPercentage=75.0 \
          -jar /app/app.jar \
          --server.port=7860
