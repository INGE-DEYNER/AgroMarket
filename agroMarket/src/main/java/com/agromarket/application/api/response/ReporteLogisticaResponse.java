package com.agromarket.application.api.response;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteLogisticaResponse {
    private long totalEnvios;
    private Map<String, Long> enviosPorEstado;
    private Map<String, Long> enviosPorTransportista;
}
