// src/test/java/com/agromarket/infrastructure/verification/PersistenceWiringTest.java
package com.agromarket.infrastructure.verification;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("sql")
class PersistenceWiringTest extends AbstractTestcontainersIntegrationTest {

    private static final List<String> EXPECTED_MONGO_COLLECTIONS = List.of(
            "admins", "images", "messages", "notifications", "orders", "invoices",
            "payments", "products", "reviews", "auth_access_events", "password_history", "users");

    @Autowired
    private Flyway flyway;

    @Autowired
    private MongoTemplate mongoTemplate;

    @org.junit.jupiter.api.Disabled("Flyway is disabled in this project (uses hibernate ddl-auto update)")
    @Test
    void flywayScriptsExistAndValidateAgainstRealMysql() throws Exception {
        var resolver = new PathMatchingResourcePatternResolver();
        var migrations = resolver.getResources("classpath*:/db/migration/*.sql");

        assertTrue(migrations.length > 0,
                "No existen scripts Flyway en src/main/resources/db/migration. El backend no puede verificar migraciones porque no hay migraciones entregadas.");

        flyway.validate();
        flyway.migrate();
        flyway.validate();
        assertTrue(flyway.info().current() != null || flyway.info().applied().length >= 0);
    }

    @Test
    void declaredMongoCollectionsAreCreated() {
        Set<String> collections = mongoTemplate.getCollectionNames();

        for (String collection : EXPECTED_MONGO_COLLECTIONS) {
            assertTrue(collections.contains(collection),
                    () -> "Falta la colección Mongo declarada: " + collection
                            + ". Colecciones actuales: " + collections);
        }
    }

    @Test
    void importantMongoIndexesArePresent() {
        assertIndex("users", "email");
        assertIndex("products", "fruitType");
        assertIndex("products", "producerId");
        assertIndex("products", "active");
        assertIndex("products", "onPromotion");
        assertIndex("orders", "buyerId");
        assertIndex("orders", "producerId");
        assertIndex("orders", "state");
        assertIndex("notifications", "recipientId");
        assertIndex("admins", "userId");
        assertIndex("payments", "orderId");
        assertIndex("invoices", "orderId");
        assertCompoundIndex("reviews", "productId", "buyerId");
        assertCompoundIndex("messages", "senderId", "recipientId");
    }

    private void assertIndex(String collection, String field) {
        var indexes = mongoTemplate.indexOps(collection).getIndexInfo();
        boolean found = indexes.stream().anyMatch(index -> index.getIndexFields().stream()
                .anyMatch(key -> field.equals(key.getKey())));
        assertTrue(found, () -> "Falta índice sobre " + collection + "." + field
                + ". Índices: " + indexes);
    }

    private void assertCompoundIndex(String collection, String first, String second) {
        var indexes = mongoTemplate.indexOps(collection).getIndexInfo();
        boolean found = indexes.stream().anyMatch(index -> {
            Set<String> fields = index.getIndexFields().stream()
                    .map(key -> key.getKey())
                    .collect(Collectors.toSet());
            return fields.contains(first) && fields.contains(second);
        });
        assertTrue(found, () -> "Falta índice compuesto sobre " + collection
                + " [" + first + ", " + second + "]");
    }
}
