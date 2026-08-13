package com.agromarket.infrastructure.persistence.sql.entities;

import com.agromarket.domain.models.enums.TipoTarjeta;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tarjetas_pago")
public class TarjetaPago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTarjeta tipoTarjeta;

    @Column(nullable = false, length = 4)
    private String ultimosCuatroDigitos;

    @Column(nullable = false)
    private String tokenPasarela;

    @Column(nullable = false)
    @Builder.Default
    private boolean predeterminada = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean activa = true;
}
