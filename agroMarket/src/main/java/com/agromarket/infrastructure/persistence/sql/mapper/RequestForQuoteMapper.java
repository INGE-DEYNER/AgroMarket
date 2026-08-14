package com.agromarket.infrastructure.persistence.sql.mapper;

import org.springframework.stereotype.Component;

import com.agromarket.domain.rfq.model.QuoteOffer;
import com.agromarket.domain.rfq.model.RequestForQuote;
import com.agromarket.domain.user.model.User;
import com.agromarket.infrastructure.persistence.sql.entities.QuoteOfferEntity;
import com.agromarket.infrastructure.persistence.sql.entities.RequestForQuoteEntity;

import lombok.RequiredArgsConstructor;

/**
 * Mapper para convertir entre entidades JPA y objetos de dominio para RFQ.
 * Este mapper gestiona la conversión entre RequestForQuoteEntity/QuoteOfferEntity
 * y sus equivalentes en el dominio RequestForQuote/QuoteOffer.
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class RequestForQuoteMapper {

    private final UserMapper userMapper;

    /**
     * Convierte una entidad JPA a un objeto de dominio RequestForQuote.
     * 
     * @param entity la entidad JPA a convertir
     * @return el objeto de dominio RequestForQuote, o null si la entidad es null
     */
    public RequestForQuote toDomain(RequestForQuoteEntity entity) {
        if (entity == null) return null;
        return RequestForQuote.builder()
                .id(entity.getId())
                .buyer(userMapper.toDomain(entity.getBuyer()))
                .fruitType(entity.getFruitType())
                .requiredQuantity(entity.getRequiredQuantity())
                .description(entity.getDescription())
                .deadline(entity.getDeadline())
                .active(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    /**
     * Convierte un objeto de dominio RequestForQuote a una entidad JPA.
     * 
     * @param domain el objeto de dominio a convertir
     * @return la entidad JPA, o null si el dominio es null
     */
    public RequestForQuoteEntity toEntity(RequestForQuote domain) {
        if (domain == null) return null;
        return RequestForQuoteEntity.builder()
                .id(domain.getId())
                .buyer(userMapper.toEntity(domain.getBuyer()))
                .fruitType(domain.getFruitType())
                .requiredQuantity(domain.getRequiredQuantity())
                .description(domain.getDescription())
                .deadline(domain.getDeadline())
                .active(domain.isActive())
                .createdAt(domain.getCreatedAt())
                .build();
    }

    /**
     * Convierte una entidad JPA a un objeto de dominio QuoteOffer.
     * 
     * @param entity la entidad JPA a convertir
     * @return el objeto de dominio QuoteOffer, o null si la entidad es null
     */
    public QuoteOffer toQuoteOfferDomain(QuoteOfferEntity entity) {
        if (entity == null) return null;
        return QuoteOffer.builder()
                .id(entity.getId())
                .requestForQuote(toDomain(entity.getRequestForQuote()))
                .producer(userMapper.toDomain(entity.getProducer()))
                .proposedPrice(entity.getProposedPrice())
                .comments(entity.getComments())
                .accepted(entity.isAccepted())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    /**
     * Convierte un objeto de dominio QuoteOffer a una entidad JPA.
     * 
     * @param domain el objeto de dominio a convertir
     * @return la entidad JPA, o null si el dominio es null
     */
    public QuoteOfferEntity toQuoteOfferEntity(QuoteOffer domain) {
        if (domain == null) return null;
        return QuoteOfferEntity.builder()
                .id(domain.getId())
                .requestForQuote(toEntity(domain.getRequestForQuote()))
                .producer(userMapper.toEntity(domain.getProducer()))
                .proposedPrice(domain.getProposedPrice())
                .comments(domain.getComments())
                .accepted(domain.isAccepted())
                .createdAt(domain.getCreatedAt())
                .build();
    }
}
