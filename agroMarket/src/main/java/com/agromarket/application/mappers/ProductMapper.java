package com.agromarket.application.mappers;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.agromarket.application.dto.request.product.CreateProductRequest;
import com.agromarket.application.dto.request.product.UpdateProductRequest;
import com.agromarket.application.dto.response.product.ProductResponse;
import com.agromarket.domain.product.model.Product;
import com.agromarket.domain.user.model.User;
import com.agromarket.infrastructure.persistence.sql.entities.ProductEntity;
import com.agromarket.infrastructure.persistence.sql.entities.UserEntity;

/**
 * Mapper de MapStruct para convertir entre la entidad de dominio Product,
 * la entidad JPA ProductEntity y los DTOs de producto.
 * 
 * <p>Este mapper centraliza todas las conversiones relacionadas con productos,
 * evitando código duplicado y manteniendo la consistencia en el mapeo de datos.</p>
 * 
 * @author AgroMarket Team
 */
@Mapper(componentModel = "spring")
public interface ProductMapper {
    
    /**
     * Convierte una entidad JPA ProductEntity a una entidad de dominio Product.
     * 
     * @param entity entidad JPA
     * @return entidad de dominio
     */
    @Mapping(target = "producer", expression = "java(mapUserEntityToUserDomain(entity.getProducer()))")
    Product toDomain(ProductEntity entity);
    
    /**
     * Convierte una entidad de dominio Product a una entidad JPA ProductEntity.
     * 
     * @param domain entidad de dominio
     * @return entidad JPA
     */
    @Mapping(target = "producer", expression = "java(mapUserDomainToUserEntity(domain.getProducer()))")
    ProductEntity toEntity(Product domain);
    
    /**
     * Convierte una entidad de dominio Product a un DTO ProductResponse.
     * 
     * @param domain entidad de dominio
     * @return DTO de respuesta
     */
    @Mapping(target = "producerId", source = "producer.id")
    @Mapping(target = "producerName", expression = "java(getProducerFullName(domain.getProducer()))")
    @Mapping(target = "stock", source = "availableQuantity")
    @Mapping(target = "averageRating", expression = "java(domain.getAverageRating())")
    @Mapping(target = "totalReviews", expression = "java(domain.getReviews() != null ? (long) domain.getReviews().size() : 0L)")
    @Mapping(target = "producerVerified", expression = "java(domain.getProducer() != null ? domain.getProducer().isVerified() : false)")
    @Mapping(target = "category", expression = "java(domain.getFruitType() != null ? domain.getFruitType().name() : \"OTHER\")")
    @Mapping(target = "minWholesaleQuantity", source = "minimumWholesaleQuantity")
    ProductResponse toResponse(Product domain);
    
    /**
     * Convierte una lista de entidades de dominio Product a una lista de DTOs ProductResponse.
     * 
     * @param domains lista de entidades de dominio
     * @return lista de DTOs de respuesta
     */
    List<ProductResponse> toResponseList(List<Product> domains);
    
    /**
     * Convierte una entidad JPA ProductEntity a un DTO ProductResponse.
     * 
     * @param entity entidad JPA
     * @return DTO de respuesta
     */
    @Mapping(target = "producerId", source = "producer.id")
    @Mapping(target = "producerName", expression = "java(getEntityProducerFullName(entity.getProducer()))")
    @Mapping(target = "stock", source = "availableQuantity")
    @Mapping(target = "averageRating", expression = "java(calculateAverageRatingFromEntity(entity))")
    @Mapping(target = "totalReviews", expression = "java(entity.getReviews() != null ? (long) entity.getReviews().size() : 0L)")
    @Mapping(target = "producerVerified", expression = "java(entity.getProducer() != null ? Boolean.TRUE.equals(entity.getProducer().getVerifiedProducer()) : false)")
    @Mapping(target = "category", expression = "java(entity.getFruitType() != null ? entity.getFruitType().name() : \"OTHER\")")
    @Mapping(target = "minWholesaleQuantity", source = "minimumWholesaleQuantity")
    ProductResponse toResponseFromEntity(ProductEntity entity);
    
    /**
     * Convierte una lista de entidades JPA ProductEntity a una lista de DTOs ProductResponse.
     * 
     * @param entities lista de entidades JPA
     * @return lista de DTOs de respuesta
     */
    List<ProductResponse> toResponseListFromEntity(List<ProductEntity> entities);
    
    /**
     * Convierte un CreateProductRequest a una entidad de dominio Product.
     * 
     * @param request DTO de solicitud
     * @return entidad de dominio
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "totalSold", ignore = true)
    @Mapping(target = "producer", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    Product toDomain(CreateProductRequest request);
    
    /**
     * Convierte un UpdateProductRequest a una entidad de dominio Product.
     * 
     * @param request DTO de solicitud
     * @param existingProduct producto existente para actualizar
     * @return entidad de dominio actualizada
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "totalSold", ignore = true)
    @Mapping(target = "producer", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    void updateDomainFromRequest(UpdateProductRequest request, @MappingTarget Product existingProduct);
    
    /**
     * Calcula la calificación promedio desde una ProductEntity.
     */
    default double calculateAverageRatingFromEntity(ProductEntity entity) {
        if (entity == null || entity.getReviews() == null || entity.getReviews().isEmpty()) {
            return 0.0;
        }
        double total = 0;
        for (var review : entity.getReviews()) {
            if (review.getRating() != null) {
                total += review.getRating();
            }
        }
        return total / entity.getReviews().size();
    }
    
    /**
     * Obtiene el nombre completo de un productor desde un User de dominio.
     */
    default String getProducerFullName(User producer) {
        if (producer == null) {
            return null;
        }
        return (producer.getFirstName() != null ? producer.getFirstName() : "") + 
               " " + 
               (producer.getLastName() != null ? producer.getLastName() : "").trim();
    }
    
    /**
     * Obtiene el nombre completo de un productor desde una UserEntity.
     */
    default String getEntityProducerFullName(UserEntity producer) {
        if (producer == null) {
            return null;
        }
        return (producer.getFirstName() != null ? producer.getFirstName() : "") + 
               " " + 
               (producer.getLastName() != null ? producer.getLastName() : "").trim();
    }
    
    /**
     * Mapea una UserEntity a un User de dominio.
     */
    default User mapUserEntityToUserDomain(UserEntity entity) {
        if (entity == null) {
            return null;
        }
        return User.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .role(entity.getUserRole())
                .verifiedProducer(entity.getVerifiedProducer())
                .build();
    }
    
    /**
     * Mapea un User de dominio a una UserEntity.
     */
    default UserEntity mapUserDomainToUserEntity(User domain) {
        if (domain == null) {
            return null;
        }
        return UserEntity.builder()
                .id(domain.getId())
                .build();
    }
}
