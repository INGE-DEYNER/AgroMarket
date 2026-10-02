package com.agromarket.domain.ports.out.payment;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.payment.Invoice;

/**
 * Output port for invoice persistence.
 */
public interface InvoicePort {

    List<Invoice> findByUserId(Long userId);

    /**
     * Saves an invoice.
     *
     * @param invoice invoice to save
     * @return the saved invoice
     */
    Invoice save(Invoice invoice);

    /**
     * Finds an invoice associated with an order.
     *
     * @param orderId identificador del pedido
     * @return the invoice, if it exists
     */
    Optional<Invoice> findByOrderId(Long orderId);

    /**
     * Finds an invoice by its identifier.
     *
     * @param id invoice identifier
     * @return the invoice, if it exists
     */
    Optional<Invoice> findById(Long id);

}