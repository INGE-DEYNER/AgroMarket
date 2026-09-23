package com.agromarket.application.adapters.persistence.sql.entities.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import com.agromarket.application.adapters.persistence.sql.entities.payment.PaymentEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.enums.order.ReturnStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Solicitud de devolución/reembolso de un pedido.
 *
 * <p>
 * Se relaciona con el pedido, el comprador, el pago, los productos
 * devueltos, el motivo, la descripción y las evidencias aportadas.
 * </p>
 */
@Entity
@Table(
    name = "return_requests",
    indexes = {
        @Index(name = "idx_returns_buyer", columnList = "buyer_id"),
        @Index(name = "idx_returns_order", columnList = "order_id"),
        @Index(name = "idx_returns_status", columnList = "status")
    },
    uniqueConstraints = @UniqueConstraint(
        name = "uk_returns_idempotency",
        columnNames = { "idempotency_key" })
)
@Getter
@Setter
@NoArgsConstructor
public class ReturnRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "buyer_id", nullable = false)
    private UserEntity buyer;

    /** Pago asociado al pedido (fuente del reembolso real). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private PaymentEntity payment;

    /** Código del motivo (DAMAGED_GOODS, WRONG_ITEM, ...). */
    @Column(nullable = false, length = 60)
    private String reason;

    /** Explicación libre del comprador. */
    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReturnStatus status = ReturnStatus.REQUESTED;

    /** Motivo de rechazo / comentario del administrador. */
    @Column(name = "admin_comment", length = 1000)
    private String adminComment;

    /** Monto reembolsado (null hasta ejecutar el reembolso). */
    @Column(name = "refund_amount", precision = 19, scale = 4)
    private BigDecimal refundAmount;

    /** ID del reembolso en la pasarela. */
    @Column(name = "gateway_refund_reference", length = 120)
    private String gatewayRefundReference;

    /**
     * Clave de idempotencia provista por el cliente: evita que un doble
     * click cree dos solicitudes para el mismo pedido.
     */
    @Column(name = "idempotency_key", length = 120)
    private String idempotencyKey;

    /** Productos incluidos en la devolución. */
    @OneToMany(mappedBy = "returnRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReturnItemEntity> items = new ArrayList<>();

    /** URLs de evidencias (fotos/PDF) aportadas por el comprador. */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "return_request_evidences",
        joinColumns = @JoinColumn(name = "return_request_id"))
    @Column(name = "evidence_url", length = 1000)
    private Set<String> evidences = new LinkedHashSet<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ReturnStatus.REQUESTED;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
