package com.agromarket.application.service;

import java.math.BigDecimal;
import java.util.List;

import com.agromarket.application.dto.AdminDashboardResponse;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.mapper.PedidoMapper;
import com.agromarket.application.mapper.UsuarioMapper;
import com.agromarket.infrastructure.persistence.entity.PagoEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.PagoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.PedidoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings({"null", "unused"})
public class AdminServiceImpl implements AdminService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final ProductoJpaRepository productoJpaRepository;
    private final PedidoJpaRepository pedidoJpaRepository;
    private final PagoJpaRepository pagoJpaRepository;
    private final UsuarioMapper usuarioMapper;
    private final PedidoMapper pedidoMapper;
    private final com.agromarket.application.service.EmailService emailService;

    @Override
    public AdminDashboardResponse dashboard() {
        BigDecimal ingresos = pagoJpaRepository.findAll().stream()
                .filter(pago -> pago.getEstado() != null && pago.getEstado().name().equals("CONFIRMADO"))
                .map(PagoEntity::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return AdminDashboardResponse.builder()
                .totalUsuarios(usuarioJpaRepository.count())
                .totalProductos(productoJpaRepository.count())
                .totalPedidos(pedidoJpaRepository.count())
                .ingresos(ingresos)
                .build();
    }

    @Override
    public List<PedidoResponse> pedidos() {
        return pedidoMapper.toResponseList(pedidoJpaRepository.findAll());
    }

    @Override
    public List<UsuarioResponse> usuarios() {
        return usuarioMapper.toResponseList(usuarioJpaRepository.findAll());
    }

    @Override
    public void aprobarUsuario(Long id) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(id)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("Usuario no encontrado"));
        usuario.setAprobado(true);
        usuario.setActivo(true);
        usuarioJpaRepository.save(usuario);

        // Send approval email
        java.util.Map<String, String> model = java.util.Map.of("nombre", usuario.getNombre());
        try {
            emailService.sendTemplateMessage(usuario.getCorreo(), "AgroMarket - Cuenta de Productor Aprobada", "productor-aprobado", model);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AdminServiceImpl.class)
                .error("Failed to send approval email to producer {}: {}", usuario.getCorreo(), e.getMessage());
        }
    }

    @Override
    public List<UsuarioResponse> productoresPendientes() {
        List<UsuarioEntity> pendientes = usuarioJpaRepository.findByRolAndAprobadoFalse(com.agromarket.domain.model.RolUsuario.PRODUCTOR);
        return usuarioMapper.toResponseList(pendientes);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void rechazarProductor(Long id, String motivo) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(id)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("Usuario no encontrado"));

        // Send rejection email first
        java.util.Map<String, String> model = java.util.Map.of(
            "nombre", usuario.getNombre(),
            "motivo", motivo != null ? motivo : "No cumple con los requisitos mínimos de la plataforma."
        );
        try {
            emailService.sendTemplateMessage(usuario.getCorreo(), "AgroMarket - Registro de Productor Rechazado", "productor-rechazado", model);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AdminServiceImpl.class)
                .error("Failed to send rejection email to producer {}: {}", usuario.getCorreo(), e.getMessage());
        }

        // Delete user
        usuarioJpaRepository.delete(usuario);
    }

    @Override
    public byte[] getReportePdf() {
        try (java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();
            
            document.add(new com.lowagie.text.Paragraph("AGROMARKET - ASAFRUT"));
            document.add(new com.lowagie.text.Paragraph("REPORTE MENSUAL DE ADMINISTRACION Y CONTROL"));
            document.add(new com.lowagie.text.Paragraph("Fecha de emision: " + java.time.LocalDate.now()));
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------"));
            
            document.add(new com.lowagie.text.Paragraph("RESUMEN DE PLATAFORMA:"));
            document.add(new com.lowagie.text.Paragraph("- Total Usuarios Registrados: " + usuarioJpaRepository.count()));
            document.add(new com.lowagie.text.Paragraph("- Total Productos en Catalogo: " + productoJpaRepository.count()));
            document.add(new com.lowagie.text.Paragraph("- Total Pedidos Realizados: " + pedidoJpaRepository.count()));
            
            BigDecimal ingresos = pagoJpaRepository.findAll().stream()
                    .filter(pago -> pago.getEstado() != null && pago.getEstado().name().equals("CONFIRMADO"))
                    .map(PagoEntity::getMonto)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            document.add(new com.lowagie.text.Paragraph("- Ingresos Totales Confirmados: $" + ingresos.setScale(2, java.math.RoundingMode.HALF_UP)));
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------"));
            
            document.add(new com.lowagie.text.Paragraph("ULTIMOS USUARIOS REGISTRADOS:"));
            List<UsuarioEntity> usuarios = usuarioJpaRepository.findAll();
            int uCount = 0;
            for (UsuarioEntity u : usuarios) {
                if (uCount++ >= 10) break;
                document.add(new com.lowagie.text.Paragraph(String.format("  * %s (%s) - Rol: %s - Activo: %s", 
                        u.getNombre(), u.getCorreo(), u.getRol(), u.isActivo() ? "SI" : "NO")));
            }
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------"));
            
            document.add(new com.lowagie.text.Paragraph("PRODUCTOS RECIENTES EN CATALOGO:"));
            List<com.agromarket.infrastructure.persistence.entity.ProductoEntity> productos = productoJpaRepository.findAll();
            int pCount = 0;
            for (com.agromarket.infrastructure.persistence.entity.ProductoEntity p : productos) {
                if (pCount++ >= 10) break;
                document.add(new com.lowagie.text.Paragraph(String.format("  * %s - Precio: $%s/kg - Stock: %s kg", 
                        p.getNombre(), p.getPrecio(), p.getStock())));
            }
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------"));
            document.add(new com.lowagie.text.Paragraph("Fin del Reporte Oficial - Administracion AgroMarket."));
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF del reporte mensual", e);
        }
    }
}
