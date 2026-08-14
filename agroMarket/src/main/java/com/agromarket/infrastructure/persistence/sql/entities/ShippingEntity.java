package com.agromarket.infrastructure.persistence.sql.entities;

import java.time.LocalDate;
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

import org.hibernate.annotations.CreationTimestamp;

import com.agromarket.domain.shipping.enums.ShippingState;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad JPA que representa un envío en la base de datos.
 * Mapea la tabla "envios" y contiene todos los campos necesarios para la persistencia
 * de los envíos en el sistema AgroMarket.
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
@Table(name = "envios")
public class ShippingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private OrderEntity order;

    @Column(name = "direccionDestino", nullable = false)
    private String destinationAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private ShippingState state;

    @Column(name = "transportista")
    private String carrier;

    @Column(name = "guia")
    private String trackingNumber;

    @Column(name = "fechaEstimadaEntrega")
    private LocalDate estimatedDeliveryDate;

    @Column(name = "origen", nullable = false)
    @Builder.Default
    private String origin = "Chigorodó, Antioquia";

    @CreationTimestamp
    @Column(name = "fechaCreacion", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
