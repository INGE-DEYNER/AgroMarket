// src/test/java/com/agromarket/infrastructure/verification/SqlPersistenceProfileTest.java
package com.agromarket.infrastructure.verification;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import com.agromarket.domain.ports.out.order.OrderPort;
import com.agromarket.domain.ports.out.payment.PaymentPort;
import com.agromarket.domain.ports.out.user.UserPort;

@SpringBootTest
@ActiveProfiles("sql")
class SqlPersistenceProfileTest extends AbstractTestcontainersIntegrationTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void sqlProfileResolvesExactlyOneSqlImplementation() {
        assertEquals(1, context.getBeansOfType(UserPort.class).size());
        assertEquals(1, context.getBeansOfType(OrderPort.class).size());
        assertEquals(1, context.getBeansOfType(PaymentPort.class).size());

        assertTrue(context.getBeansOfType(UserPort.class).keySet().stream()
                .anyMatch(name -> name.toLowerCase().contains("sql")));
        assertTrue(context.getBeansOfType(OrderPort.class).keySet().stream()
                .anyMatch(name -> name.toLowerCase().contains("sql")));
        assertTrue(context.getBeansOfType(PaymentPort.class).keySet().stream()
                .anyMatch(name -> name.toLowerCase().contains("sql")));
    }
}
