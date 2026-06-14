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
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();
            
            document.add(new com.lowagie.text.Paragraph("AGROMARKET - ASAFRUT"));
            document.add(new com.lowagie.text.Paragraph("Asociacion Agropecuaria El Sabor de las Frutas y el Campo"));
            document.add(new com.lowagie.text.Paragraph("Chigorodo, Antioquia, Colombia"));
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------"));
            document.add(new com.lowagie.text.Paragraph("FACTURA ELECTRONICA: " + factura.getNumeroFactura()));
            document.add(new com.lowagie.text.Paragraph("Fecha de emision: " + factura.getFechaEmision()));
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------"));
            
            PedidoEntity pedido = factura.getPedido();
            if (pedido != null) {
                document.add(new com.lowagie.text.Paragraph("Pedido #" + pedido.getId()));
                document.add(new com.lowagie.text.Paragraph("Comprador: " + (pedido.getComprador() != null ? pedido.getComprador().getNombre() : "N/A")));
                document.add(new com.lowagie.text.Paragraph("Productor: " + (pedido.getProducto() != null && pedido.getProducto().getProductor() != null ? pedido.getProducto().getProductor().getNombre() : "N/A")));
                document.add(new com.lowagie.text.Paragraph("Producto: " + (pedido.getProducto() != null ? pedido.getProducto().getNombre() : "N/A")));
                document.add(new com.lowagie.text.Paragraph("Cantidad: " + pedido.getCantidad() + " kg"));
                document.add(new com.lowagie.text.Paragraph("Precio unitario: $" + pedido.getPrecioUnitario() + "/kg"));
            }
            
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------"));
            document.add(new com.lowagie.text.Paragraph("Subtotal: $" + factura.getSubtotal()));
            document.add(new com.lowagie.text.Paragraph("IVA (19%): $" + factura.getImpuesto()));
            document.add(new com.lowagie.text.Paragraph("TOTAL: $" + factura.getTotal()));
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------"));
            document.add(new com.lowagie.text.Paragraph("Gracias por su compra y por apoyar a nuestros agricultores locales!"));
            
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
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para ver esta factura");
        }
    }
}
