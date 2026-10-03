package com.agromarket.application.adapters.persistence.sql.entities.order;

import java.math.BigDecimal;

import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Producto y cantidad incluidos en una solicitud de devolución.
 */
@Entity
@Table(
    name = "return_request_items",
    indexes = @Index(name = "idx_return_items_request", columnList = "return_request_id")
)
@Getter
@Setter
@NoArgsConstructor
public class ReturnItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "return_request_id", nullable = false)
    private ReturnRequestEntity returnRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 19, scale = 4)
    private BigDecimal unitPrice;
}