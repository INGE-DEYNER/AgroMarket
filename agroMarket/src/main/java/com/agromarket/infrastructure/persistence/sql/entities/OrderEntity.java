package com.agromarket.infrastructure.persistence.sql.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;

import com.agromarket.domain.order.enums.OrderState;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad JPA que representa un pedido en la base de datos.
 * Mapea la tabla "pedidos" y contiene todos los campos necesarios para la persistencia
 * de los pedidos en el sistema AgroMarket.
 * 
 * <p>Esta entidad usa nombres de columnas en español para mantener compatibilidad
 * con la base de datos existente, pero los campos de la clase están en inglés.</p>
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pedidos", indexes = {
    @jakarta.persistence.Index(name = "idx_pedido_comprador", columnList = "comprador_id"),
    @jakarta.persistence.Index(name = "idx_pedido_producto", columnList = "producto_id"),
    @jakarta.persistence.Index(name = "idx_pedido_fecha", columnList = "fechaCreacion")
})
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id", nullable = false)
    private UserEntity buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private ProductEntity product;

    @Column(name = "cantidad", nullable = false)
    private Integer quantity;

    @Column(name = "precioUnitario", nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total", nullable = false, precision = 19, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private OrderState state;

    @CreationTimestamp
    @Column(name = "fechaCreacion", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "checkout_id", nullable = true)
    private String checkoutId;

    @OneToOne(mappedBy = "order", fetch = FetchType.LAZY)
    private PaymentEntity payment;

    @OneToOne(mappedBy = "order", fetch = FetchType.LAZY)
    private InvoiceEntity invoice;

    @OneToOne(mappedBy = "order", fetch = FetchType.LAZY)
    private ShippingEntity shipping;
}
