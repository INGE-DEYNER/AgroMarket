package com.agromarket.application.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.domain.model.Administrador;
import com.agromarket.domain.model.Comprador;
import com.agromarket.domain.model.Productor;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.domain.model.Usuario;
import com.agromarket.infrastructure.persistence.entity.AdministradorEntity;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    default UsuarioResponse toResponse(UsuarioEntity entity) {
        if (entity == null) {
            return null;
        }
        return UsuarioResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .correo(entity.getCorreo())
                .telefono(entity.getTelefono())
                .rol(entity.getRol())
                .activo(entity.isActivo())
                .aprobado(entity.isAprobado())
                .twoFactorEnabled(entity.isTotpEnabled())
                .ubicacion(entity instanceof ProductorEntity productorEntity ? productorEntity.getUbicacion() : null)
                .build();
    }

    default Usuario toDomain(UsuarioEntity entity) {
        if (entity == null) {
            return null;
        }
        if (entity instanceof ProductorEntity productorEntity) {
            return Productor.builder()
                    .id(productorEntity.getId())
                    .nombre(productorEntity.getNombre())
                    .correo(productorEntity.getCorreo())
                    .contrasena(productorEntity.getContrasena())
                    .telefono(productorEntity.getTelefono())
                    .rol(productorEntity.getRol())
                    .activo(productorEntity.isActivo())
                    .fechaRegistro(productorEntity.getFechaRegistro())
                    .ubicacion(productorEntity.getUbicacion())
                    .build();
        }
        if (entity instanceof CompradorEntity compradorEntity) {
            return Comprador.builder()
                    .id(compradorEntity.getId())
                    .nombre(compradorEntity.getNombre())
                    .correo(compradorEntity.getCorreo())
                    .contrasena(compradorEntity.getContrasena())
                    .telefono(compradorEntity.getTelefono())
                    .rol(compradorEntity.getRol())
                    .activo(compradorEntity.isActivo())
                    .fechaRegistro(compradorEntity.getFechaRegistro())
                    .build();
        }
        if (entity instanceof AdministradorEntity administradorEntity) {
            return Administrador.builder()
                    .id(administradorEntity.getId())
                    .nombre(administradorEntity.getNombre())
                    .correo(administradorEntity.getCorreo())
                    .contrasena(administradorEntity.getContrasena())
                    .telefono(administradorEntity.getTelefono())
                    .rol(administradorEntity.getRol())
                    .activo(administradorEntity.isActivo())
                    .fechaRegistro(administradorEntity.getFechaRegistro())
                    .build();
        }
        return null;
    }

    default List<UsuarioResponse> toResponseList(List<UsuarioEntity> entities) {
        return entities == null ? List.of() : entities.stream().map(this::toResponse).collect(Collectors.toList());
    }

    default RolUsuario toRol(Usuario usuario) {
        return usuario == null ? null : usuario.getRol();
    }
}
