package com.agromarket.infrastructure.persistence.sql.entities;

import java.util.ArrayList;
import java.util.List;

import lombok.Builder;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@DiscriminatorValue("PRODUCTOR")
public class ProductorEntity extends UsuarioEntity {
    @Column(nullable = true)
    @Builder.Default
    private Boolean verificado = false;

    @OneToMany(mappedBy = "productor", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductoEntity> productosPublicados = new ArrayList<>();
}
