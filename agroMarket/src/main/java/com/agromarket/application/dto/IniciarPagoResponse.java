package com.agromarket.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IniciarPagoResponse {
    private Long pagoId;
    private String urlPasarela;
    private String referencia;
}
