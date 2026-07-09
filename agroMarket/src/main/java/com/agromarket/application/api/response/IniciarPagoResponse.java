package com.agromarket.application.api.response;

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
