package com.agromarket.infrastructure.pdf;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.api.response.admin.AdminDashboardResponse;
import com.agromarket.application.adapters.api.response.admin.IngresosMesResponse;
import com.agromarket.application.adapters.api.response.admin.TopProductorResponse;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import lombok.extern.slf4j.Slf4j;

/**
 * Genera el PDF del "Reporte Mensual" del panel de administración con los
 * datos reales del dashboard (AdminDashboardResponse), usando OpenPDF
 * (la misma librería que las facturas, ya presente en el pom.xml).
 */
@Component
@Slf4j
public class AdminReportPdfGenerator {

    private static final DateTimeFormatter FECHA_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generar(AdminDashboardResponse data) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 48, 48);
            PdfWriter.getInstance(document, out);
            document.open();

            Font h1 = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font h2 = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font small = FontFactory.getFont(FontFactory.HELVETICA, 8.5f);
            Font th = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);

            Paragraph titulo = new Paragraph("AgroMarket · ASAFRUT", h1);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);

            Paragraph subtitulo = new Paragraph(
                    "Reporte general de la plataforma — generado el "
                            + LocalDateTime.now().format(FECHA_FMT),
                    normal);
            subtitulo.setAlignment(Element.ALIGN_CENTER);
            subtitulo.setSpacingAfter(18);
            document.add(subtitulo);

            if (data == null) {
                document.add(new Paragraph("Sin datos disponibles.", normal));
                document.close();
                return out.toByteArray();
            }

            document.add(new Paragraph("1. Indicadores generales", h2));
            document.add(tablaKpis(data, th, small));
            document.add(spacer());

            document.add(new Paragraph("2. Pedidos por estado", h2));
            document.add(tablaEstados(data, th, small));
            document.add(spacer());

            document.add(new Paragraph("3. Top productores", h2));
            document.add(tablaTop(data.topProductores(), th, small));
            document.add(spacer());

            document.add(new Paragraph("4. Ingresos por mes (últimos 6 meses)", h2));
            document.add(tablaIngresos(data.ingresosPorMes(), th, small));

            Paragraph pie = new Paragraph(
                    "Reporte generado automáticamente por el backend de AgroMarket.",
                    small);
            pie.setSpacingBefore(20);
            pie.setAlignment(Element.ALIGN_CENTER);
            document.add(pie);

            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            log.error("Error generando el reporte PDF del administrador", ex);
            throw new IllegalStateException(
                    "No se pudo generar el reporte PDF: " + ex.getMessage(), ex);
        }
    }

    private Element spacer() {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(10);
        return p;
    }

    private PdfPCell celda(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text == null ? "" : text, font));
        cell.setPadding(6);
        return cell;
    }

    private PdfPCell celdaHeader(String text, Font font) {
        PdfPCell cell = celda(text, font);
        cell.setBackgroundColor(new java.awt.Color(232, 245, 233));
        return cell;
    }

    private PdfPTable tablaKpis(AdminDashboardResponse d, Font th, Font td) {
        PdfPTable table = new PdfPTable(new float[] { 3, 2 });
        table.setWidthPercentage(100);
        table.addCell(celdaHeader("Indicador", th));
        table.addCell(celdaHeader("Valor", th));
        table.addCell(celda("Usuarios totales", td));
        table.addCell(celda(String.valueOf(d.usuariosTotales()), td));
        table.addCell(celda("Productores activos", td));
        table.addCell(celda(String.valueOf(d.productores()), td));
        table.addCell(celda("Productos publicados", td));
        table.addCell(celda(String.valueOf(d.productosPublicados()), td));
        table.addCell(celda("Pedidos totales", td));
        table.addCell(celda(String.valueOf(d.pedidosTotales()), td));
        table.addCell(celda("Ingresos confirmados", td));
        table.addCell(celda("$ " + d.ingresos(), td));
        table.addCell(celda("Ventas de hoy", td));
        table.addCell(celda("$ " + d.ventasHoy(), td));
        table.addCell(celda("Nuevos usuarios (30 días)", td));
        table.addCell(celda(String.valueOf(d.nuevosUsuarios()), td));
        table.addCell(celda("Nuevos productores (30 días)", td));
        table.addCell(celda(String.valueOf(d.nuevosProductores()), td));
        return table;
    }

    private PdfPTable tablaEstados(AdminDashboardResponse d, Font th, Font td) {
        PdfPTable table = new PdfPTable(new float[] { 3, 2 });
        table.setWidthPercentage(100);
        table.addCell(celdaHeader("Estado", th));
        table.addCell(celdaHeader("Pedidos", th));
        table.addCell(celda("Entregados", td));
        table.addCell(celda(String.valueOf(d.pedidosEntregados()), td));
        table.addCell(celda("En camino (enviados)", td));
        table.addCell(celda(String.valueOf(d.pedidosEnCamino()), td));
        table.addCell(celda("Pendientes", td));
        table.addCell(celda(String.valueOf(d.pedidosPendientes()), td));
        table.addCell(celda("Cancelados", td));
        table.addCell(celda(String.valueOf(d.pedidosCancelados()), td));
        return table;
    }

    private PdfPTable tablaTop(List<TopProductorResponse> top, Font th, Font td) {
        PdfPTable table = new PdfPTable(new float[] { 0.6f, 3, 1.4f, 2 });
        table.setWidthPercentage(100);
        table.addCell(celdaHeader("#", th));
        table.addCell(celdaHeader("Productor", th));
        table.addCell(celdaHeader("Pedidos", th));
        table.addCell(celdaHeader("Total ventas", th));
        if (top == null || top.isEmpty()) {
            table.addCell(celda("—", td));
            table.addCell(celda("Sin datos", td));
            table.addCell(celda("—", td));
            table.addCell(celda("—", td));
            return table;
        }
        int i = 1;
        for (TopProductorResponse fila : top) {
            table.addCell(celda(String.valueOf(i++), td));
            table.addCell(celda(fila.nombre(), td));
            table.addCell(celda(String.valueOf(fila.pedidos()), td));
            table.addCell(celda("$ " + fila.totalVentas(), td));
        }
        return table;
    }

    private PdfPTable tablaIngresos(List<IngresosMesResponse> ingresos, Font th, Font td) {
        PdfPTable table = new PdfPTable(new float[] { 2, 3 });
        table.setWidthPercentage(100);
        table.addCell(celdaHeader("Mes", th));
        table.addCell(celdaHeader("Ingresos", th));
        if (ingresos == null || ingresos.isEmpty()) {
            table.addCell(celda("—", td));
            table.addCell(celda("Sin datos", td));
            return table;
        }
        for (IngresosMesResponse fila : ingresos) {
            table.addCell(celda(fila.etiqueta(), td));
            table.addCell(celda("$ " + fila.total(), td));
        }
        return table;
    }
}
