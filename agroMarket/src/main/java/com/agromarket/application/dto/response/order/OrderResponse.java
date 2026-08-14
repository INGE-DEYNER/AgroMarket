package com.agromarket.application.dto.response.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.order.enums.OrderState;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida que representa un pedido.
 * Contiene la información del pedido para ser devuelta al cliente.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String buyerName;
    private String productName;
    private Long productId;
    private String producerName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;
    private OrderState status;
    private LocalDateTime createdAt;
    private String checkoutId;
    private boolean paid;
}
