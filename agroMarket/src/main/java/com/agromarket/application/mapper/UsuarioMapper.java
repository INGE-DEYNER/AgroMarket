package com.agromarket.application.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.api.response.UsuarioResponse;
import com.agromarket.application.persistence.sql.entities.AdministradorEntity;
import com.agromarket.application.persistence.sql.entities.CompradorEntity;
import com.agromarket.application.persistence.sql.entities.ProductorEntity;
import com.agromarket.application.persistence.sql.entities.UsuarioEntity;
import com.agromarket.domain.models.Administrador;
import com.agromarket.domain.models.Comprador;
import com.agromarket.domain.models.Productor;
import com.agromarket.domain.models.Usuario;
import com.agromarket.domain.models.enums.RolUsuario;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    default UsuarioResponse toResponse(UsuarioEntity entity) {
        if (entity == null) {
            return null;
        }
        boolean isComplete = Boolean.TRUE.equals(entity.getCuentaCompleta()) || (entity.getCedula() != null && !entity.getCedula().isBlank() && entity.getFechaNacimiento() != null);
        return UsuarioResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .correo(entity.getCorreo())
                .telefono(entity.getTelefono())
                .rol(entity.getRol())
                .activo(entity.isActivo())
                .aprobado(entity.isAprobado())
                .twoFactorEnabled(entity.isTotpEnabled())
                .ubicacion(entity.getUbicacion())
                .emailVerificado(entity.isEmailVerificado())
                .proveedor(entity.getProveedor())
                .verificado(entity instanceof ProductorEntity productorEntity ? Boolean.TRUE.equals(productorEntity.getVerificado()) : false)
                .apellido(entity.getApellido())
                .cedula(entity.getCedula())
                .fechaNacimiento(entity.getFechaNacimiento())
                .tipoDocumento(entity.getTipoDocumento())
                .nombreEmpresa(entity.getNombreEmpresa())
                .nit(entity.getNit())
                .esEmpresa(entity.getEsEmpresa())
                .cuentaCompleta(isComplete)
                .estadoCuenta(entity.getEstadoCuenta())
                .codigoPais(entity.getCodigoPais())
                .fotoUrl(entity.getFotoUrl() != null ? entity.getFotoUrl() : entity.getFoto())
                .cuponPrimerEnvioUsado(entity.getCuponPrimerEnvioUsado())
                .divisaPreferida(entity.getDivisaPreferida() != null ? entity.getDivisaPreferida() : "COP")
                .departamento(entity.getDepartamento())
                .ciudad(entity.getCiudad())
                .direccionCompleta(entity.getDireccionCompleta())
                .referencia(entity.getReferencia())
                .codigoPostal(entity.getCodigoPostal())
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
