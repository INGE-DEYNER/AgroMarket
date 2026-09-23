// src/test/java/com/agromarket/infrastructure/verification/ApplicationContextSmokeTest.java
package com.agromarket.infrastructure.verification;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import com.agromarket.domain.ports.out.admin.AdminPort;
import com.agromarket.domain.ports.out.image.FileStoragePort;
import com.agromarket.domain.ports.out.payment.InvoicePort;
import com.agromarket.domain.ports.out.payment.PaymentGatewayPort;
import com.agromarket.domain.ports.out.user.AuthEventPort;
import com.agromarket.domain.ports.out.user.AuthenticationTokenPort;
import com.agromarket.domain.ports.out.user.EmailPort;
import com.agromarket.domain.ports.out.user.GoogleOAuth2Port;
import com.agromarket.domain.ports.out.user.PasswordHashPort;
import com.agromarket.domain.ports.out.user.PasswordHistoryPort;
import com.agromarket.domain.ports.out.user.TwoFactorAuthenticationPort;
import com.agromarket.domain.ports.out.coupon.CouponPort;
import com.agromarket.domain.ports.out.image.ImagePort;
import com.agromarket.domain.ports.out.messaging.MessagingPort;
import com.agromarket.domain.ports.out.order.OrderPort;
import com.agromarket.domain.ports.out.payment.PaymentPort;
import com.agromarket.domain.ports.out.product.ProductPort;
import com.agromarket.domain.ports.out.review.ReviewPort;
import com.agromarket.domain.ports.out.rfq.QuoteOfferPort;
import com.agromarket.domain.ports.out.rfq.RequestForQuotePort;
import com.agromarket.domain.ports.out.shipping.ShippingPort;
import com.agromarket.domain.ports.out.user.UserPort;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("sql")
class ApplicationContextSmokeTest extends AbstractTestcontainersIntegrationTest {

    private static final int EXPECTED_ENDPOINT_COUNT = 85;

    @Autowired
    private ApplicationContext context;

    @Autowired
@Qualifier("requestMappingHandlerMapping")
private RequestMappingHandlerMapping handlerMapping;

    @Test
    void applicationContextStartsCompletely() {
        assertNotNull(context, "ApplicationContext no fue construido");
    }

    @Test
    void everyCriticalOutPortHasExactlyOneResolvedBean() {
        assertSingle(UserPort.class);
        assertSingle(ProductPort.class);
        assertSingle(OrderPort.class);
        assertSingle(PaymentPort.class);
        assertSingle(ShippingPort.class);
        assertSingle(CouponPort.class);
        assertSingle(ReviewPort.class);
        assertSingle(MessagingPort.class);
        assertSingle(ImagePort.class);
        assertSingle(AdminPort.class);
        assertSingle(RequestForQuotePort.class);
        assertSingle(QuoteOfferPort.class);

        assertSingle(AuthEventPort.class);
        assertSingle(PasswordHistoryPort.class);
        assertSingle(InvoicePort.class);
        assertSingle(FileStoragePort.class);
        assertSingle(PasswordHashPort.class);
        assertSingle(AuthenticationTokenPort.class);
        assertSingle(TwoFactorAuthenticationPort.class);
        assertSingle(EmailPort.class);
        assertSingle(GoogleOAuth2Port.class);
        assertSingle(PaymentGatewayPort.class);
    }

    @Test
    void mappedEndpointCountHasNotRegressed() {
        int count = handlerMapping.getHandlerMethods().size();
        assertTrue(count >= EXPECTED_ENDPOINT_COUNT,
                () -> "Se esperaban al menos " + EXPECTED_ENDPOINT_COUNT
                        + " HandlerMethods, pero solo existen " + count);
    }

    private <T> void assertSingle(Class<T> type) {
        Map<String, T> beans = context.getBeansOfType(type);
        assertEquals(1, beans.size(),
                () -> "El port " + type.getName() + " debe resolver exactamente un bean; encontrados: "
                        + beans.keySet());
    }
}
