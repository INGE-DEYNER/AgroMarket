package com.agromarket.application.service;

import java.math.BigDecimal;

import com.agromarket.application.dto.PagoResponse;
import com.agromarket.application.dto.ProcesarPagoRequest;
import com.agromarket.application.mapper.PagoMapper;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.model.EstadoPago;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.domain.service.FacturaDomainService;
import com.agromarket.domain.service.PagoDomainService;
import com.agromarket.infrastructure.persistence.entity.FacturaEntity;
import com.agromarket.infrastructure.persistence.entity.PagoEntity;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.FacturaJpaRepository;
import com.agromarket.infrastructure.persistence.repository.PagoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.PedidoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PagoServiceImpl implements PagoService {
    private final PagoJpaRepository pagoJpaRepository;
    private final PedidoJpaRepository pedidoJpaRepository;
    private final FacturaJpaRepository facturaJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final PagoMapper pagoMapper;
    private final PagoDomainService pagoDomainService = new PagoDomainService();
    private final FacturaDomainService facturaDomainService = new FacturaDomainService();

    @Override
    public PagoResponse procesar(ProcesarPagoRequest request, Long compradorId) {
        PedidoEntity pedido = obtenerPedido(request.getPedidoId());
        validarPropietarioPedido(pedido, compradorId);
        BigDecimal monto = pedido.getTotal();
        pagoDomainService.validarMonto(pedidoMapperToDomain(pedido), monto);
        PagoEntity pago = PagoEntity.builder()
                .pedido(pedido)
                .monto(monto)
                .metodoPago(request.getMetodoPago())
                .estado(EstadoPago.CONFIRMADO)
                .referenciaPasarela(request.getReferenciaPasarela())
                .build();
        PagoEntity guardado = pagoJpaRepository.save(pago);

        if (facturaJpaRepository.findByPedidoId(pedido.getId()).isEmpty()) {
            FacturaEntity factura = FacturaEntity.builder()
                    .pedido(pedido)
                    .subtotal(pedido.getTotal())
                    .impuesto(facturaDomainService.calcularImpuesto(pedido.getTotal()))
                    .total(facturaDomainService.calcularTotal(pedido.getTotal()))
                    .numeroFactura("FAC-" + pedido.getId() + "-" + java.time.LocalDate.now().getYear())
                    .build();
            facturaJpaRepository.save(factura);
        }
        return pagoMapper.toResponse(guardado);
    }

    @Override
    public PagoResponse getByPedidoId(Long pedidoId) {
        return pagoMapper.toResponse(pagoJpaRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado")));
    }

    private void validarPropietarioPedido(PedidoEntity pedido, Long compradorId) {
        UsuarioEntity comprador = usuarioJpaRepository.findById(compradorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        boolean esAdmin = comprador.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = pedido.getComprador() != null && pedido.getComprador().getId() != null && pedido.getComprador().getId().equals(compradorId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para procesar este pago");
        }
    }

    private com.agromarket.domain.model.Pedido pedidoMapperToDomain(PedidoEntity pedido) {
        return com.agromarket.domain.model.Pedido.builder()
                .id(pedido.getId())
                .cantidad(pedido.getCantidad())
                .precioUnitario(pedido.getPrecioUnitario())
                .total(pedido.getTotal())
                .estado(pedido.getEstado())
                .fechaCreacion(pedido.getFechaCreacion())
                .build();
    }

    private PedidoEntity obtenerPedido(Long id) {
        return pedidoJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));
    }
}
