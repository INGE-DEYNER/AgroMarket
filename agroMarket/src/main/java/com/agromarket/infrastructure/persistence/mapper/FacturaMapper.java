package com.agromarket.infrastructure.persistence.mapper;

import com.agromarket.interfaces.rest.response.FacturaResponse;
import com.agromarket.infrastructure.persistence.sql.entities.FacturaEntity;
import com.agromarket.domain.models.Factura;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FacturaMapper {
    default FacturaResponse toResponse(FacturaEntity entity) {
        if (entity == null) {
            return null;
        }
        return FacturaResponse.builder()
                .id(entity.getId())
                .numeroFactura(entity.getNumeroFactura())
                .pedidoId(entity.getPedido() != null ? entity.getPedido().getId() : null)
                .subtotal(entity.getSubtotal())
                .impuesto(entity.getImpuesto())
                .total(entity.getTotal())
                .fechaEmision(entity.getFechaEmision())
                .pagoId(entity.getPago() != null ? entity.getPago().getId() : null)
                .estado(entity.getEstado())
                .checkoutId(entity.getPedido() != null ? entity.getPedido().getCheckoutId() : null)
                .build();
    }

    default Factura toDomain(FacturaEntity entity) {
        if (entity == null) {
            return null;
        }
        return Factura.builder()
                .id(entity.getId())
                .subtotal(entity.getSubtotal())
                .impuesto(entity.getImpuesto())
                .total(entity.getTotal())
                .numeroFactura(entity.getNumeroFactura())
                .fechaEmision(entity.getFechaEmision())
                .build();
    }
}
