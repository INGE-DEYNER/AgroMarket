package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.interfaces.rest.request.RfqOfertaRequest;
import com.agromarket.interfaces.rest.request.RfqRequest;
import com.agromarket.interfaces.rest.response.RfqOfertaResponse;
import com.agromarket.interfaces.rest.response.RfqResponse;

public interface RfqService {
    RfqResponse crear(RfqRequest request, Long compradorId);
    List<RfqResponse> getActivas();
    RfqOfertaResponse ofertar(Long rfqId, RfqOfertaRequest request, Long productorId);
    List<RfqResponse> getMisSolicitudes(Long compradorId);
    void aceptarOferta(Long ofertaId, Long compradorId);
}
