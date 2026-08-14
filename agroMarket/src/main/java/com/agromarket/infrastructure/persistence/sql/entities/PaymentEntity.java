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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import com.agromarket.domain.payment.enums.PaymentMethod;
import com.agromarket.domain.payment.enums.PaymentState;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad JPA que representa un pago en la base de datos.
 * Mapea la tabla "pagos" y contiene todos los campos necesarios para la persistencia
 * de los pagos en el sistema AgroMarket.
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
@Table(name = "pagos", indexes = {
    @jakarta.persistence.Index(name = "idx_pago_pedido", columnList = "pedido_id"),
    @jakarta.persistence.Index(name = "idx_pago_estado", columnList = "estado")
})
public class PaymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private OrderEntity order;

    @Column(name = "monto", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodoPago", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private PaymentState state;

    @Column(name = "referencia_pasarela")
    private String gatewayReference;

    @Column(name = "fecha_pago")
    private LocalDateTime paymentDate;

    @Column(name = "url_pago")
    private String paymentUrl;
}
