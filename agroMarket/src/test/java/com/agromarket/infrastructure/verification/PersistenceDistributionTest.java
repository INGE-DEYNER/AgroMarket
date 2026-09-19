// src/test/java/com/agromarket/infrastructure/verification/PersistenceDistributionTest.java
package com.agromarket.infrastructure.verification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.boot.test.context.SpringBootTest;

import com.agromarket.domain.ports.out.admin.AdminPort;
import com.agromarket.domain.ports.out.config.AppConfigPort;
import com.agromarket.domain.ports.in.messaging.MessagingPort;
import com.agromarket.domain.ports.out.payment.PaymentPort;
import com.agromarket.domain.ports.out.product.ProductPort;
import com.agromarket.domain.ports.out.user.UserPort;

/**
 * Verifica la distribución final de la información:
 * - Datos transaccionales/estructurales -> MySQL (adaptadores *SqlAdapter)
 * - Datos flexibles/documentales/logs  -> MongoDB (adaptadores *MongoAdapter)
 */
@SpringBootTest
class PersistenceDistributionTest extends AbstractTestcontainersIntegrationTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void transactionalAggregatesLiveOnlyInMysql() {
        assertEquals(1, context.getBeansOfType(UserPort.class).size());
        assertEquals(1, context.getBeansOfType(ProductPort.class).size());
        assertEquals(1, context.getBeansOfType(PaymentPort.class).size());
        assertEquals(1, context.getBeansOfType(AdminPort.class).size());

        assertTrue(containsSql(context, UserPort.class));
        assertTrue(containsSql(context, ProductPort.class));
        assertTrue(containsSql(context, PaymentPort.class));
        assertTrue(containsSql(context, AdminPort.class));
    }

    @Test
    void flexibleDataLivesInMongoAndConfigInMysql() {
        assertEquals(1, context.getBeansOfType(MessagingPort.class).size());
        assertTrue(context.getBeansOfType(MessagingPort.class).keySet().stream()
                .anyMatch(name -> name.toLowerCase().contains("mongo")));

        assertEquals(1, context.getBeansOfType(AppConfigPort.class).size());
        assertTrue(containsSql(context, AppConfigPort.class));
    }

    private static boolean containsSql(
            ApplicationContext context,
            Class<?> port) {

        return context.getBeansOfType(port).keySet().stream()
                .anyMatch(name -> name.toLowerCase().contains("sql"));
    }
}

