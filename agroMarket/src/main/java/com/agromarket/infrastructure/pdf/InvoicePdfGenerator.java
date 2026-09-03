package com.agromarket.infrastructure.pdf;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.payment.Invoice;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import lombok.extern.slf4j.Slf4j;

/**
 * Genera el PDF REAL de una factura con OpenPDF (ya estaba en el pom.xml).
 *
 * Se usa tanto para la descarga (GET /facturas/{id}/pdf) como para el envío
 * por correo (POST /facturas/{id}/enviar, adjunto vía Brevo).
 */
@Component
@Slf4j
public class InvoicePdfGenerator {

        private static final DateTimeFormatter DATE_FMT =
                        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        private static final Font FONT_TITLE = FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD, 20);

        private static final Font FONT_H2 = FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD, 12);

        private static final Font FONT_NORMAL = FontFactory.getFont(
                        FontFactory.HELVETICA, 10);

        private static final Font FONT_BOLD = FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD, 10);

        private void appendParties(Document document, User buyer, User producer)
                        throws Exception {

                PdfPTable parties = new PdfPTable(2);
                parties.setWidthPercentage(100);
                parties.setSpacingAfter(12);

                parties.addCell(cell("Datos del comprador", true));
                parties.addCell(cell("Datos del productor", true));

                StringBuilder buyerInfo = new StringBuilder();
                if (buyer != null) {
                        buyerInfo.append("Nombre: ").append(displayName(buyer)).append('\n');
                        buyerInfo.append("Correo: ").append(safe(buyer.getEmail())).append('\n');
                        buyerInfo.append("ID Cliente: ").append(buyer.getId());
                } else {
                        buyerInfo.append("-");
                }

                StringBuilder producerInfo = new StringBuilder();
                if (producer != null) {
                        producerInfo.append("Productor: ").append(displayName(producer)).append('\n');
                        producerInfo.append("Correo: ").append(safe(producer.getEmail()));
                } else {
                        producerInfo.append("Productor ASAFRUT");
                }

                parties.addCell(cell(buyerInfo.toString(), false));
                parties.addCell(cell(producerInfo.toString(), false));
                document.add(parties);
        }
        private static final Font FONT_HEADER_CELL = FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD, 10,
                        new java.awt.Color(255, 255, 255));

        /**
         * Genera el PDF de la factura. Devuelve los bytes del documento; el
         * llamador decide si los sirve como descarga o como adjunto de correo.
         */
        public byte[] generate(Invoice invoice) {

                try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

                        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
                        PdfWriter.getInstance(document, out);
                        document.open();

                        Order order = invoice.getOrder();
                        Product product = order != null ? order.getProduct() : null;
                        User buyer = order != null ? order.getBuyer() : null;
                        User producer = product != null ? product.getProducer() : null;

                        // Encabezado
                        Paragraph title = new Paragraph("ASAFRUT - AgroMarket", FONT_TITLE);
                        title.setAlignment(Element.ALIGN_LEFT);
                        document.add(title);

                        Paragraph subtitle = new Paragraph(
                                        "Factura de Compra  " + safe(invoice.getInvoiceNumber()),
                                        FONT_H2);
                        subtitle.setSpacingAfter(4);
                        document.add(subtitle);

                        Paragraph meta = new Paragraph(
                                        "Fecha de emisión: "
                                                        + (invoice.getIssueDate() != null
                                                                        ? invoice.getIssueDate().format(DATE_FMT)
                                                                        : "-"),
                                        FONT_NORMAL);
                        meta.setSpacingAfter(14);
                        document.add(meta);

                        appendParties(document, buyer, producer);
                        appendItems(document, order, product);
                        appendTotals(document, invoice);

                        Paragraph footer = new Paragraph(
                                        "Documento generado electrónicamente por AgroMarket / ASAFRUT. "
                                                        + "Pago procesado y verificado a través de MercadoPago.",
                                        FontFactory.getFont(FontFactory.HELVETICA, 8));
                        footer.setSpacingBefore(24);
                        document.add(footer);

                        document.close();
                        return out.toByteArray();

                } catch (Exception e) {
                        log.error("Error generando PDF de factura {}: {}",
                                        invoice != null ? invoice.getId() : null, e.getMessage(), e);
                        throw new IllegalStateException(
                                        "No se pudo generar el PDF de la factura: " + e.getMessage(), e);
                }
        }

        private void appendItems(Document document, Order order, Product product)
                        throws Exception {

                PdfPTable items = new PdfPTable(new float[] { 45f, 12f, 20f, 23f });
                items.setWidthPercentage(100);
                items.setSpacingAfter(10);

                items.addCell(headerCell("Producto"));
                items.addCell(headerCell("Cant. (kg)"));
                items.addCell(headerCell("Precio unitario"));
                items.addCell(headerCell("Importe"));

                String productName = product != null && product.getName() != null
                                ? product.getName()
                                : "Producto AgroMarket";

                int quantity = order != null && order.getQuantity() != null
                                ? order.getQuantity()
                                : 1;

                BigDecimal unitPrice = order != null && order.getUnitPrice() != null
                                ? order.getUnitPrice()
                                : (order != null ? order.getTotal() : BigDecimal.ZERO);

                items.addCell(cell(productName, false));
                items.addCell(cell(String.valueOf(quantity), false));
                items.addCell(cell(money(unitPrice), false));
                items.addCell(cell(money(
                                unitPrice != null
                                                ? unitPrice.multiply(BigDecimal.valueOf(quantity))
                                                : BigDecimal.ZERO),
                                false));
                document.add(items);
        }

        private void appendTotals(Document document, Invoice invoice) throws Exception {

                PdfPTable totals = new PdfPTable(2);
                totals.setWidthPercentage(45);
                totals.setHorizontalAlignment(Element.ALIGN_RIGHT);

                totals.addCell(cell("Subtotal", true));
                totals.addCell(cell(money(invoice.getSubtotal()), false));
                totals.addCell(cell("IVA (19%)", true));
                totals.addCell(cell(money(invoice.getTax()), false));

                Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
                PdfPCell totalLabel = new PdfPCell(new Paragraph("TOTAL", totalFont));
                totalLabel.setBorder(PdfPCell.NO_BORDER);
                totals.addCell(totalLabel);

                PdfPCell totalValue = new PdfPCell(
                                new Paragraph(money(invoice.getTotal()), totalFont));
                totalValue.setBorder(PdfPCell.NO_BORDER);
                totals.addCell(totalValue);

                document.add(totals);
        }

        private PdfPCell cell(String text, boolean bold) {
                PdfPCell cell = new PdfPCell(
                                new Paragraph(safe(text), bold ? FONT_BOLD : FONT_NORMAL));
                cell.setBorder(PdfPCell.NO_BORDER);
                cell.setPaddingBottom(4);
                return cell;
        }

        private PdfPCell headerCell(String text) {
                PdfPCell cell = new PdfPCell(new Paragraph(safe(text), FONT_HEADER_CELL));
                cell.setBackgroundColor(new java.awt.Color(45, 106, 79));
                cell.setPadding(6);
                cell.setBorder(PdfPCell.NO_BORDER);
                return cell;
        }

        private String displayName(User user) {
                if (user == null) {
                        return "-";
                }
                if (user.getFirstName() != null && user.getLastName() != null) {
                        return user.getFirstName() + " " + user.getLastName();
                }
                if (user.getFirstName() != null) {
                        return user.getFirstName();
                }
                return "Usuario #" + user.getId();
        }

        private String money(BigDecimal value) {
                if (value == null) {
                        value = BigDecimal.ZERO;
                }
                return "$ " + String.format("%,.2f", value);
        }

        private String safe(String value) {
                return value != null ? value : "-";
        }
}

