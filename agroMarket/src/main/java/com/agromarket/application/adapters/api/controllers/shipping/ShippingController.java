// application/adapters/api/controllers/shipping/ShippingController.java
package com.agromarket.application.adapters.api.controllers.shipping;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;

import com.agromarket.application.adapters.api.request.shipping.CreateShippingRequest;
import com.agromarket.application.adapters.api.request.shipping.UpdateShippingRequest;
import com.agromarket.application.adapters.api.response.shipping.ShippingResponse;
import com.agromarket.domain.ports.in.shipping.ShippingPort;
import com.agromarket.domain.services.shipping.ShippingTariffs;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShippingController {

	private final ShippingPort shippingPort;

        @Value("${app.shipping.origin-latitude}")
        private double originLatitude;

        @Value("${app.shipping.origin-longitude}")
        private double originLongitude;

        @Value("${app.shipping.price-per-kilometer}")
        private BigDecimal pricePerKilometer;

        @Value("${app.shipping.minimum-cost:0}")
        private BigDecimal minimumCost;

        @Value("${app.shipping.local-radius-km:25}")
        private double localRadiusKm;

        @Value("${app.shipping.regional-radius-km:180}")
        private double regionalRadiusKm;

	/** Devuelve las reglas necesarias para cotizar el envío por distancia. */
	@GetMapping("/config")
	public ResponseEntity<Map<String, Object>> getConfig() {
		return ResponseEntity.ok(Map.of(
                                        "originLatitude", originLatitude,
                                        "originLongitude", originLongitude,
                                        "pricePerKilometer", pricePerKilometer,
                                        "minimumCost", minimumCost,
				"currency", "COP"));
	}

        @PostMapping
        public ResponseEntity<ShippingResponse> createShipping(
                        @Valid @RequestBody CreateShippingRequest request) {

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(
                                                ShippingResponse.fromResult(
                                                                shippingPort.createShipping(
                                                                                request.getOrderId())));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ShippingResponse> getById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                ShippingResponse.fromResult(
                                                shippingPort.getById(id)));
        }

        @GetMapping("/order/{orderId}")
        public ResponseEntity<ShippingResponse> getByOrderId(
                        @PathVariable Long orderId) {

                return ResponseEntity.ok(
                                ShippingResponse.fromResult(
                                                shippingPort.getByOrderId(orderId)));
        }

        /**
         * PUT /api/v1/shipments/{id} — actualiza los datos de seguimiento.
         *
         * <p>Lo consume el modal "Actualizar envío" del panel del productor
         * ({@code PUT /envios/{id}}). Antes devolvía 405 porque este endpoint no
         * existía y el formulario de seguimiento no se podía guardar.</p>
         */
        @PutMapping("/{id}")
        public ResponseEntity<ShippingResponse> updateTracking(
                        @PathVariable Long id,
                        @RequestBody UpdateShippingRequest request) {

                return ResponseEntity.ok(
                                ShippingResponse.fromResult(
                                                shippingPort.updateTracking(
                                                                id,
                                                                request.getCarrier(),
                                                                request.getTrackingNumber(),
                                                                request.getEstimatedDeliveryDate())));
        }

        @PatchMapping("/{id}/advance")
        public ResponseEntity<ShippingResponse> advanceState(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                ShippingResponse.fromResult(
                                                shippingPort.advanceState(id)));
        }

        @PatchMapping("/{id}/cancel")
        public ResponseEntity<ShippingResponse> cancel(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                ShippingResponse.fromResult(
                                                shippingPort.cancel(id)));
        }

        @GetMapping
        public ResponseEntity<List<ShippingResponse>> getAll() {

                return ResponseEntity.ok(
                                shippingPort
                                                .getAll()
                                                .stream()
                                                .map(ShippingResponse::fromResult)
                                                .toList());
        }
}