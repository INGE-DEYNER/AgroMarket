package com.agromarket.domain.models;

import java.util.ArrayList;
import java.util.List;

import lombok.Builder;
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
public class Comprador extends Usuario {
    @Builder.Default
    private List<Pedido> historialPedidos = new ArrayList<>();
}
