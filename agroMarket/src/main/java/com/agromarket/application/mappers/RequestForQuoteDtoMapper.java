package com.agromarket.application.mappers;

import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.dto.request.rfq.CreateQuoteOfferRequest;
import com.agromarket.application.dto.request.rfq.CreateRequestForQuoteRequest;
import com.agromarket.application.dto.response.rfq.QuoteOfferResponse;
import com.agromarket.application.dto.response.rfq.RequestForQuoteResponse;
import com.agromarket.application.dto.response.user.UserResponse;
import com.agromarket.domain.rfq.model.QuoteOffer;
import com.agromarket.domain.rfq.model.RequestForQuote;
import com.agromarket.domain.user.model.User;

import org.springframework.stereotype.Component;

/**
 * Mapper para convertir entre DTOs y objetos de dominio para RFQ.
 * Centraliza la lógica de conversión entre los DTOs de la API y los objetos de dominio.
 * 
 * @author AgroMarket Team
 */
@Component
public class RequestForQuoteDtoMapper {
    
    private final UserMapper userMapper;
    
    public RequestForQuoteDtoMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
    
    /**
     * Convierte un CreateRequestForQuoteRequest a un RequestForQuote de dominio.
     * 
     * @param request el DTO de entrada
     * @param buyer el comprador
     * @return el objeto de dominio RequestForQuote
     */
    public RequestForQuote toDomain(CreateRequestForQuoteRequest request, User buyer) {
        return RequestForQuote.builder()
                .buyer(buyer)
                .fruitType(request.fruitType())
                .requiredQuantity(request.requiredQuantity())
                .description(request.description())
                .deadline(request.deadline())
                .active(true)
                .build();
    }
    
    /**
     * Convierte un CreateQuoteOfferRequest a un QuoteOffer de dominio.
     * 
     * @param request el DTO de entrada
     * @param producer el productor
     * @param requestForQuote la solicitud de cotización asociada
     * @return el objeto de dominio QuoteOffer
     */
    public QuoteOffer toDomain(CreateQuoteOfferRequest request, User producer, RequestForQuote requestForQuote) {
        return QuoteOffer.builder()
                .requestForQuote(requestForQuote)
                .producer(producer)
                .proposedPrice(request.proposedPrice())
                .comments(request.comments())
                .accepted(false)
                .build();
    }
    
    /**
     * Convierte un RequestForQuote de dominio a un RequestForQuoteResponse DTO.
     * 
     * @param domain el objeto de dominio
     * @return el DTO de salida
     */
    public RequestForQuoteResponse toResponse(RequestForQuote domain) {
        List<QuoteOfferResponse> offerResponses = domain.getOffers().stream()
                .map(this::toOfferResponse)
                .collect(Collectors.toList());
        
        return new RequestForQuoteResponse(
                domain.getId(),
                userMapper.toResponse(domain.getBuyer()),
                domain.getFruitType(),
                domain.getRequiredQuantity(),
                domain.getDescription(),
                domain.getDeadline(),
                domain.isActive(),
                domain.getCreatedAt(),
                offerResponses
        );
    }
    
    /**
     * Convierte un QuoteOffer de dominio a un QuoteOfferResponse DTO.
     * 
     * @param domain el objeto de dominio
     * @return el DTO de salida
     */
    public QuoteOfferResponse toOfferResponse(QuoteOffer domain) {
        return new QuoteOfferResponse(
                domain.getId(),
                toResponse(domain.getRequestForQuote()),
                userMapper.toResponse(domain.getProducer()),
                domain.getProposedPrice(),
                domain.getComments(),
                domain.isAccepted(),
                domain.getCreatedAt()
        );
    }
    
    /**
     * Convierte una lista de RequestForQuote a una lista de RequestForQuoteResponse.
     * 
     * @param domains la lista de objetos de dominio
     * @return la lista de DTOs
     */
    public List<RequestForQuoteResponse> toResponseList(List<RequestForQuote> domains) {
        return domains.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
