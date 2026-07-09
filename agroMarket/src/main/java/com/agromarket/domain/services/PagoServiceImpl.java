package com.agromarket.domain.services;

import java.math.BigDecimal;

import com.agromarket.application.Usecases.AsyncEmailService;
import com.agromarket.application.api.request.ProcesarPagoRequest;
import com.agromarket.application.api.response.PagoResponse;
import com.agromarket.application.mapper.PagoMapper;
import com.agromarket.application.persistence.sql.entities.FacturaEntity;
import com.agromarket.application.persistence.sql.entities.PagoEntity;
import com.agromarket.application.persistence.sql.entities.PedidoEntity;
import com.agromarket.application.persistence.sql.entities.ProductoEntity;
import com.agromarket.application.persistence.sql.entities.UsuarioEntity;
import com.agromarket.application.persistence.sql.repositories.FacturaJpaRepository;
import com.agromarket.application.persistence.sql.repositories.PagoJpaRepository;
import com.agromarket.application.persistence.sql.repositories.PedidoJpaRepository;
import com.agromarket.application.persistence.sql.repositories.UsuarioJpaRepository;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.models.enums.EstadoPago;
import com.agromarket.domain.models.enums.RolUsuario;
import com.agromarket.domain.ports.PagoService;
import com.agromarket.domain.ports.PasarelaPagoService;

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
    private final com.agromarket.application.persistence.sql.repositories.ProductoJpaRepository productoJpaRepository;
    private final PagoMapper pagoMapper;
    private final AsyncEmailService emailService;
    private final PasarelaPagoService pasarelaPagoService;
    private final PagoDomainService pagoDomainService = new PagoDomainService();
    private final FacturaDomainService facturaDomainService = new FacturaDomainService();

    @Override
    public com.agromarket.application.api.response.IniciarPagoResponse iniciar(com.agromarket.application.api.request.IniciarPagoRequest request, Long compradorId) {
        PedidoEntity pedido = obtenerPedido(request.getPedidoId());
        validarPropietarioPedido(pedido, compradorId);

        pagoJpaRepository.findByPedidoId(pedido.getId()).ifPresent(pagoExistente -> {
            if (pagoExistente.getEstado() == EstadoPago.CONFIRMADO || pagoExistente.getEstado() == EstadoPago.EN_FIDEICOMISO) {
                throw new IllegalStateException("El pedido ya está pagado");
            }
            pagoJpaRepository.delete(pagoExistente);
            pagoJpaRepository.flush();
        });

        com.agromarket.application.dto.PagoIniciadoDTO iniciado = pasarelaPagoService.iniciarPago(pedido);

        PagoEntity guardado = pagoJpaRepository.findByPedidoId(pedido.getId())
                .orElseThrow(() -> new IllegalStateException("No se pudo iniciar el pago"));

        if (request.getMetodoPago() != null) {
            guardado.setMetodoPago(request.getMetodoPago());
            guardado = pagoJpaRepository.save(guardado);
        }

        String url = iniciado.getRedirectUrl() + "&monto=" + pedido.getTotal();
        if (guardado.getMetodoPago() != null) {
            url += "&metodo=" + guardado.getMetodoPago().name();
        }

        return com.agromarket.application.api.response.IniciarPagoResponse.builder()
                .pagoId(guardado.getId())
                .urlPasarela(url)
                .referencia(iniciado.getReferencia())
                .build();
    }

    @Override
    public PagoResponse confirmar(com.agromarket.application.api.request.ConfirmarPagoRequest request) {
        PagoEntity pago = pagoJpaRepository.findById(request.getPagoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado"));

        if (!pago.getReferenciaPasarela().equals(request.getReferencia())) {
            throw new IllegalArgumentException("La referencia del pago no coincide");
        }

        if (pago.getEstado() == EstadoPago.CONFIRMADO) {
            return pagoMapper.toResponse(pago);
        }

        if ("APROBADO".equalsIgnoreCase(request.getEstado())) {
            pago.setEstado(EstadoPago.EN_FIDEICOMISO);
            PedidoEntity pedido = pago.getPedido();
            pedido.setEstado(com.agromarket.domain.models.enums.EstadoPedido.PENDIENTE);
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
            if (pedido.getEstado() != com.agromarket.domain.models.enums.EstadoPedido.CANCELADO) {
                pedido.setEstado(com.agromarket.domain.models.enums.EstadoPedido.CANCELADO);
                ProductoEntity producto = pedido.getProducto();
                if (producto != null) {
                    producto.setCantidadDisponible(producto.getCantidadDisponible() + pedido.getCantidad());
                    productoJpaRepository.save(producto);
                }
                pedidoJpaRepository.save(pedido);
            }
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

    private com.agromarket.domain.models.Pedido pedidoMapperToDomain(PedidoEntity pedido) {
        return com.agromarket.domain.models.Pedido.builder()
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
