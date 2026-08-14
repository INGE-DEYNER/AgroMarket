package com.agromarket.application.usecases.rfq;

import java.util.List;

import com.agromarket.application.dto.request.rfq.CreateQuoteOfferRequest;
import com.agromarket.application.dto.request.rfq.CreateRequestForQuoteRequest;
import com.agromarket.application.dto.response.rfq.QuoteOfferResponse;
import com.agromarket.application.dto.response.rfq.RequestForQuoteResponse;
import com.agromarket.application.mappers.RequestForQuoteDtoMapper;
import com.agromarket.application.ports.in.RequestForQuoteService;
import com.agromarket.domain.rfq.model.QuoteOffer;
import com.agromarket.domain.rfq.model.RequestForQuote;
import com.agromarket.domain.rfq.ports.out.QuoteOfferRepository;
import com.agromarket.domain.rfq.ports.out.RequestForQuoteRepository;
import com.agromarket.domain.user.enums.Role;
import com.agromarket.domain.user.model.User;
import com.agromarket.domain.user.ports.out.UserRepository;
import com.agromarket.product.exceptions.ProductNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementación del servicio de solicitudes de cotización (Request for Quote).
 * Orquestra las operaciones de negocio relacionadas con RFQ.
 * 
 * @author AgroMarket Team
 */
@Slf4j
@RequiredArgsConstructor
public class RequestForQuoteServiceImpl implements RequestForQuoteService {
    
    private final RequestForQuoteRepository requestForQuoteRepository;
    private final QuoteOfferRepository quoteOfferRepository;
    private final UserRepository userRepository;
    private final RequestForQuoteDtoMapper rfqDtoMapper;
    
    @Override
    public RequestForQuoteResponse create(CreateRequestForQuoteRequest request, Long buyerId) {
        // Validar que el comprador existe y tiene rol BUYER
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ProductNotFoundException("Comprador no encontrado con ID: " + buyerId));
        
        if (buyer.getRole() != Role.BUYER) {
            throw new IllegalArgumentException("El usuario no es un comprador válido");
        }
        
        // Convertir DTO a objeto de dominio
        RequestForQuote requestForQuote = rfqDtoMapper.toDomain(request, buyer);
        
        // Guardar en el repositorio
        RequestForQuote saved = requestForQuoteRepository.save(requestForQuote);
        
        // Convertir a DTO de respuesta
        return rfqDtoMapper.toResponse(saved);
    }
    
    @Override
    public List<RequestForQuoteResponse> getActive() {
        List<RequestForQuote> activeRequests = requestForQuoteRepository.findAllActive();
        return rfqDtoMapper.toResponseList(activeRequests);
    }
    
    @Override
    public QuoteOfferResponse offer(Long requestForQuoteId, CreateQuoteOfferRequest request, Long producerId) {
        // Validar que el productor existe y tiene rol PRODUCER
        User producer = userRepository.findById(producerId)
                .orElseThrow(() -> new ProductNotFoundException("Productor no encontrado con ID: " + producerId));
        
        if (producer.getRole() != Role.PRODUCER) {
            throw new IllegalArgumentException("El usuario no es un productor válido");
        }
        
        // Validar que la solicitud de cotización existe y está activa
        RequestForQuote requestForQuote = requestForQuoteRepository.findById(requestForQuoteId)
                .orElseThrow(() -> new ProductNotFoundException("Solicitud de cotización no encontrada con ID: " + requestForQuoteId));
        
        if (!requestForQuote.isActive()) {
            throw new IllegalArgumentException("No se puede ofertar en una solicitud de cotización inactiva");
        }
        
        // Verificar que el productor no ha enviado una oferta previamente
        boolean hasExistingOffer = quoteOfferRepository.existsByRequestForQuoteIdAndProducerId(requestForQuoteId, producerId);
        if (hasExistingOffer) {
            throw new IllegalArgumentException("Ya has enviado una oferta para esta solicitud de cotización");
        }
        
        // Convertir DTO a objeto de dominio
        QuoteOffer quoteOffer = rfqDtoMapper.toDomain(request, producer, requestForQuote);
        
        // Guardar en el repositorio
        QuoteOffer saved = quoteOfferRepository.save(quoteOffer);
        
        // Convertir a DTO de respuesta
        return rfqDtoMapper.toOfferResponse(saved);
    }
    
    @Override
    public List<RequestForQuoteResponse> getMyRequests(Long buyerId) {
        // Validar que el comprador existe
        userRepository.findById(buyerId)
                .orElseThrow(() -> new ProductNotFoundException("Comprador no encontrado con ID: " + buyerId));
        
        List<RequestForQuote> myRequests = requestForQuoteRepository.findByBuyerId(buyerId);
        return rfqDtoMapper.toResponseList(myRequests);
    }
    
    @Override
    public void acceptOffer(Long offerId, Long buyerId) {
        // Validar que el comprador existe y tiene rol BUYER
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ProductNotFoundException("Comprador no encontrado con ID: " + buyerId));
        
        if (buyer.getRole() != Role.BUYER) {
            throw new IllegalArgumentException("El usuario no es un comprador válido");
        }
        
        // Obtener la oferta
        QuoteOffer quoteOffer = quoteOfferRepository.findById(offerId)
                .orElseThrow(() -> new ProductNotFoundException("Oferta no encontrada con ID: " + offerId));
        
        // Validar que la oferta pertenece a una solicitud del comprador
        if (!quoteOffer.getRequestForQuote().getBuyer().getId().equals(buyerId)) {
            throw new IllegalArgumentException("No puedes aceptar una oferta que no es para tu solicitud");
        }
        
        // Validar que la solicitud está activa
        if (!quoteOffer.getRequestForQuote().isActive()) {
            throw new IllegalArgumentException("No se puede aceptar una oferta para una solicitud inactiva");
        }
        
        // Aceptar la oferta
        quoteOffer.setAccepted(true);
        quoteOfferRepository.save(quoteOffer);
        
        // Inactivar la solicitud de cotización
        RequestForQuote requestForQuote = quoteOffer.getRequestForQuote();
        requestForQuote.setActive(false);
        requestForQuoteRepository.save(requestForQuote);
        
        // TODO: Crear el pedido correspondiente (implementación pendiente)
        log.info("Oferta {} aceptada por comprador {}, solicitud de cotización {} inactivada", 
                offerId, buyerId, requestForQuote.getId());
    }
}
