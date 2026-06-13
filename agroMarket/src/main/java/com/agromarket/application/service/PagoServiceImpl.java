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
@SuppressWarnings({"null", "unused"})
public class PagoServiceImpl implements PagoService {
    private final PagoJpaRepository pagoJpaRepository;
    private final PedidoJpaRepository pedidoJpaRepository;
    private final FacturaJpaRepository facturaJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final PagoMapper pagoMapper;
    private final EmailService emailService;
    private final PagoDomainService pagoDomainService = new PagoDomainService();
    private final FacturaDomainService facturaDomainService = new FacturaDomainService();

    @Override
    public com.agromarket.application.dto.IniciarPagoResponse iniciar(com.agromarket.application.dto.IniciarPagoRequest request, Long compradorId) {
        PedidoEntity pedido = obtenerPedido(request.getPedidoId());
        validarPropietarioPedido(pedido, compradorId);

        pagoJpaRepository.findByPedidoId(pedido.getId()).ifPresent(pagoExistente -> {
            if (pagoExistente.getEstado() == EstadoPago.CONFIRMADO) {
                throw new IllegalStateException("El pedido ya está pagado");
            }
            pagoJpaRepository.delete(pagoExistente);
            pagoJpaRepository.flush();
        });

        String referencia = "REF-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        PagoEntity pago = PagoEntity.builder()
                .pedido(pedido)
                .monto(pedido.getTotal())
                .metodoPago(request.getMetodoPago())
                .estado(EstadoPago.PENDIENTE)
                .referenciaPasarela(referencia)
                .build();
        PagoEntity guardado = pagoJpaRepository.save(pago);

        String urlPasarela = "/pago-pasarela?pagoId=" + guardado.getId() + "&referencia=" + referencia;

        return com.agromarket.application.dto.IniciarPagoResponse.builder()
                .pagoId(guardado.getId())
                .urlPasarela(urlPasarela)
                .referencia(referencia)
                .build();
    }

    @Override
    public PagoResponse confirmar(com.agromarket.application.dto.ConfirmarPagoRequest request) {
        PagoEntity pago = pagoJpaRepository.findById(request.getPagoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado"));

        if (!pago.getReferenciaPasarela().equals(request.getReferencia())) {
            throw new IllegalArgumentException("La referencia del pago no coincide");
        }

        if (pago.getEstado() == EstadoPago.CONFIRMADO) {
            return pagoMapper.toResponse(pago);
        }

        if ("APROBADO".equalsIgnoreCase(request.getEstado())) {
            pago.setEstado(EstadoPago.CONFIRMADO);
            PedidoEntity pedido = pago.getPedido();
            pedido.setEstado(com.agromarket.domain.model.EstadoPedido.PENDIENTE);
            pedidoJpaRepository.save(pedido);

            FacturaEntity factura = facturaJpaRepository.findByPedidoId(pedido.getId())
                    .orElseGet(() -> {
                        FacturaEntity f = FacturaEntity.builder()
                                .pedido(pedido)
                                .subtotal(pedido.getTotal())
                                .impuesto(facturaDomainService.calcularImpuesto(pedido.getTotal()))
                                .total(facturaDomainService.calcularTotal(pedido.getTotal()))
                                .numeroFactura("FAC-" + pedido.getId() + "-" + java.time.LocalDate.now().getYear())
                                .pago(pago)
                                .estado("PAGADA")
                                .build();
                        return facturaJpaRepository.save(f);
                    });

            try {
                String email = pedido.getComprador() != null ? pedido.getComprador().getCorreo() : null;
                if (email != null) {
                    String htmlContent = "<h2>Factura de Compra - AgroMarket</h2>" +
                            "<p>Estimado/a comprador/a,</p>" +
                            "<p>Tu pago ha sido confirmado exitosamente para el pedido #" + pedido.getId() + ".</p>" +
                            "<p>Detalles de facturación:</p>" +
                            "<ul>" +
                            "<li>Número de factura: " + factura.getNumeroFactura() + "</li>" +
                            "<li>Subtotal: $" + factura.getSubtotal() + "</li>" +
                            "<li>IVA (19%): $" + factura.getImpuesto() + "</li>" +
                            "<li>Total: $" + factura.getTotal() + "</li>" +
                            "</ul>" +
                            "<p>Gracias por apoyar a los productores de ASAFRUT.</p>";
                    emailService.sendHtmlMessage(email, "Factura de Compra " + factura.getNumeroFactura(), htmlContent);
                }
            } catch (Exception e) {
                System.err.println("Error enviando correo de factura: " + e.getMessage());
            }

        } else {
            pago.setEstado(EstadoPago.RECHAZADO);
            PedidoEntity pedido = pago.getPedido();
            pedido.setEstado(com.agromarket.domain.model.EstadoPedido.CANCELADO);
            pedidoJpaRepository.save(pedido);
        }

        PagoEntity guardado = pagoJpaRepository.save(pago);
        return pagoMapper.toResponse(guardado);
    }

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
    public PagoResponse getByPedidoId(Long pedidoId, Long solicitanteId) {
        PedidoEntity pedido = obtenerPedido(pedidoId);
        validarPropietarioPedido(pedido, solicitanteId);
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
