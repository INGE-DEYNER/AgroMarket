package com.agromarket.application.adapters.api.controllers.support;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.domain.ports.out.user.EmailPort;

import lombok.RequiredArgsConstructor;

/**
 * Reportes de la pagina "Reportar un problema".
 *
 * <p>POST /api/v1/soporte/reportes (publico)
 * Body: { category, subject, description, email }
 *
 * <h2>Por que este endpoint existe</h2>
 *
 * <p>El formulario del frontend hacia {@code e.preventDefault()} y guardaba el
 * reporte en el {@code localStorage} del navegador de quien lo escribia. El
 * usuario veia "enviado" y el mensaje se perdia: AgroMarket no se enteraba
 * nunca. Este endpoint guarda el reporte y avisa por correo.
 *
 * <p>Se guarda en DOS sitios a proposito:
 * <ul>
 *   <li>Mongo (coleccion {@code support_reports}), para que el reporte exista
 *       aunque el correo falle.</li>
 *   <li>Correo al buzon de soporte, que es lo que hace que alguien lo lea
 *       hoy mismo.</li>
 * </ul>
 *
 * <h2>Por que el HTML escapa lo que viene del usuario</h2>
 *
 * <p>El asunto y la descripcion los escribe una persona y se insertan dentro
 * de un correo en HTML, donde un {@code <script>} pasaria a ser real. Por eso
 * pasan por {@link #escapar(String)}.
 */
@RestController
@RequestMapping("/api/v1/soporte")
@RequiredArgsConstructor
public class SupportReportController {

    private static final Pattern EMAIL = Pattern.compile(
            "^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$");

    /**
     * Categorias admitidas, en lista cerrada. No se acepta cualquier texto:
     * el valor va al HTML del correo y al filtro del panel.
     */
    private static final Map<String, String> CATEGORIAS = Map.of(
            "general", "General",
            "account", "Cuenta",
            "purchase", "Compra",
            "payment", "Pago",
            "shipping", "Envío",
            "product", "Producto",
            "technical", "Problema técnico");

    private static final int MAX_ASUNTO = 120;
    private static final int MAX_DESCRIPCION = 1500;
    private static final int MAX_EMAIL = 255;

    private final MongoTemplate mongoTemplate;
    private final EmailPort emailPort;

    /**
     * Buzon donde llegan los reportes. Sin valor por defecto a proposito: si
     * nadie lo define el reporte se guarda igual, pero no se avisa a nadie, y
     * eso debe verse en los logs en vez de mandarlo a un buzon inventado.
     */
    @Value("${app.support.email:}")
    private String correoSoporte;

    @PostMapping("/reportes")
    public ResponseEntity<Map<String, Object>> crearReporte(
            @RequestBody Map<String, Object> body) {

        Map<String, Object> entrada = body == null ? Map.of() : body;

        String categoria = texto(entrada.get("category"), "general").toLowerCase();
        if (!CATEGORIAS.containsKey(categoria)) {
            categoria = "general";
        }

        String asunto = texto(entrada.get("subject"), "");
        String descripcion = texto(entrada.get("description"), "");
        String email = texto(entrada.get("email"), "").toLowerCase();

        // Se valida a mano y no con @Valid porque el cuerpo llega como Map: con
        // un record annotated se confunde "campo ausente" (null) con "campo
        // vacio" (""), y el mensaje al usuario es mas util si los distingue.
        if (asunto.isBlank()) {
            return error("Escribe un asunto para que podamos ayudarte.", "subject");
        }
        if (asunto.length() > MAX_ASUNTO) {
            return error("El asunto no puede superar " + MAX_ASUNTO + " caracteres.", "subject");
        }
        if (descripcion.isBlank()) {
            return error("Cuéntanos qué pasó para que podamos ayudarte.", "description");
        }
        if (descripcion.length() < 10) {
            return error("Describe un poco más el problema (mínimo 10 caracteres).",
                    "description");
        }
        if (descripcion.length() > MAX_DESCRIPCION) {
            return error("La descripción no puede superar " + MAX_DESCRIPCION + " caracteres.",
                    "description");
        }
        if (!email.isBlank() && !EMAIL.matcher(email).matches()) {
            return error("Ese correo no parece válido. Déjalo vacío si no quieres respuesta.",
                    "email");
        }
        if (email.length() > MAX_EMAIL) {
            return error("El correo es demasiado largo.", "email");
        }

        String id = java.util.UUID.randomUUID().toString();
        LocalDateTime ahora = LocalDateTime.now();

        // 1. Guardar. Esto NO puede fallar por falta de Brevo.
        try {
            Document doc = new Document("_id", id)
                    .append("categoria", categoria)
                    .append("asunto", asunto)
                    .append("descripcion", descripcion)
                    .append("email", email)
                    .append("creado", ahora.toString())
                    .append("leido", false);
            mongoTemplate.getCollection("support_reports").insertOne(doc);
        } catch (Exception ex) {
            // Si ni guardar falla, no se puede decir "enviado": seria repetir el
            // fallo del localStorage, que es justo lo que se arregla aqui.
            return ResponseEntity.status(503).body(Map.of(
                    "ok", false,
                    "field", "form",
                    "message",
                    "No pudimos registrar tu reporte. Intenta de nuevo en un momento."));
        }

        // 2. Avisar por correo. Si falla, el reporte sigue guardado.
        boolean avisado = false;
        if (correoSoporte != null && !correoSoporte.isBlank()) {
            try {
                emailPort.sendGenericEmail(
                        correoSoporte.trim(),
                        "[" + CATEGORIAS.get(categoria) + "] " + asunto,
                        cuerpoCorreo(id, categoria, asunto, descripcion, email, ahora));
                avisado = true;
            } catch (Exception ex) {
                // Se registra, pero no se le devuelve el error al usuario: su
                // reporte SI quedo guardado, y contestarle "fallo" seria
                // empujarle a escribirlo dos veces.
                System.err.println("[soporte] reporte " + id
                        + " guardado pero no se pudo avisar por correo: "
                        + ex.getMessage());
            }
        } else {
            System.err.println("[soporte] reporte " + id
                    + " guardado, pero app.support.email no esta definido: "
                    + "nadie recibio el aviso.");
        }

        Map<String, Object> ok = new HashMap<>();
        ok.put("ok", true);
        ok.put("id", id);
        ok.put("avisado", avisado);
        ok.put("message", avisado
                ? "Recibimos tu reporte. Te respondemos por correo si dejaste uno."
                : "Recibimos tu reporte. Nuestro equipo lo tiene en cola.");
        return ResponseEntity.status(201).body(ok);
    }

