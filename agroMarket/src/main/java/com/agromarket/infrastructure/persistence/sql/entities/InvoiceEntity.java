package com.agromarket.infrastructure.persistence.sql.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad JPA que representa una factura en la base de datos.
 * Mapea la tabla "facturas" y contiene todos los campos necesarios para la persistencia
 * de las facturas en el sistema AgroMarket.
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
@Table(name = "facturas", indexes = {
    @jakarta.persistence.Index(name = "idx_factura_pedido", columnList = "pedido_id")
})
public class InvoiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private OrderEntity order;

    @Column(name = "subtotal", nullable = false, precision = 19, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "impuesto", nullable = false, precision = 19, scale = 2)
    private BigDecimal tax;

    @Column(name = "total", nullable = false, precision = 19, scale = 2)
    private BigDecimal total;

    @Column(name = "numero_factura", unique = true)
    private String invoiceNumber;

    @Column(name = "fecha_factura", nullable = false, updatable = false)
    private LocalDateTime invoiceDate;

    @Column(name = "archivo_pdf_url")
    private String pdfFileUrl;
}
