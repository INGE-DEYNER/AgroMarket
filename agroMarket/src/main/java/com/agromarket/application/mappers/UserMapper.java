package com.agromarket.application.mappers;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.agromarket.application.dto.request.user.RegisterRequest;
import com.agromarket.application.dto.request.user.UpdateProfileRequest;
import com.agromarket.application.dto.response.user.UserResponse;
import com.agromarket.domain.user.enums.Role;
import com.agromarket.domain.user.model.User;
import com.agromarket.infrastructure.persistence.sql.entities.UserEntity;

/**
 * Mapper de MapStruct para convertir entre la entidad de dominio User,
 * la entidad JPA UserEntity y los DTOs de usuario.
 * 
 * <p>Este mapper centraliza todas las conversiones relacionadas con usuarios,
 * evitando código duplicado y manteniendo la consistencia en el mapeo de datos.</p>
 * 
 * @author AgroMarket Team
 */
@Mapper(componentModel = "spring")
public interface UserMapper {
    
    /**
     * Convierte una entidad JPA UserEntity a una entidad de dominio User.
     * 
     * @param entity entidad JPA
     * @return entidad de dominio
     */
    @Mapping(target = "role", expression = "java(mapRoleFromEntity(entity.getUserRole()))")
    @Mapping(target = "providerId", source = "provider")
    User toDomain(UserEntity entity);
    
    /**
     * Convierte una entidad de dominio User a una entidad JPA UserEntity.
     * 
     * @param domain entidad de dominio
     * @return entidad JPA
     */
    @Mapping(target = "userRole", expression = "java(mapRoleToString(domain.getRole()))")
    @Mapping(target = "provider", source = "providerId")
    UserEntity toEntity(User domain);
    
    /**
     * Convierte una entidad de dominio User a un DTO UserResponse.
     * 
     * @param user entidad de dominio
     * @return DTO de respuesta
     */
    @Mapping(target = "role", expression = "java(mapRole(user.getRole()))")
    @Mapping(target = "encryptedId", ignore = true)
    @Mapping(target = "verified", source = "verifiedProducer")
    UserResponse toResponse(User user);
    
    /**
     * Convierte una lista de usuarios a una lista de DTOs UserResponse.
     * 
     * @param users lista de entidades de dominio
     * @return lista de DTOs de respuesta
     */
    List<UserResponse> toResponseList(List<User> users);
    
    /**
     * Convierte un RegisterRequest a una entidad de dominio User.
     * 
     * @param request DTO de solicitud de registro
     * @return entidad de dominio
     */
    @Mapping(target = "role", expression = "java(mapRoleFromString(request.getRole()))")
    @Mapping(target = "countryCode", source = "request.countryCode")
    @Mapping(target = "location", source = "request.location")
    @Mapping(target = "idNumber", source = "request.idNumber")
    @Mapping(target = "birthDate", source = "request.birthDate")
    @Mapping(target = "idType", source = "request.idType")
    @Mapping(target = "companyName", source = "request.companyName")
    @Mapping(target = "nit", source = "request.nit")
    @Mapping(target = "isCompany", expression = "java(request.getNit() != null)")
    @Mapping(target = "preferredCurrency", source = "request.preferredCurrency")
    @Mapping(target = "department", source = "request.department")
    @Mapping(target = "city", source = "request.city")
    @Mapping(target = "fullAddress", source = "request.fullAddress")
    @Mapping(target = "addressReference", source = "request.addressReference")
    @Mapping(target = "postalCode", source = "request.postalCode")
    User fromRegisterRequest(RegisterRequest request);
    
    /**
     * Actualiza una entidad de dominio User con los datos de UpdateProfileRequest.
     * 
     * @param request DTO de solicitud de actualización
     * @param user entidad de dominio a actualizar
     */
    @Mapping(target = "firstName", source = "request.firstName")
    @Mapping(target = "lastName", source = "request.lastName")
    @Mapping(target = "phone", source = "request.phone")
    @Mapping(target = "countryCode", source = "request.countryCode")
    @Mapping(target = "location", source = "request.location")
    @Mapping(target = "idNumber", source = "request.idNumber")
    @Mapping(target = "birthDate", source = "request.birthDate")
    @Mapping(target = "idType", source = "request.idType")
    @Mapping(target = "companyName", source = "request.companyName")
    @Mapping(target = "nit", source = "request.nit")
    @Mapping(target = "photoUrl", source = "request.photoUrl")
    @Mapping(target = "preferredCurrency", source = "request.preferredCurrency")
    @Mapping(target = "department", source = "request.department")
    @Mapping(target = "city", source = "request.city")
    @Mapping(target = "fullAddress", source = "request.fullAddress")
    @Mapping(target = "addressReference", source = "request.addressReference")
    @Mapping(target = "postalCode", source = "request.postalCode")
    void updateUserFromRequest(UpdateProfileRequest request, @MappingTarget User user);
    
    /**
     * Mapea un Role (enum) a un string.
     * 
     * @param role rol como enum
     * @return rol como string
     */
    default String mapRoleToString(Role role) {
        return role == null ? null : role.name();
    }
    
    /**
     * Mapea un string a un Role (enum).
     * 
     * @param role rol como string
     * @return rol como enum
     */
    default Role mapRoleFromString(String role) {
        if (role == null) {
            return null;
        }
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    /**
     * Mapea un Role (enum) desde UserEntity a Role.
     * 
     * @param role rol como enum desde la entidad
     * @return rol como enum de dominio
     */
    default Role mapRoleFromEntity(Role role) {
        return role;
    }
    
    /**
     * Mapea un Role (enum) a un string para el DTO.
     * 
     * @param role rol como enum
     * @return rol como string
     */
    default String mapRole(Role role) {
        return role == null ? null : role.name();
    }
}
