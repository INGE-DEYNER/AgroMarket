package com.agromarket.infrastructure.persistence.sql.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;

import com.agromarket.domain.product.enums.FruitType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad JPA que representa un producto en la base de datos.
 * Mapea la tabla "productos" y contiene todos los campos necesarios para la persistencia
 * de la información de productos en el sistema AgroMarket.
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
@Table(name = "productos", indexes = {
    @jakarta.persistence.Index(name = "idx_producto_activo_cant", columnList = "activo, cantidadDisponible"),
    @jakarta.persistence.Index(name = "idx_producto_fecha", columnList = "fechaCreacion"),
    @jakarta.persistence.Index(name = "idx_producto_productor", columnList = "productor_id"),
    @jakarta.persistence.Index(name = "idx_producto_tipo", columnList = "tipoFruta")
})
public class ProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String name;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String description;

    @Column(name = "precio", nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Column(name = "cantidadDisponible", nullable = false)
    private Integer availableQuantity;

    @Column(name = "imagenUrl")
    private String imageUrl;

    @Column(name = "cantidadMinimaMayorista", nullable = true)
    private Integer minimumWholesaleQuantity;

    @Column(name = "precioMayorista", nullable = true, precision = 19, scale = 2)
    private BigDecimal wholesalePrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipoFruta", nullable = false)
    private FruitType fruitType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productor_id", nullable = false)
    private UserEntity producer;

    @Column(name = "enPromocion", nullable = false)
    private boolean onPromotion;

    @Column(name = "precioPromocion", nullable = true, precision = 19, scale = 2)
    private BigDecimal promotionPrice;

    @Column(name = "fechaFinPromocion", nullable = true)
    private LocalDateTime promotionEndDate;

    @Column(name = "totalVendido", nullable = false)
    @Builder.Default
    private Integer totalSold = 0;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "fechaCreacion", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    @Builder.Default
    private List<ReviewEntity> reviews = new ArrayList<>();

    @Version
    @Column(name = "version")
    private Long version;
}
