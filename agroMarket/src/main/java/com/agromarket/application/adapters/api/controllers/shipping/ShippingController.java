// application/adapters/api/controllers/shipping/ShippingController.java
package com.agromarket.application.adapters.api.controllers.shipping;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
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

import com.agromarket.application.adapters.api.request.shipping.CreateShippingRequest;
import com.agromarket.application.adapters.api.response.shipping.ShippingResponse;
import com.agromarket.domain.ports.in.shipping.ShippingPort;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShippingController {

	private final ShippingPort shippingPort;

	private final com.agromarket.domain.ports.out.config.AppConfigPort appConfigPort;

	/**
	 * Costo de envío nacional configurado (COP). Valor por defecto si la base
	 * de datos aún no tiene configuración; la fuente de verdad dinámica es
	 * app_config (editable desde el panel de administración).
	 */
	@Value("${app.shipping.cost:15000}")
	private BigDecimal shippingCost;

	/**
	 * GET /api/v1/shipments/config (alias frontend: /envios/config)
	 * Devuelve el costo de envío configurado para que el frontend muestre
	 * Subtotal + Envío = Total con el MISMO valor que usará el backend.
	 */
	@GetMapping("/config")
	public ResponseEntity<Map<String, Object>> getConfig() {

		BigDecimal costo = appConfigPort
				.getValor(com.agromarket.domain.ports.out.config.AppConfigPort.CLAVE_COSTO_ENVIO)
				.orElse(shippingCost);

		Map<String, Object> config = new java.util.LinkedHashMap<>();

		config.put("costoEnvio", costo);
		config.put("moneda", "COP");

		return ResponseEntity.ok(config);
	}

	/**
	 * PUT /api/v1/shipments/config — SOLO ADMIN.
	 * Actualiza el costo de envío nacional. Se persiste en base de datos
	 * (app_config) y a partir de ese momento lo usan el checkout, el total
	 * de los pedidos y el cobro de la pasarela.
	 */
	@PutMapping("/config")
	public ResponseEntity<Map<String, Object>> updateConfig(
			@RequestBody Map<String, Object> body) {

		Object valor = body.get("costoEnvio");

		BigDecimal costo;
		try {
			costo = new BigDecimal(String.valueOf(valor));
		} catch (NumberFormatException | NullPointerException e) {
			throw new IllegalArgumentException(
					"El costo de envío debe ser un número válido");
		}

		if (costo.signum() < 0) {
			throw new IllegalArgumentException(
					"El costo de envío no puede ser negativo");
		}

		appConfigPort.setValor(
				com.agromarket.domain.ports.out.config.AppConfigPort.CLAVE_COSTO_ENVIO,
				costo);

		Map<String, Object> config = new java.util.LinkedHashMap<>();

		config.put("costoEnvio", costo);
		config.put("moneda", "COP");

		return ResponseEntity.ok(config);
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