    /* ------------------------------------------------------------------ */

    /**
     * Respuesta de error, lista para devolver.
     *
     * <p>Devuelve el ResponseEntity ENVUELTO, no solo el mapa. Antes
     * declaraba {@code Map<String, Object>} y hacia {@code return
     * ResponseEntity.badRequest().body(err);}, que no compila: se estaba
     * devolviendo un ResponseEntity donde se pedia un Map. El mensaje de Java
     * ("incompatible types ... cannot be converted") no senalaba que el
     * problema estaba en la firma del metodo.
     */
    private ResponseEntity<Map<String, Object>> error(String message, String field) {
        Map<String, Object> err = new HashMap<>();
        err.put("ok", false);
        err.put("field", field);
        err.put("message", message);
        return ResponseEntity.badRequest().body(err);
    }

    private String texto(Object valor, String porDefecto) {
        if (valor == null) {
            return porDefecto;
        }
        String s = String.valueOf(valor).trim();
        return s.isEmpty() ? porDefecto : s;
    }

    /**
     * Escapa el texto antes de meterlo en el HTML del correo. Sin esto,
     * escribir una etiqueta en el asunto haria que se interpretara en el
     * correo de quien lo recibe.
     */
    private String escapar(String s) {
        if (s == null) {
            return "";
        }
        return s
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    /**
     * Arma el correo que recibe el equipo de soporte.
     *
     * <p>Va como tabla y con estilos en linea a proposito: los clientes de
     * correo ignoran las hojas de estilo externas y muchos descartan las
     * clases. Es lo mismo que hacen las plantillas que ya hay en
     * {@code resources/email-templates}.
     */
    private String cuerpoCorreo(
            String id,
            String categoria,
            String asunto,
            String descripcion,
            String email,
            LocalDateTime fecha) {

        String correoUsuario = email.isBlank()
                ? "<p style=\"font-size:14px;color:#6b7280;\">"
                  + "El usuario no dejó correo.</p>"
                : "<p style=\"font-size:15px;\">Responder a: <strong>"
                  + escapar(email) + "</strong></p>";

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Nuevo reporte de soporte</title>
                </head>
                <body style="margin:0;padding:0;background:#f4f7f4;
                             font-family:Arial,Helvetica,sans-serif;">
                    <div style="max-width:680px;margin:40px auto;background:#ffffff;
                                border-radius:18px;overflow:hidden;
                                box-shadow:0 8px 30px rgba(0,0,0,.08);">
                        <div style="background:#176b32;padding:32px;color:#ffffff;">
                            <div style="font-size:13px;letter-spacing:3px;
                                        font-weight:bold;margin-bottom:10px;">
                                AGROMARKET
                            </div>
                            <h1 style="margin:0;font-size:26px;">Nuevo reporte</h1>
                        </div>
                        <div style="padding:36px;color:#17351f;">
                            <table style="width:100%;border-collapse:collapse;">
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#6b7280;width:120px;">
                                        Categoria
                                    </td>
                                    <td style="padding:8px 0;font-size:15px;font-weight:bold;">
                                        %s
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Asunto</td>
                                    <td style="padding:8px 0;font-size:15px;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Recibido</td>
                                    <td style="padding:8px 0;font-size:15px;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Referencia</td>
                                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">%s</td>
                                </tr>
                            </table>
                            <h2 style="font-size:15px;margin:28px 0 8px;">Descripcion</h2>
                            <div style="font-size:15px;line-height:1.7;background:#f8faf8;
                                        border-left:3px solid #176b32;padding:16px;
                                        border-radius:0 8px 8px 0;white-space:pre-wrap;">%s</div>
                            <div style="margin-top:28px;">%s</div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                escapar(CATEGORIAS.get(categoria)),
                escapar(asunto),
                fecha.toString(),
                id,
                escapar(descripcion),
                correoUsuario);
    }
}
