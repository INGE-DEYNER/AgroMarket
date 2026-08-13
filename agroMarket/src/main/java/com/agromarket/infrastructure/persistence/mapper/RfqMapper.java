package com.agromarket.infrastructure.persistence.mapper;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Rfq;
import com.agromarket.domain.models.RfqOferta;
import com.agromarket.infrastructure.persistence.sql.entities.RfqEntity;
import com.agromarket.infrastructure.persistence.sql.entities.RfqOfertaEntity;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RfqMapper {

    private final UsuarioMapper usuarioMapper;

    public Rfq toDomain(RfqEntity entity) {
        if (entity == null) return null;
        return Rfq.builder()
                .id(entity.getId())
                .comprador(usuarioMapper.toDomain(entity.getComprador()))
                .tipoFruta(entity.getTipoFruta())
                .cantidadRequerida(entity.getCantidadRequerida())
                .descripcion(entity.getDescripcion())
                .fechaLimite(entity.getFechaLimite())
                .activo(entity.isActivo())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }

    public RfqEntity toEntity(Rfq domain) {
        if (domain == null) return null;
        return RfqEntity.builder()
                .id(domain.getId())
                .comprador(usuarioMapper.toEntity(domain.getComprador()))
                .tipoFruta(domain.getTipoFruta())
                .cantidadRequerida(domain.getCantidadRequerida())
                .descripcion(domain.getDescripcion())
                .fechaLimite(domain.getFechaLimite())
                .activo(domain.isActivo())
                .fechaCreacion(domain.getFechaCreacion())
                .build();
    }

    public RfqOferta toOfertaDomain(RfqOfertaEntity entity) {
        if (entity == null) return null;
        return RfqOferta.builder()
                .id(entity.getId())
                .rfq(toDomain(entity.getRfq()))
                .productor(usuarioMapper.toDomain(entity.getProductor()))
                .precioPropuesto(entity.getPrecioPropuesto())
                .comentarios(entity.getComentarios())
                .aceptada(entity.isAceptada())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }

    public RfqOfertaEntity toOfertaEntity(RfqOferta domain) {
        if (domain == null) return null;
        return RfqOfertaEntity.builder()
                .id(domain.getId())
                .rfq(toEntity(domain.getRfq()))
                .productor(usuarioMapper.toEntity(domain.getProductor()))
                .precioPropuesto(domain.getPrecioPropuesto())
                .comentarios(domain.getComentarios())
                .aceptada(domain.isAceptada())
                .fechaCreacion(domain.getFechaCreacion())
                .build();
    }
}
