package com.agromarket.application.service;

import java.math.BigDecimal;
import java.util.List;

import com.agromarket.application.dto.AdminDashboardResponse;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.mapper.PedidoMapper;
import com.agromarket.application.mapper.UsuarioMapper;
import com.agromarket.application.mapper.PagoMapper;
import com.agromarket.application.dto.PagoResponse;
import com.agromarket.infrastructure.persistence.entity.PagoEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.domain.model.EstadoPago;
import com.agromarket.domain.model.EstadoPedido;
import com.agromarket.infrastructure.persistence.repository.PagoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.PedidoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final ProductoJpaRepository productoJpaRepository;
    private final PedidoJpaRepository pedidoJpaRepository;
    private final PagoJpaRepository pagoJpaRepository;
    private final UsuarioMapper usuarioMapper;
    private final PedidoMapper pedidoMapper;
    private final PagoMapper pagoMapper;
    private final com.agromarket.application.service.EmailService emailService;

    @Override
    public AdminDashboardResponse dashboard() {
        BigDecimal ingresos = pagoJpaRepository.sumMontoConfirmado();
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
    public com.agromarket.application.dto.PageResponse<UsuarioResponse> usuarios(int page, int size, String search) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page), Math.max(1, size), org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
        org.springframework.data.domain.Page<UsuarioEntity> pageResult;
        if (search != null && !search.isBlank()) {
            pageResult = usuarioJpaRepository.searchUsuarios(search, pageable);
        } else {
            pageResult = usuarioJpaRepository.findAll(pageable);
        }
        List<UsuarioResponse> content = usuarioMapper.toResponseList(pageResult.getContent());
        return com.agromarket.application.dto.PageResponse.<UsuarioResponse>builder()
                .content(content)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void aprobarUsuario(Long id) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(id)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("Usuario no encontrado"));
        usuario.setAprobado(true);
        usuario.setCuentaAprobada(true);
        usuario.setActivo(true);
        usuario.setEstadoCuenta("ACTIVA");
        usuarioJpaRepository.save(usuario);

        // Send approval email depending on role
        if (usuario.getRol() == com.agromarket.domain.model.RolUsuario.PRODUCTOR) {
            try {
                emailService.sendTemplateMessage(usuario.getCorreo(), "¡Tu cuenta de productor fue aprobada! 🌾", "welcome-productor", java.util.Map.of(
                    "nombre", usuario.getNombre(),
                    "dashboardUrl", "https://agro-market.app/perfil"
                ));
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(AdminServiceImpl.class).error("Failed to send welcome email to approved producer", e);
            }
        } else if (Boolean.TRUE.equals(usuario.getEsEmpresa())) {
            try {
                emailService.sendTemplateMessage(usuario.getCorreo(), "¡Bienvenido a AgroMarket! 🎉", "welcome", java.util.Map.of(
                    "nombre", usuario.getNombre()
                ));
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(AdminServiceImpl.class).error("Failed to send welcome email to approved empresa", e);
            }
        }
    }

    @Override
    public List<UsuarioResponse> productoresPendientes() {
        List<UsuarioEntity> pendientes = usuarioJpaRepository.findByRolAndAprobadoFalse(com.agromarket.domain.model.RolUsuario.PRODUCTOR);
        return usuarioMapper.toResponseList(pendientes);
    }

    @Override
    public List<UsuarioResponse> usuariosPendientes() {
        List<UsuarioEntity> pendientes = usuarioJpaRepository.findByEstadoCuenta("PENDIENTE_APROBACION");
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
    @org.springframework.transaction.annotation.Transactional
    public void rechazarUsuario(Long id, String motivo) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(id)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("Usuario no encontrado"));
        
        usuario.setEstadoCuenta("RECHAZADA");
        usuario.setCuentaAprobada(false);
        usuario.setAprobado(false);
        usuarioJpaRepository.save(usuario);

        // Send rejection email
        java.util.Map<String, String> model = java.util.Map.of(
            "nombre", usuario.getNombre(),
            "motivo", motivo != null ? motivo : "No cumple con los requisitos de la plataforma."
        );
        try {
            emailService.sendTemplateMessage(usuario.getCorreo(), "Registro no aprobado - AgroMarket", "productor-rechazado", model);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AdminServiceImpl.class)
                .error("Failed to send rejection email to user {}: {}", usuario.getCorreo(), e.getMessage());
        }
    }

    @Override
    public byte[] getReportePdf() {
        try (java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4, 36, 36, 54, 36);
            com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();
            
            // Fonts definition
            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 18, com.lowagie.text.Font.BOLD, java.awt.Color.WHITE);
            com.lowagie.text.Font subTitleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 11, com.lowagie.text.Font.NORMAL, new java.awt.Color(230, 245, 230));
            com.lowagie.text.Font dateFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9, com.lowagie.text.Font.ITALIC, new java.awt.Color(120, 120, 120));
            com.lowagie.text.Font sectionFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 13, com.lowagie.text.Font.BOLD, new java.awt.Color(26, 92, 42));
            com.lowagie.text.Font headerFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.BOLD, java.awt.Color.WHITE);
            com.lowagie.text.Font cellFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9, com.lowagie.text.Font.NORMAL, new java.awt.Color(26, 46, 30));
            com.lowagie.text.Font footerFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9, com.lowagie.text.Font.NORMAL, new java.awt.Color(150, 150, 150));

            // Colors definition
            java.awt.Color primaryColor = new java.awt.Color(26, 92, 42); // #1a5c2a
            java.awt.Color secondaryColor = new java.awt.Color(45, 122, 58); // #2d7a3a
            java.awt.Color lightGreenBg = new java.awt.Color(238, 247, 238); // #eef7ee
            java.awt.Color lightGrayBg = new java.awt.Color(245, 247, 245);
            java.awt.Color borderLight = new java.awt.Color(220, 230, 220);

            // 1. Header Banner
            com.lowagie.text.pdf.PdfPTable headerTable = new com.lowagie.text.pdf.PdfPTable(1);
            headerTable.setWidthPercentage(100);
            
            com.lowagie.text.pdf.PdfPCell titleCell = new com.lowagie.text.pdf.PdfPCell();
            titleCell.setBackgroundColor(primaryColor);
            titleCell.setPadding(18);
            titleCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            
            com.lowagie.text.Paragraph titlePara = new com.lowagie.text.Paragraph("AGROMARKET - ASAFRUT", titleFont);
            titlePara.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            titleCell.addElement(titlePara);
            
            com.lowagie.text.Paragraph subtitlePara = new com.lowagie.text.Paragraph("Reporte Mensual de Administración y Control", subTitleFont);
            subtitlePara.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            subtitlePara.setSpacingBefore(4);
            titleCell.addElement(subtitlePara);
            
            headerTable.addCell(titleCell);
            document.add(headerTable);

            // Date paragraph
            com.lowagie.text.Paragraph datePara = new com.lowagie.text.Paragraph("Fecha de emisión: " + java.time.LocalDate.now(), dateFont);
            datePara.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            datePara.setSpacingAfter(20);
            document.add(datePara);

            // 2. Platform Summary Title
            com.lowagie.text.Paragraph kpiTitle = new com.lowagie.text.Paragraph("RESUMEN DE LA PLATAFORMA", sectionFont);
            kpiTitle.setSpacingAfter(10);
            document.add(kpiTitle);

            // KPI Grid (2x2)
            com.lowagie.text.pdf.PdfPTable kpiTable = new com.lowagie.text.pdf.PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(25);
            
            // Get KPI values
            long totalUsers = usuarioJpaRepository.count();
            long totalProducts = productoJpaRepository.count();
            long totalOrders = pedidoJpaRepository.count();
            BigDecimal totalEarnings = pagoJpaRepository.findAll().stream()
                    .filter(pago -> pago.getEstado() != null && pago.getEstado().name().equals("CONFIRMADO"))
                    .map(PagoEntity::getMonto)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            addKpiCell(kpiTable, "Total Usuarios", String.valueOf(totalUsers), lightGreenBg, borderLight, cellFont);
            addKpiCell(kpiTable, "Productos Globales", String.valueOf(totalProducts), lightGreenBg, borderLight, cellFont);
            addKpiCell(kpiTable, "Pedidos Realizados", String.valueOf(totalOrders), lightGreenBg, borderLight, cellFont);
            addKpiCell(kpiTable, "Ingresos Totales", "$" + totalEarnings.setScale(2, java.math.RoundingMode.HALF_UP).toString(), lightGreenBg, borderLight, cellFont);
            
            document.add(kpiTable);

            // 3. Recent Users
            com.lowagie.text.Paragraph usersTitle = new com.lowagie.text.Paragraph("ÚLTIMOS USUARIOS REGISTRADOS", sectionFont);
            usersTitle.setSpacingAfter(10);
            document.add(usersTitle);

            com.lowagie.text.pdf.PdfPTable usersTable = new com.lowagie.text.pdf.PdfPTable(new float[]{3, 4, 2, 2});
            usersTable.setWidthPercentage(100);
            usersTable.setSpacingAfter(25);

            addTableHeaderCell(usersTable, "Nombre", secondaryColor, headerFont);
            addTableHeaderCell(usersTable, "Correo", secondaryColor, headerFont);
            addTableHeaderCell(usersTable, "Rol", secondaryColor, headerFont);
            addTableHeaderCell(usersTable, "Estado", secondaryColor, headerFont);

            List<UsuarioEntity> usuarios = usuarioJpaRepository.findAll();
            int uCount = 0;
            boolean alternate = false;
            for (UsuarioEntity u : usuarios) {
                if (uCount++ >= 10) break;
                java.awt.Color rowBg = alternate ? lightGrayBg : java.awt.Color.WHITE;
                addTableCell(usersTable, u.getNombre(), rowBg, borderLight, cellFont);
                addTableCell(usersTable, u.getCorreo(), rowBg, borderLight, cellFont);
                addTableCell(usersTable, u.getRol() != null ? u.getRol().name() : "—", rowBg, borderLight, cellFont);
                addTableCell(usersTable, u.isActivo() ? "Activo" : "Inactivo", rowBg, borderLight, cellFont);
                alternate = !alternate;
            }
            if (usuarios.isEmpty()) {
                com.lowagie.text.pdf.PdfPCell emptyCell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Paragraph("No hay usuarios registrados", cellFont));
                emptyCell.setColspan(4);
                emptyCell.setPadding(8);
                emptyCell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                usersTable.addCell(emptyCell);
            }
            document.add(usersTable);

            // 4. Recent Products
            com.lowagie.text.Paragraph prodsTitle = new com.lowagie.text.Paragraph("PRODUCTOS RECIENTES EN CATÁLOGO", sectionFont);
            prodsTitle.setSpacingAfter(10);
            document.add(prodsTitle);

            com.lowagie.text.pdf.PdfPTable prodsTable = new com.lowagie.text.pdf.PdfPTable(new float[]{4, 3, 3});
            prodsTable.setWidthPercentage(100);
            prodsTable.setSpacingAfter(30);

            addTableHeaderCell(prodsTable, "Producto", secondaryColor, headerFont);
            addTableHeaderCell(prodsTable, "Precio/Kg", secondaryColor, headerFont);
            addTableHeaderCell(prodsTable, "Stock Disponible", secondaryColor, headerFont);

            List<com.agromarket.infrastructure.persistence.entity.ProductoEntity> productos = productoJpaRepository.findAll();
            int pCount = 0;
            alternate = false;
            for (com.agromarket.infrastructure.persistence.entity.ProductoEntity p : productos) {
                if (pCount++ >= 10) break;
                java.awt.Color rowBg = alternate ? lightGrayBg : java.awt.Color.WHITE;
                addTableCell(prodsTable, p.getNombre(), rowBg, borderLight, cellFont);
                addTableCell(prodsTable, "$" + p.getPrecio() + "/kg", rowBg, borderLight, cellFont);
                addTableCell(prodsTable, p.getCantidadDisponible() + " kg", rowBg, borderLight, cellFont);
                alternate = !alternate;
            }
            if (productos.isEmpty()) {
                com.lowagie.text.pdf.PdfPCell emptyCell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Paragraph("No hay productos registrados", cellFont));
                emptyCell.setColspan(3);
                emptyCell.setPadding(8);
                emptyCell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                prodsTable.addCell(emptyCell);
            }
            document.add(prodsTable);

            // 5. Divider and Footer
            com.lowagie.text.Paragraph footerLine = new com.lowagie.text.Paragraph("----------------------------------------------------------------------------------------------------------------", footerFont);
            footerLine.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(footerLine);

            com.lowagie.text.Paragraph footerText = new com.lowagie.text.Paragraph("Fin del Reporte Oficial - Generado automáticamente por el Sistema AgroMarket", footerFont);
            footerText.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            footerText.setSpacingBefore(5);
            document.add(footerText);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF del reporte mensual", e);
        }
    }

    private void addKpiCell(com.lowagie.text.pdf.PdfPTable table, String label, String value, java.awt.Color bg, java.awt.Color borderColor, com.lowagie.text.Font textFont) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setBorderColor(borderColor);
        cell.setPadding(10);
        
        com.lowagie.text.Paragraph labelPara = new com.lowagie.text.Paragraph(label.toUpperCase(), new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 7, com.lowagie.text.Font.BOLD, new java.awt.Color(80, 110, 80)));
        labelPara.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
        cell.addElement(labelPara);
        
        com.lowagie.text.Paragraph valuePara = new com.lowagie.text.Paragraph(value, new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 13, com.lowagie.text.Font.BOLD, new java.awt.Color(26, 92, 42)));
        valuePara.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
        valuePara.setSpacingBefore(4);
        cell.addElement(valuePara);
        
        table.addCell(cell);
    }

    private void addTableHeaderCell(com.lowagie.text.pdf.PdfPTable table, String text, java.awt.Color bg, com.lowagie.text.Font font) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Paragraph(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(8);
        cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_LEFT);
        cell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        table.addCell(cell);
    }

    private void addTableCell(com.lowagie.text.pdf.PdfPTable table, String text, java.awt.Color bg, java.awt.Color borderColor, com.lowagie.text.Font font) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Paragraph(text, font));
        cell.setBackgroundColor(bg);
        cell.setBorderColor(borderColor);
        cell.setPadding(8);
        cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_LEFT);
        table.addCell(cell);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void toggleVerificarProductor(Long id) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(id)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("Usuario no encontrado"));
        if (usuario instanceof ProductorEntity productor) {
            productor.setVerificado(!Boolean.TRUE.equals(productor.getVerificado()));
            usuarioJpaRepository.save(productor);
        } else {
            throw new com.agromarket.domain.exception.CredencialesInvalidasException("El usuario no es un productor");
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<PagoResponse> getPagosFideicomiso() {
        return pagoJpaRepository.findAll().stream()
                .filter(pago -> pago.getEstado() == EstadoPago.EN_FIDEICOMISO)
                .map(pagoMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void liberarPago(Long pagoId) {
        PagoEntity pago = pagoJpaRepository.findById(pagoId)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("Pago no encontrado"));
        if (pago.getEstado() != EstadoPago.EN_FIDEICOMISO) {
            throw new com.agromarket.domain.exception.CredencialesInvalidasException("El pago no está en fideicomiso");
        }
        pago.setEstado(EstadoPago.CONFIRMADO);
        if (pago.getPedido() != null) {
            pago.getPedido().setEstado(EstadoPedido.ENTREGADO);
            pedidoJpaRepository.save(pago.getPedido());
            try {
                String productorEmail = pago.getPedido().getProducto().getProductor().getCorreo();
                if (productorEmail != null) {
                    emailService.sendHtmlMessage(
                        productorEmail,
                        "Pago liberado - Pedido #" + pago.getPedido().getId(),
                        "<h2>Fondos Liberados</h2><p>El pago para tu pedido #" + pago.getPedido().getId() + " ha sido liberado del fideicomiso y transferido a tu cuenta.</p>"
                    );
                }
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(AdminServiceImpl.class).error("Error notificando liberación de pago al productor", e);
            }
        }
        pagoJpaRepository.save(pago);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void reembolsarPago(Long pagoId) {
        PagoEntity pago = pagoJpaRepository.findById(pagoId)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("Pago no encontrado"));
        if (pago.getEstado() != EstadoPago.EN_FIDEICOMISO) {
            throw new com.agromarket.domain.exception.CredencialesInvalidasException("El pago no está en fideicomiso");
        }
        pago.setEstado(EstadoPago.REEMBOLSADO);
        if (pago.getPedido() != null) {
            pago.getPedido().setEstado(EstadoPedido.CANCELADO);
            pedidoJpaRepository.save(pago.getPedido());
        }
        pagoJpaRepository.save(pago);
    }
}
