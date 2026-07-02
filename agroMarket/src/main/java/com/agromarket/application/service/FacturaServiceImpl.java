package com.agromarket.application.service;

import com.agromarket.application.dto.FacturaResponse;
import com.agromarket.application.mapper.FacturaMapper;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.infrastructure.persistence.entity.FacturaEntity;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.FacturaJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.agromarket.domain.model.RolUsuario;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class FacturaServiceImpl implements FacturaService {
    private final FacturaJpaRepository facturaJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final FacturaMapper facturaMapper;

    @Override
    public FacturaResponse getByPedidoId(Long pedidoId, Long solicitanteId) {
        FacturaEntity factura = facturaJpaRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada"));
        validarPropietario(factura.getPedido(), solicitanteId);
        return facturaMapper.toResponse(factura);
    }

    @Override
    public FacturaResponse getById(Long id, Long solicitanteId) {
        FacturaEntity factura = facturaJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada"));
        validarPropietario(factura.getPedido(), solicitanteId);
        return facturaMapper.toResponse(factura);
    }

    @Override
    public java.util.List<FacturaResponse> getMisFacturas(Long compradorId) {
        return facturaJpaRepository.findByPedidoCompradorId(compradorId).stream()
                .map(facturaMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public byte[] getFacturaPdf(Long id, Long solicitanteId) {
        FacturaEntity factura = facturaJpaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada"));
        validarPropietario(factura.getPedido(), solicitanteId);

        try (java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4, 36, 36, 36, 36);
            com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();
            
            // Fuentes estilizadas
            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 20, com.lowagie.text.Font.BOLD, new java.awt.Color(46, 125, 50));
            com.lowagie.text.Font sectionFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.BOLD, new java.awt.Color(33, 33, 33));
            com.lowagie.text.Font boldFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9, com.lowagie.text.Font.BOLD, new java.awt.Color(33, 33, 33));
            com.lowagie.text.Font normalFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9, com.lowagie.text.Font.NORMAL, new java.awt.Color(66, 66, 66));
            com.lowagie.text.Font whiteHeaderFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9, com.lowagie.text.Font.BOLD, java.awt.Color.WHITE);
            com.lowagie.text.Font subtitleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 8, com.lowagie.text.Font.ITALIC, new java.awt.Color(76, 175, 80));

            // 1. Tabla de Encabezado (Logo + Empresa)
            com.lowagie.text.pdf.PdfPTable headerTable = new com.lowagie.text.pdf.PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});
            
            com.lowagie.text.pdf.PdfPCell leftCell = new com.lowagie.text.pdf.PdfPCell();
            leftCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            leftCell.addElement(new com.lowagie.text.Paragraph("AgroMarket", titleFont));
            leftCell.addElement(new com.lowagie.text.Paragraph("ASAFRUT · Chigorodó, Antioquia", subtitleFont));
            headerTable.addCell(leftCell);
            
            com.lowagie.text.pdf.PdfPCell rightCell = new com.lowagie.text.pdf.PdfPCell();
            rightCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            com.lowagie.text.Paragraph p1 = new com.lowagie.text.Paragraph("Asociación Agropecuaria El Sabor", normalFont);
            p1.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            rightCell.addElement(p1);
            com.lowagie.text.Paragraph p2 = new com.lowagie.text.Paragraph("de las Frutas y el Campo", normalFont);
            p2.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            rightCell.addElement(p2);
            com.lowagie.text.Paragraph p3 = new com.lowagie.text.Paragraph("NIT: 901.234.567-8", boldFont);
            p3.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            rightCell.addElement(p3);
            headerTable.addCell(rightCell);
            
            document.add(headerTable);

            // Línea divisoria verde
            com.lowagie.text.pdf.PdfPTable divider = new com.lowagie.text.pdf.PdfPTable(1);
            divider.setWidthPercentage(100);
            divider.setSpacingBefore(10);
            divider.setSpacingAfter(15);
            com.lowagie.text.pdf.PdfPCell divCell = new com.lowagie.text.pdf.PdfPCell();
            divCell.setBorder(com.lowagie.text.Rectangle.BOTTOM);
            divCell.setBorderWidth(2f);
            divCell.setBorderColor(new java.awt.Color(46, 125, 50));
            divCell.setPadding(0);
            divider.addCell(divCell);
            document.add(divider);

            // 2. Información de Factura y Partes
            com.lowagie.text.pdf.PdfPTable infoTable = new com.lowagie.text.pdf.PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);
            infoTable.setWidths(new float[]{50, 50});
            
            // Bloque Factura
            com.lowagie.text.pdf.PdfPCell invCell = new com.lowagie.text.pdf.PdfPCell();
            invCell.setBorder(com.lowagie.text.Rectangle.BOX);
            invCell.setBorderColor(new java.awt.Color(224, 224, 224));
            invCell.setPadding(10);
            invCell.setBackgroundColor(new java.awt.Color(245, 245, 245));
            invCell.addElement(new com.lowagie.text.Paragraph("FACTURA ELECTRÓNICA", sectionFont));
            invCell.addElement(new com.lowagie.text.Paragraph("Número: " + factura.getNumeroFactura(), boldFont));
            invCell.addElement(new com.lowagie.text.Paragraph("Fecha Emisión: " + (factura.getFechaEmision() != null ? factura.getFechaEmision().toString().replace('T', ' ').substring(0, 16) : "N/A"), normalFont));
            invCell.addElement(new com.lowagie.text.Paragraph("Estado: PAGADA", boldFont));
            infoTable.addCell(invCell);
            
            // Bloque Partes
            PedidoEntity pedido = factura.getPedido();
            com.lowagie.text.pdf.PdfPCell clientCell = new com.lowagie.text.pdf.PdfPCell();
            clientCell.setBorder(com.lowagie.text.Rectangle.BOX);
            clientCell.setBorderColor(new java.awt.Color(224, 224, 224));
            clientCell.setPadding(10);
            clientCell.addElement(new com.lowagie.text.Paragraph("DETALLES DE ENTREGA", sectionFont));
            clientCell.addElement(new com.lowagie.text.Paragraph("Comprador: " + (pedido != null && pedido.getComprador() != null ? pedido.getComprador().getNombre() : "N/A"), normalFont));
            clientCell.addElement(new com.lowagie.text.Paragraph("Productor: " + (pedido != null && pedido.getProducto() != null && pedido.getProducto().getProductor() != null ? pedido.getProducto().getProductor().getNombre() : "N/A"), normalFont));
            if (pedido != null && pedido.getEnvio() != null) {
                clientCell.addElement(new com.lowagie.text.Paragraph("Dirección: " + pedido.getEnvio().getDireccionDestino(), normalFont));
            }
            infoTable.addCell(clientCell);
            
            document.add(infoTable);

            // 3. Tabla de Productos/Items
            com.lowagie.text.pdf.PdfPTable itemsTable = new com.lowagie.text.pdf.PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{45, 15, 20, 20});
            itemsTable.setSpacingAfter(20);
            
            String[] headers = {"Producto", "Cantidad", "Precio Unitario", "Total"};
            for (String hText : headers) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(hText, whiteHeaderFont));
                cell.setBackgroundColor(new java.awt.Color(46, 125, 50));
                cell.setPadding(6);
                cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                cell.setBorderColor(new java.awt.Color(38, 105, 42));
                itemsTable.addCell(cell);
            }
            
            if (pedido != null) {
                String prodNombre = pedido.getProducto() != null ? pedido.getProducto().getNombre() : "Producto ASAFRUT";
                String cantidad = pedido.getCantidad() + " kg";
                String precio = "$" + String.format(java.util.Locale.US, "%,.2f", pedido.getPrecioUnitario().doubleValue()).replace(',', '.');
                String totalItem = "$" + String.format(java.util.Locale.US, "%,.2f", pedido.getTotal().doubleValue()).replace(',', '.');
                
                com.lowagie.text.pdf.PdfPCell c1 = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(prodNombre, normalFont));
                c1.setPadding(8);
                c1.setBorderColor(new java.awt.Color(224, 224, 224));
                itemsTable.addCell(c1);
                
                com.lowagie.text.pdf.PdfPCell c2 = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(cantidad, normalFont));
                c2.setPadding(8);
                c2.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                c2.setBorderColor(new java.awt.Color(224, 224, 224));
                itemsTable.addCell(c2);
                
                com.lowagie.text.pdf.PdfPCell c3 = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(precio, normalFont));
                c3.setPadding(8);
                c3.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
                c3.setBorderColor(new java.awt.Color(224, 224, 224));
                itemsTable.addCell(c3);
                
                com.lowagie.text.pdf.PdfPCell c4 = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(totalItem, normalFont));
                c4.setPadding(8);
                c4.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
                c4.setBorderColor(new java.awt.Color(224, 224, 224));
                itemsTable.addCell(c4);
            }
            
            document.add(itemsTable);

            // 4. Tabla de Totales (Alineada a la derecha)
            com.lowagie.text.pdf.PdfPTable totalsTable = new com.lowagie.text.pdf.PdfPTable(2);
            totalsTable.setWidthPercentage(45);
            totalsTable.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            totalsTable.setWidths(new float[]{50, 50});
            totalsTable.setSpacingAfter(30);
            
            // Subtotal
            com.lowagie.text.pdf.PdfPCell subLabel = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase("Subtotal:", boldFont));
            subLabel.setPadding(6);
            subLabel.setBorderColor(new java.awt.Color(240, 240, 240));
            totalsTable.addCell(subLabel);
            
            com.lowagie.text.pdf.PdfPCell subCell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase("$" + String.format(java.util.Locale.US, "%,.2f", factura.getSubtotal().doubleValue()).replace(',', '.'), normalFont));
            subCell.setPadding(6);
            subCell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            subCell.setBorderColor(new java.awt.Color(240, 240, 240));
            totalsTable.addCell(subCell);
            
            // IVA
            com.lowagie.text.pdf.PdfPCell ivaLabel = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase("IVA (19%):", boldFont));
            ivaLabel.setPadding(6);
            ivaLabel.setBorderColor(new java.awt.Color(240, 240, 240));
            totalsTable.addCell(ivaLabel);
            
            com.lowagie.text.pdf.PdfPCell ivaCell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase("$" + String.format(java.util.Locale.US, "%,.2f", factura.getImpuesto().doubleValue()).replace(',', '.'), normalFont));
            ivaCell.setPadding(6);
            ivaCell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            ivaCell.setBorderColor(new java.awt.Color(240, 240, 240));
            totalsTable.addCell(ivaCell);
            
            // Total
            com.lowagie.text.pdf.PdfPCell labelTotal = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase("TOTAL:", whiteHeaderFont));
            labelTotal.setBackgroundColor(new java.awt.Color(46, 125, 50));
            labelTotal.setPadding(8);
            labelTotal.setBorderColor(new java.awt.Color(46, 125, 50));
            totalsTable.addCell(labelTotal);
            
            com.lowagie.text.pdf.PdfPCell valTotal = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase("$" + String.format(java.util.Locale.US, "%,.2f", factura.getTotal().doubleValue()).replace(',', '.'), whiteHeaderFont));
            valTotal.setBackgroundColor(new java.awt.Color(46, 125, 50));
            valTotal.setPadding(8);
            valTotal.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            valTotal.setBorderColor(new java.awt.Color(46, 125, 50));
            totalsTable.addCell(valTotal);
            
            document.add(totalsTable);

            // 5. Pie de página
            com.lowagie.text.Paragraph footer = new com.lowagie.text.Paragraph("¡Gracias por su compra y por apoyar a nuestros productores locales de ASAFRUT!", subtitleFont);
            footer.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(footer);
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF de la factura", e);
        }
    }

    private void validarPropietario(PedidoEntity pedido, Long solicitanteId) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(solicitanteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        boolean esAdmin = usuario.getRol() == RolUsuario.ADMINISTRADOR;
        boolean esDueno = pedido != null && pedido.getComprador() != null && pedido.getComprador().getId() != null && pedido.getComprador().getId().equals(solicitanteId);
        boolean esProductor = pedido != null && pedido.getProducto() != null && pedido.getProducto().getProductor() != null && pedido.getProducto().getProductor().getId() != null && pedido.getProducto().getProductor().getId().equals(solicitanteId);
        if (!esAdmin && !esDueno && !esProductor) {
            throw new AccesoDenegadoException("No tiene permisos para ver esta factura");
        }
    }
}
