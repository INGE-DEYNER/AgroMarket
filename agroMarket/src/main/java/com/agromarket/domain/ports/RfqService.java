package com.agromarket.domain.ports;

import java.util.List;

import com.agromarket.application.api.request.RfqOfertaRequest;
import com.agromarket.application.api.request.RfqRequest;
import com.agromarket.application.api.response.RfqOfertaResponse;
import com.agromarket.application.api.response.RfqResponse;

public interface RfqService {
    RfqResponse crear(RfqRequest request, Long compradorId);
    List<RfqResponse> getActivas();
    RfqOfertaResponse ofertar(Long rfqId, RfqOfertaRequest request, Long productorId);
    List<RfqResponse> getMisSolicitudes(Long compradorId);
    void aceptarOferta(Long ofertaId, Long compradorId);
}
