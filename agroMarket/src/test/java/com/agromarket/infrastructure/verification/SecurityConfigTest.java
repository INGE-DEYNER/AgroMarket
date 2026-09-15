// src/test/java/com/agromarket/infrastructure/verification/SecurityConfigTest.java
package com.agromarket.infrastructure.verification;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.infrastructure.config.properties.JwtProperties;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("sql")
class SecurityConfigTest extends AbstractTestcontainersIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserPort userPort;

    @Autowired
    private JwtProperties jwtProperties;

    private TestJwtFactory jwtFactory;
    private User buyer;

    @BeforeEach
    void setUp() {
        jwtFactory = new TestJwtFactory(jwtProperties);
        buyer = userPort.findByEmail("security-test@agromarket.local")
                .orElseGet(() -> userPort.save(User.builder()
                        .firstName("Security")
                        .lastName("Test")
                        .email("security-test@agromarket.local")
                        .password("unused")
                        .phone("3000000000")
                        .role(Role.BUYER)
                        .active(true)
                        .approved(true)
                        .emailVerified(true)
                        .accountApproved(true)
                        .accountComplete(true)
                        .accountStatus("ACTIVE")
                        .build()));
    }

    @Test
    void publicAuthEndpointIsNotBlocked() throws Exception {
        mockMvc.perform(get("/api/v1/auth/google"))
                .andExpect(result -> assertNotEquals(401, result.getResponse().getStatus()))
                .andExpect(result -> assertNotEquals(403, result.getResponse().getStatus()));
    }

    @Test
    void publicProductCatalogIsNotBlocked() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(result -> assertNotEquals(401, result.getResponse().getStatus()))
                .andExpect(result -> assertNotEquals(403, result.getResponse().getStatus()));
    }

    @Test
    void publicReviewCatalogIsNotBlocked() throws Exception {
        mockMvc.perform(get("/api/v1/reviews/product/999999"))
                .andExpect(result -> assertNotEquals(401, result.getResponse().getStatus()))
                .andExpect(result -> assertNotEquals(403, result.getResponse().getStatus()));
    }

    @Test
    void actuatorHealthIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(result -> assertNotEquals(401, result.getResponse().getStatus()))
                .andExpect(result -> assertNotEquals(403, result.getResponse().getStatus()));
    }

    @Test
    void protectedRoutesRejectAnonymousRequests() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/products"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/payments/order/999999"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/shipments"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/coupons/active"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/rfq/active"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/notifications/user/999999"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/images/owner/999999"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/v1/reviews/999999"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/admins/active"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminRouteReturnsForbiddenForAuthenticatedNonAdmin() throws Exception {
        String token = jwtFactory.token(buyer.getId(), Role.BUYER.name());

        mockMvc.perform(get("/api/v1/admins/active")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void malformedJwtIsHandledAsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                .header("Authorization", "Bearer definitely-not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }
}
