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

# Start background loop to insert test accounts and promote administrator once tables are created by Hibernate
(
    accounts_inserted=false
    while true; do
        sleep 10
        # Check if table 'usuarios' exists
        if mysql --socket=/app/mysql/run/mysqld.sock -u root -e "USE agromarket_db; SHOW TABLES LIKE 'usuarios';" 2>/dev/null | grep -q "usuarios"; then
            
            # Insert test accounts if not done yet
            if [ "$accounts_inserted" = "false" ]; then
                echo "Table 'usuarios' exists. Inserting test accounts..."
                mysql --socket=/app/mysql/run/mysqld.sock -u root -e "
                    USE agromarket_db;
                    INSERT INTO usuarios (nombre, apellido, correo, contrasena, telefono, rol, activo, aprobado, totp_enabled, email_verificado, cuenta_aprobada, cuenta_completa, estado_cuenta, verificado, codigo_pais, ubicacion)
                    VALUES ('Pedro', 'Perez', 'producer@test.com', '\$2a\$10\$7Z8oK50fE3bYnF4gO2.KJuV58mC87qXg6uC5K5EfeV81U.1QzK02C', '3001234567', 'PRODUCTOR', 1, 1, 0, 1, 1, 1, 'ACTIVA', 1, '57', 'Urabá')
                    ON DUPLICATE KEY UPDATE correo = 'producer@test.com';
                    
                    INSERT INTO usuarios (nombre, apellido, correo, contrasena, telefono, rol, activo, aprobado, totp_enabled, email_verificado, cuenta_aprobada, cuenta_completa, estado_cuenta, codigo_pais, ubicacion)
                    VALUES ('Juan', 'Gomez', 'buyer@test.com', '\$2a\$10\$7Z8oK50fE3bYnF4gO2.KJuV58mC87qXg6uC5K5EfeV81U.1QzK02C', '3009876543', 'COMPRADOR', 1, 1, 0, 1, 1, 1, 'ACTIVA', '57', 'Bogotá')
                    ON DUPLICATE KEY UPDATE correo = 'buyer@test.com';
                "
                accounts_inserted=true
                echo "Test accounts insertion attempted."
            fi

            # Auto-promote deyner.ingsoftware@gmail.com to ADMINISTRADOR if exists
            if mysql --socket=/app/mysql/run/mysqld.sock -u root -e "USE agromarket_db; SELECT 1 FROM usuarios WHERE correo = 'deyner.ingsoftware@gmail.com';" 2>/dev/null | grep -q "1"; then
                mysql --socket=/app/mysql/run/mysqld.sock -u root -e "
                    USE agromarket_db;
                    UPDATE usuarios 
                    SET rol = 'ADMINISTRADOR', 
                        estado_cuenta = 'ACTIVA', 
                        cuenta_aprobada = 1, 
                        cuenta_completa = 1, 
                        email_verificado = 1, 
                        aprobado = 1 
                    WHERE correo = 'deyner.ingsoftware@gmail.com' AND rol != 'ADMINISTRADOR';
                " >/dev/null 2>&1
            fi
        fi
    done
) &

# Start Spring Boot Application
echo "Starting AgroMarket Spring Boot backend on port 7860..."
exec java -Djava.security.egd=file:/dev/./urandom \
          -XX:+UseContainerSupport \
          -XX:MaxRAMPercentage=75.0 \
          -jar /app/app.jar \
          --server.port=7860
