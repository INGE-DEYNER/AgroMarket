package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.application.dto.request.rfq.CreateQuoteOfferRequest;
import com.agromarket.application.dto.request.rfq.CreateRequestForQuoteRequest;
import com.agromarket.application.dto.response.rfq.QuoteOfferResponse;
import com.agromarket.application.dto.response.rfq.RequestForQuoteResponse;

/**
 * Puerto de entrada que define el contrato para los casos de uso de solicitudes de cotización (RFQ).
 * Este puerto define las operaciones que pueden realizarse sobre solicitudes de cotización
 * sin exponer detalles de implementación.
 * 
 * @author AgroMarket Team
 */
public interface RequestForQuoteService {
    
    /**
     * Crea una nueva solicitud de cotización.
     * 
     * @param request datos de la solicitud de cotización
     * @param buyerId ID del comprador que crea la solicitud
     * @return la solicitud de cotización creada
     */
    RequestForQuoteResponse create(CreateRequestForQuoteRequest request, Long buyerId);
    
    /**
     * Obtiene todas las solicitudes de cotización activas.
     * 
     * @return lista de solicitudes de cotización activas
     */
    List<RequestForQuoteResponse> getActive();
    
    /**
     * Envía una oferta para una solicitud de cotización.
     * 
     * @param requestForQuoteId ID de la solicitud de cotización
     * @param request datos de la oferta
     * @param producerId ID del productor que envía la oferta
     * @return la oferta creada
     */
    QuoteOfferResponse offer(Long requestForQuoteId, CreateQuoteOfferRequest request, Long producerId);
    
    /**
     * Obtiene las solicitudes de cotización creadas por un comprador.
     * 
     * @param buyerId ID del comprador
     * @return lista de solicitudes de cotización del comprador
     */
    List<RequestForQuoteResponse> getMyRequests(Long buyerId);
    
    /**
     * Acepta una oferta para una solicitud de cotización.
     * Al aceptar, se crea el pedido correspondiente.
     * 
     * @param offerId ID de la oferta a aceptar
     * @param buyerId ID del comprador que acepta la oferta
     */
    void acceptOffer(Long offerId, Long buyerId);
}
