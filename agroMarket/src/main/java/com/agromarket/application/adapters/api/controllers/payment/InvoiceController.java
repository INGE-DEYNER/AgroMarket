package com.agromarket.application.adapters.api.controllers.payment;

import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.payment.Invoice;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.payment.InvoiceResult;
import com.agromarket.domain.ports.out.order.OrderPort;
import com.agromarket.domain.ports.out.payment.InvoicePort;
import com.agromarket.domain.ports.out.user.EmailPort;
import com.agromarket.infrastructure.pdf.InvoicePdfGenerator;
import com.agromarket.infrastructure.security.JwtUserPrincipal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@Slf4j
public class InvoiceController {

    private final InvoicePort invoicePort;
    private final OrderPort orderPort;
    private final EmailPort emailPort;
    private final InvoicePdfGenerator invoicePdfGenerator;

    /**
     * FIX: antes usaba un userId hardcodeado (1L) con un TODO. Ahora se usa
     * el userId real del token vía @AuthenticationPrincipal JwtUserPrincipal.
     * Se agrega también el alias en español "/mis-facturas" que espera el
     * frontend, sin eliminar "/mine".
     */
    @GetMapping({ "/mine", "/mis-facturas" })
    public ResponseEntity<List<InvoiceResult>> getMyInvoices(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        Long userId = principal.getUserId();
        List<InvoiceResult> invoices = invoicePort.findByUserId(userId)
                .stream()
                .map(this::toResult)
                .toList();
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResult> getInvoiceById(@PathVariable Long id) {
        return invoicePort.findById(id)
                .map(this::toResult)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping({ "/order/{orderId}", "/pedido/{pedidoId}" })
    public ResponseEntity<InvoiceResult> getInvoiceByOrder(@PathVariable Long orderId) {
        return invoicePort.findByOrderId(orderId)
                .map(this::toResult)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================================================
    // PDF REAL (OpenPDF)
    // =====================================================================

    /**
     * GET /api/v1/facturas/{id}/pdf (alias -> /api/v1/invoices/{id}/pdf)
     *
     * Descarga la factura en PDF, generada en el servidor con los datos
     * reales del pedido (producto, comprador, productor, IVA 19%).
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        Invoice invoice = invoicePort.findById(id).orElse(null);

        if (invoice == null) {
            return ResponseEntity.notFound().build();
        }

        if (!canAccess(invoice, principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        byte[] pdf = invoicePdfGenerator.generate(loadInvoiceWithData(invoice));

        String filename = "factura-"
                + (invoice.getInvoiceNumber() != null
                        ? invoice.getInvoiceNumber()
                        : invoice.getId())
                + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    private InvoiceResult toResult(Invoice invoice) {
        Long orderId = invoice.getOrder() != null ? invoice.getOrder().getId() : null;
        return InvoiceResult.builder()
                .id(invoice.getId())
                .orderId(orderId)
                .subtotal(invoice.getSubtotal())
                .tax(invoice.getTax())
                .total(invoice.getTotal())
                .issueDate(invoice.getIssueDate())
                .invoiceNumber(invoice.getInvoiceNumber())
                .build();
    }

    // =====================================================================
    // ENVÍO REAL DE LA FACTURA AL CORREO (Brevo + PDF adjunto)
    // =====================================================================

    /**
     * POST /api/v1/facturas/{id}/enviar (alias -> /api/v1/invoices/{id}/enviar)
     *
     * Envía la factura en PDF al correo registrado del comprador usando la
     * API real de Brevo. Si el envío falla, propaga el error real (el
     * frontend ya NO simula un éxito falso).
     */
    @PostMapping({ "/{id}/enviar", "/{id}/email" })
    public ResponseEntity<Map<String, Object>> sendByEmail(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        Invoice invoice = invoicePort.findById(id).orElse(null);

        if (invoice == null) {
            return ResponseEntity.notFound().build();
        }

        if (!canAccess(invoice, principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // La referencia ligera no trae comprador: recargar la orden real.
        Order order = loadOrder(invoice);

        if (order == null
                || order.getBuyer() == null
                || order.getBuyer().getEmail() == null
                || order.getBuyer().getEmail().isBlank()) {
            throw new IllegalStateException(
                    "La factura no tiene un correo de comprador asociado");
        }

        String to = order.getBuyer().getEmail();
        String invoiceNumber = invoice.getInvoiceNumber() != null
                ? invoice.getInvoiceNumber()
                : ("FAC-" + invoice.getId());

        byte[] pdf = invoicePdfGenerator.generate(withOrder(invoice, order));

        String html = buildInvoiceEmailHtml(order, invoiceNumber);
        String filename = "factura-" + invoiceNumber + ".pdf";

        // Envío REAL vía Brevo (lanza excepción con el error real si falla).
        emailPort.sendInvoiceEmail(
                to,
                "Factura " + invoiceNumber + " - AgroMarket / ASAFRUT",
                html,
                filename,
                pdf);

        log.info("Factura {} enviada por correo a {}", invoiceNumber, to);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Factura enviada al correo " + to);
        response.put("email", to);
        response.put("invoiceNumber", invoiceNumber);

        return ResponseEntity.ok(response);
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    /** Carga la factura con su orden completa (comprador, producto, productor). */
    private Invoice loadInvoiceWithData(Invoice invoice) {
        return withOrder(invoice, loadOrder(invoice));
    }

    private Order loadOrder(Invoice invoice) {
        if (invoice == null
                || invoice.getOrder() == null
                || invoice.getOrder().getId() == null) {
            return null;
        }
        return orderPort.findById(invoice.getOrder().getId()).orElse(null);
    }

    private Invoice withOrder(Invoice invoice, Order order) {
        if (order == null) {
            return invoice;
        }
        return Invoice.builder()
                .id(invoice.getId())
                .order(order)
                .subtotal(invoice.getSubtotal())
                .tax(invoice.getTax())
                .total(invoice.getTotal())
                .issueDate(invoice.getIssueDate())
                .invoiceNumber(invoice.getInvoiceNumber())
                .build();
    }

    /**
     * Solo el comprador dueño de la factura (o un ADMIN) puede
     * descargarla o enviarla.
     */
    private boolean canAccess(Invoice invoice, JwtUserPrincipal principal) {
        if (principal == null) {
            return false;
        }
        if ("ADMIN".equalsIgnoreCase(principal.getRole())) {
            return true;
        }
        Order order = loadOrder(invoice);
        User buyer = order != null ? order.getBuyer() : null;
        return buyer != null
                && buyer.getId() != null
                && buyer.getId().equals(principal.getUserId());
    }

    private String buildInvoiceEmailHtml(Order order, String invoiceNumber) {

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String fecha = LocalDateTime.now().format(fmt);

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;background:#f4f7f4;font-family:Arial,Helvetica,sans-serif;">
                  <div style="max-width:640px;margin:30px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">
                    <div style="background:#176b32;padding:32px;color:#ffffff;">
                      <div style="font-size:13px;letter-spacing:3px;font-weight:bold;margin-bottom:12px;">AGROMARKET / ASAFRUT</div>
                      <h1 style="margin:0;font-size:26px;">Tu factura %s</h1>
                    </div>
                    <div style="padding:32px;color:#17351f;font-size:15px;line-height:1.7;">
                      <p>Hola %s,</p>
                      <p>Adjuntamos la factura <strong>%s</strong> de tu pedido <strong>#%s</strong> por un total de <strong>$ %s</strong>.</p>
                      <p>Gracias por comprar directo a los productores de ASAFRUT.</p>
                      <p style="font-size:13px;color:#718078;margin-top:24px;">Correo generado autom&aacute;ticamente el %s.</p>
                    </div>
                  </div>
                </body>
                </html>
                """
                .formatted(
                        invoiceNumber,
                        order.getBuyer().getFirstName() != null
                                        ? order.getBuyer().getFirstName()
                                        : "cliente",
                        invoiceNumber,
                        order.getId(),
                        order.getTotal() != null
                                        ? order.getTotal().toPlainString()
                                        : "0",
                        fecha);
    }
}
