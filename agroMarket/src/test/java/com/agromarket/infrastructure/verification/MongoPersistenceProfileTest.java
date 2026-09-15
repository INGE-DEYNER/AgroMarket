// src/test/java/com/agromarket/infrastructure/verification/MongoPersistenceProfileTest.java
package com.agromarket.infrastructure.verification;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import com.agromarket.domain.ports.out.payment.PaymentPort;
import com.agromarket.domain.ports.out.user.UserPort;

@SpringBootTest
@ActiveProfiles("mongo")
class MongoPersistenceProfileTest extends AbstractTestcontainersIntegrationTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void mongoProfileResolvesExactlyOneMongoImplementation() {
        // Los pedidos YA NO se persisten en MongoDB: el agregado Order vive en
        // MySQL (OrderSqlAdapter) y ya no existe OrderMongoAdapter/OrderDocument.
        // Por eso este perfil solo verifica los agregados que siguen en Mongo.
        assertEquals(1, context.getBeansOfType(UserPort.class).size());
        assertEquals(1, context.getBeansOfType(PaymentPort.class).size());

        assertTrue(context.getBeansOfType(UserPort.class).keySet().stream()
                .anyMatch(name -> name.toLowerCase().contains("mongo")));
        assertTrue(context.getBeansOfType(PaymentPort.class).keySet().stream()
                .anyMatch(name -> name.toLowerCase().contains("mongo")));
    }
}
