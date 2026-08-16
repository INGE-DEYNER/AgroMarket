package com.agromarket.infrastructure.security;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.models.payment.PaymentInitiationResult;
import com.agromarket.domain.ports.out.payment.PaymentGatewayPort;

@Component
public class MercadoPagoPaymentGatewayAdapter
                implements PaymentGatewayPort {

        private final String baseUrl;

        public MercadoPagoPaymentGatewayAdapter(
                        @Value("${app.mercadopago.base-url:https://api.mercadopago.com}") String baseUrl) {

                this.baseUrl = baseUrl;
        }

        @Override
        public PaymentInitiationResult initiate(
                        Payment payment) {

                if (payment == null) {
                        throw new IllegalArgumentException(
                                        "El pago es obligatorio");
                }

                /*
                 * MOCK:
                 * Todavía no se ejecuta una operación real contra Mercado Pago.
                 * La referencia y URL permiten continuar el flujo de desarrollo.
                 */
                String reference = "MOCK-MP-"
                                + UUID.randomUUID();

                String checkoutUrl = baseUrl
                                + "/checkout/mock/"
                                + reference;

                return new PaymentInitiationResult(
                                checkoutUrl,
                                reference);
        }

        @Override
        public boolean verifyTransaction(
                        String gatewayReference) {

                /*
                 * MOCK:
                 * Solo considera válidas las referencias generadas
                 * por este adaptador durante desarrollo.
                 */
                return gatewayReference != null
                                && gatewayReference.startsWith(
                                                "MOCK-MP-");
        }
}