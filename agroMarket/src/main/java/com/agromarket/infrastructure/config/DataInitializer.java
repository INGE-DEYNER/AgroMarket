package com.agromarket.infrastructure.config;

// DataInitializer eliminado — la DB ya tiene datos reales en producción.
// El seed de datos de prueba causaba reset de contraseñas en cada deploy
// (admin@agromarket.com, producer@test.com, buyer@test.com con contraseñas hardcodeadas).
//
// Si en el futuro se necesita seed para un entorno nuevo:
// 1. Crear un script SQL en src/main/resources/db/seed.sql
// 2. Ejecutarlo manualmente UNA SOLA VEZ — nunca en un CommandLineRunner de producción.
