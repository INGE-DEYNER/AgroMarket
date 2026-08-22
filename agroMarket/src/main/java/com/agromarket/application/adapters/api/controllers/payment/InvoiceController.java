package com.agromarket.application.adapters.api.controllers.payment;

import com.agromarket.domain.models.payment.Invoice;
import com.agromarket.domain.ports.in.payment.InvoiceResult;
import com.agromarket.domain.ports.out.payment.InvoicePort;
import com.agromarket.infrastructure.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoicePort invoicePort;

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

    @GetMapping("/order/{orderId}")
    public ResponseEntity<InvoiceResult> getInvoiceByOrder(@PathVariable Long orderId) {
        return invoicePort.findByOrderId(orderId)
                .map(this::toResult)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
}
