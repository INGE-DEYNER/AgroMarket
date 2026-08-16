
package com.agromarket.infrastructure.config;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationInitializer;
import org.springframework.boot.autoconfigure.flyway.FlywayProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(FlywayProperties.class)
public class FlywayConfig {

    @Bean
    public Flyway flyway(
            DataSource dataSource,
            FlywayProperties properties) {

        return Flyway.configure()
                .dataSource(dataSource)
                .locations(
                        properties.getLocations()
                                .toArray(new String[0]))
                .baselineOnMigrate(
                        properties.isBaselineOnMigrate())
                .baselineVersion(
                        properties.getBaselineVersion())
                .load();
    }

    @Bean
    public FlywayMigrationInitializer flywayMigrationInitializer(
            Flyway flyway) {

        return new FlywayMigrationInitializer(
                flyway);
    }
}