package com.agromarket.infrastructure.persistence.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.agromarket.domain.model.TipoFruta;

import lombok.Builder;
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
import org.hibernate.annotations.BatchSize;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

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
public class ProductoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer cantidadDisponible;

    private String imagenUrl;

    @Column(nullable = true)
    private Integer cantidadMinimaMayorista;

    @Column(nullable = true, precision = 19, scale = 2)
    private BigDecimal precioMayorista;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoFruta tipoFruta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productor_id", nullable = false)
    private ProductorEntity productor;

    @Column(nullable = false)
    private boolean enPromocion;

    @Column(nullable = true, precision = 19, scale = 2)
    private BigDecimal precioPromocion;

    @Column(nullable = true)
    private LocalDateTime fechaFinPromocion;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalVendido = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    @Builder.Default
    private List<ResenaEntity> resenas = new ArrayList<>();

    @jakarta.persistence.Version
    @Column(name = "version")
    private Long version;
}
