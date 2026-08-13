package com.agromarket.infrastructure.persistence.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.SubclassExhaustiveStrategy;
import org.mapstruct.SubclassMapping;

import com.agromarket.domain.models.Administrador;
import com.agromarket.domain.models.Comprador;
import com.agromarket.domain.models.Productor;
import com.agromarket.domain.models.Usuario;
import com.agromarket.domain.models.enums.RolUsuario;
import com.agromarket.infrastructure.persistence.sql.entities.AdministradorEntity;
import com.agromarket.infrastructure.persistence.sql.entities.CompradorEntity;
import com.agromarket.infrastructure.persistence.sql.entities.ProductorEntity;
import com.agromarket.infrastructure.persistence.sql.entities.UsuarioEntity;
import com.agromarket.interfaces.rest.response.UsuarioResponse;

@Mapper(componentModel = "spring", subclassExhaustiveStrategy = SubclassExhaustiveStrategy.RUNTIME_EXCEPTION)
public interface UsuarioMapper {

    @SubclassMapping(source = ProductorEntity.class, target = Productor.class)
    @SubclassMapping(source = CompradorEntity.class, target = Comprador.class)
    @SubclassMapping(source = AdministradorEntity.class, target = Administrador.class)
    Usuario toDomain(UsuarioEntity entity);

    @SubclassMapping(source = Productor.class, target = ProductorEntity.class)
    @SubclassMapping(source = Comprador.class, target = CompradorEntity.class)
    @SubclassMapping(source = Administrador.class, target = AdministradorEntity.class)
    UsuarioEntity toEntity(Usuario domain);

    @Mapping(target = "twoFactorEnabled", source = "totpEnabled")
    @Mapping(target = "verificado", expression = "java(usuario instanceof com.agromarket.domain.models.Productor ? ((com.agromarket.domain.models.Productor) usuario).getVerificado() : false)")
    UsuarioResponse toResponse(Usuario usuario);

    List<UsuarioResponse> toResponseList(List<Usuario> usuarios);
    
    // For legacy usecases still using entity during transition
    @Mapping(target = "twoFactorEnabled", source = "totpEnabled")
    @Mapping(target = "verificado", expression = "java(entity instanceof com.agromarket.infrastructure.persistence.sql.entities.ProductorEntity ? ((com.agromarket.infrastructure.persistence.sql.entities.ProductorEntity) entity).getVerificado() : false)")
    UsuarioResponse toResponseFromEntity(UsuarioEntity entity);

    List<UsuarioResponse> toResponseListFromEntity(List<UsuarioEntity> entities);

    default RolUsuario toRol(Usuario usuario) {
        return usuario == null ? null : usuario.getRol();
    }
}
