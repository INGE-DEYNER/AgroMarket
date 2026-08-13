package com.agromarket.application.usecases;

import java.math.BigDecimal;

import com.agromarket.application.usecases.AsyncEmailService;
import com.agromarket.interfaces.rest.request.ProcesarPagoRequest;
import com.agromarket.interfaces.rest.response.PagoResponse;
import com.agromarket.infrastructure.persistence.mapper.PagoMapper;
import com.agromarket.domain.models.Factura;
import com.agromarket.domain.models.Pago;
import com.agromarket.domain.models.Pedido;
import com.agromarket.domain.models.Producto;
import com.agromarket.domain.models.Usuario;
import com.agromarket.domain.ports.out.InvoiceRepositoryPort;
import com.agromarket.domain.ports.out.PaymentRepositoryPort;
import com.agromarket.domain.ports.out.OrderRepositoryPort;
import com.agromarket.domain.ports.out.UserRepositoryPort;
import com.agromarket.domain.ports.out.ProductRepositoryPort;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.models.enums.EstadoPago;
import com.agromarket.domain.models.enums.RolUsuario;
import com.agromarket.application.ports.in.PagoService;
import com.agromarket.application.ports.in.PasarelaPagoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PagoServiceImpl implements PagoService {
    private final PaymentRepositoryPort paymentRepositoryPort;
    private final OrderRepositoryPort orderRepositoryPort;
    private final InvoiceRepositoryPort invoiceRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final ProductRepositoryPort productRepositoryPort;
    private final PagoMapper pagoMapper;
    private final AsyncEmailService emailService;
    private final PasarelaPagoService pasarelaPagoService;
    private final PagoDomainService pagoDomainService = new PagoDomainService();
    private final FacturaDomainService facturaDomainService = new FacturaDomainService();

    @Override
    public com.agromarket.interfaces.rest.response.IniciarPagoResponse iniciar(com.agromarket.interfaces.rest.request.IniciarPagoRequest request, Long compradorId) {
        Pedido pedido = obtenerPedido(request.getPedidoId());
        validarPropietarioPedido(pedido, compradorId);

        paymentRepositoryPort.findByOrderId(pedido.getId()).ifPresent(pagoExistente -> {
            if (pagoExistente.getEstado() == EstadoPago.CONFIRMADO || pagoExistente.getEstado() == EstadoPago.EN_FIDEICOMISO) {
                throw new IllegalStateException("El pedido ya está pagado");
            }
            paymentRepositoryPort.delete(pagoExistente);
        });

        com.agromarket.application.dto.PagoIniciadoDTO iniciado = pasarelaPagoService.iniciarPago(pedido);

        Pago guardado = paymentRepositoryPort.findByOrderId(pedido.getId())
                .orElseThrow(() -> new IllegalStateException("No se pudo iniciar el pago"));

        if (request.getMetodoPago() != null) {
            guardado.setMetodoPago(request.getMetodoPago());
            guardado = paymentRepositoryPort.save(guardado);
        }

        String url = iniciado.getRedirectUrl() + "&monto=" + pedido.getTotal();
        if (guardado.getMetodoPago() != null) {
            url += "&metodo=" + guardado.getMetodoPago().name();
        }

        return com.agromarket.interfaces.rest.response.IniciarPagoResponse.builder()
                .pagoId(guardado.getId())
                .urlPasarela(url)
                .referencia(iniciado.getReferencia())
                .build();
    }

    @Override
    public PagoResponse confirmar(com.agromarket.interfaces.rest.request.ConfirmarPagoRequest request) {
        Pago pago = paymentRepositoryPort.findById(request.getPagoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado"));

        if (!pago.getReferenciaPasarela().equals(request.getReferencia())) {
            throw new IllegalArgumentException("La referencia del pago no coincide");
        }

        if (pago.getEstado() == EstadoPago.CONFIRMADO) {
            return pagoMapper.toResponse(pago);
        }

        if ("APROBADO".equalsIgnoreCase(request.getEstado())) {
            pago.setEstado(EstadoPago.EN_FIDEICOMISO);
            Pedido pedido = pago.getPedido();
            pedido.setEstado(com.agromarket.domain.models.enums.EstadoPedido.PENDIENTE);
            orderRepositoryPort.save(pedido);

            Factura factura = invoiceRepositoryPort.findByOrderId(pedido.getId())
                    .orElseGet(() -> {
                        Factura f = Factura.builder()
                                .pedido(pedido)
                                .subtotal(pedido.getTotal())
                                .impuesto(facturaDomainService.calcularImpuesto(pedido.getTotal()))
                                .total(facturaDomainService.calcularTotal(pedido.getTotal()))
                                .numeroFactura("FAC-" + pedido.getId() + "-" + java.time.LocalDate.now().getYear())
                                .pago(pago)
                                .estado("PAGADA")
                                .build();
                        return invoiceRepositoryPort.save(f);
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
            Pedido pedido = pago.getPedido();
            if (pedido.getEstado() != com.agromarket.domain.models.enums.EstadoPedido.CANCELADO) {
                pedido.setEstado(com.agromarket.domain.models.enums.EstadoPedido.CANCELADO);
                Producto producto = pedido.getProducto();
                if (producto != null) {
                    producto.setCantidadDisponible(producto.getCantidadDisponible() + pedido.getCantidad());
                    productRepositoryPort.save(producto);
                }
                orderRepositoryPort.save(pedido);
            }
        }

        Pago guardado = paymentRepositoryPort.save(pago);
        return pagoMapper.toResponse(guardado);
    }

    @Override
    public PagoResponse procesar(ProcesarPagoRequest request, Long compradorId) {
        Pedido pedido = obtenerPedido(request.getPedidoId());
        validarPropietarioPedido(pedido, compradorId);
        BigDecimal monto = pedido.getTotal();
        pagoDomainService.validarMonto(pedido, monto);
        Pago pago = Pago.builder()
                .pedido(pedido)
                .monto(monto)
                .metodoPago(request.getMetodoPago())
                .estado(EstadoPago.CONFIRMADO)
                .referenciaPasarela(request.getReferenciaPasarela())
                .build();
        Pago guardado = paymentRepositoryPort.save(pago);

        if (invoiceRepositoryPort.findByOrderId(pedido.getId()).isEmpty()) {
            Factura factura = Factura.builder()
                    .pedido(pedido)
                    .subtotal(pedido.getTotal())
                    .impuesto(facturaDomainService.calcularImpuesto(pedido.getTotal()))
                    .total(facturaDomainService.calcularTotal(pedido.getTotal()))
                    .numeroFactura("FAC-" + pedido.getId() + "-" + java.time.LocalDate.now().getYear())
                    .build();
            invoiceRepositoryPort.save(factura);
        }
        return pagoMapper.toResponse(guardado);
    }

    @Override
    public PagoResponse getByPedidoId(Long pedidoId, Long solicitanteId) {
        Pedido pedido = obtenerPedido(pedidoId);
        validarPropietarioPedido(pedido, solicitanteId);
        return pagoMapper.toResponse(paymentRepositoryPort.findByOrderId(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado")));
    }

    private void validarPropietarioPedido(Pedido pedido, Long compradorId) {
        Usuario comprador = userRepositoryPort.findById(compradorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        boolean esAdmin = comprador.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = pedido.getComprador() != null && pedido.getComprador().getId() != null && pedido.getComprador().getId().equals(compradorId);
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para procesar este pago");
        }
    }

    private Pedido obtenerPedido(Long id) {
        return orderRepositoryPort.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));
    }
}
