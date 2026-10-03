// src/test/java/com/agromarket/infrastructure/verification/DomainInvariantsSmokeTest.java
package com.agromarket.infrastructure.verification;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Field;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.agromarket.domain.exceptions.coupon.InvalidCouponException;
import com.agromarket.domain.exceptions.shipping.InvalidShippingStateException;
import com.agromarket.domain.models.coupon.Coupon;
import com.agromarket.domain.models.enums.coupon.CouponType;
import com.agromarket.domain.models.enums.rfq.QuoteOfferStatus;
import com.agromarket.domain.models.enums.shipping.ShippingState;
import com.agromarket.domain.models.rfq.QuoteOffer;
import com.agromarket.domain.models.rfq.RequestForQuote;
import com.agromarket.domain.models.shipping.Shipping;
import com.agromarket.domain.ports.in.order.OrderPort;
import com.agromarket.domain.services.rfq.QuoteOfferService;

class DomainInvariantsSmokeTest {

        @Test
        void couponUseMarksCouponUsedAndRejectsSecondUse() {
                Coupon coupon = Coupon.builder()
                                .code("SMOKE")
                                .type(CouponType.FIXED_AMOUNT)
                                .value(java.math.BigDecimal.TEN)
                                .minimumAmount(java.math.BigDecimal.ZERO)
                                .expirationDate(LocalDateTime.now().plusHours(1))
                                .used(false)
                                .build();

                coupon.use();
                assertTrue(coupon.isUsed());
                assertThrows(InvalidCouponException.class, coupon::use);
        }

        @Test
        void shippingCannotAdvanceAfterDeliveryOrCancelAfterTransportStarts() {
                Shipping delivered = Shipping.builder()
                                .state(ShippingState.DELIVERED)
                                .build();

                assertThrows(InvalidShippingStateException.class, delivered::advanceState);

                Shipping inTransit = Shipping.builder()
                                .state(ShippingState.IN_TRANSIT)
                                .build();

                assertThrows(InvalidShippingStateException.class, inTransit::cancel);
        }

        @Test
        void orderInputPortHasNoUpdateOrderOperation() {
                boolean exists = java.util.Arrays.stream(OrderPort.class.getDeclaredMethods())
                                .anyMatch(method -> method.getName().equals("updateOrder"));
                assertFalse(exists, "OrderPort no debe volver a exponer updateOrder");
        }

        @Test
        void rfqDoesNotStoreProductOnRequestButQuoteOfferDoes() throws Exception {
                boolean requestHasProduct = java.util.Arrays.stream(RequestForQuote.class.getDeclaredFields())
                                .anyMatch(field -> field.getName().equals("product"));
                assertFalse(requestHasProduct, "RequestForQuote no debe tener Product");

                Field product = QuoteOffer.class.getDeclaredField("product");
                assertEquals(com.agromarket.domain.models.product.Product.class, product.getType());

                QuoteOffer offer = QuoteOffer.builder()
                                .status(QuoteOfferStatus.PENDING)
                                .requestForQuote(RequestForQuote.builder().build())
                                .proposedPrice(java.math.BigDecimal.TEN)
                                .build();
                new QuoteOfferService().reject(offer);
                assertEquals(QuoteOfferStatus.REJECTED, offer.getStatus());
        }
}
