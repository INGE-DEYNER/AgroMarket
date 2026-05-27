package com.agromarket.infrastructure.persistence.entity;

import java.util.ArrayList;
import java.util.List;

import lombok.Builder;
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
@DiscriminatorValue("COMPRADOR")
public class CompradorEntity extends UsuarioEntity {
    @OneToMany(mappedBy = "comprador", fetch = FetchType.LAZY)
    @Builder.Default
    private List<PedidoEntity> historialPedidos = new ArrayList<>();
}
