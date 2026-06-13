package com.agromarket.application.service;

import java.util.List;
import com.agromarket.application.dto.RfqRequest;
import com.agromarket.application.dto.RfqOfertaRequest;
import com.agromarket.application.dto.RfqResponse;
import com.agromarket.application.dto.RfqOfertaResponse;

public interface RfqService {
    RfqResponse crear(RfqRequest request, Long compradorId);
    List<RfqResponse> getActivas();
    RfqOfertaResponse ofertar(Long rfqId, RfqOfertaRequest request, Long productorId);
    List<RfqResponse> getMisSolicitudes(Long compradorId);
    void aceptarOferta(Long ofertaId, Long compradorId);
}
