package com.agromarket.domain.ports.out.user;

/**
 * Puerto de salida para correos transaccionales.
 */
public interface EmailPort {

    void sendVerificationEmail(
            String email,
            String token);

    void sendPasswordResetEmail(
            String email,
            String token);

    /**
     * Envía un correo con un archivo adjunto (usado para enviar la factura
     * en PDF al correo del comprador).
     *
     * @param email destinatario
     * @param subject asunto del correo
     * @param htmlContent cuerpo del correo en HTML
     * @param attachmentName nombre del archivo adjunto (p. ej. factura.pdf)
     * @param attachment contenido binario del adjunto (el PDF)
     */
    void sendInvoiceEmail(
            String email,
            String subject,
            String htmlContent,
            String attachmentName,
            byte[] attachment);

    /**
     * Envía un correo con contenido HTML, sin adjunto.
     *
     * <p>Existe para los avisos internos (reportes de soporte, formularios de
     * contacto) que no son transaccionales hacia el usuario, sino hacia el
     * equipo. Antes no había forma de hacerlos: el único envío con contenido
     * libre era el de la factura, que exige adjunto.
     *
     * @param email destinatario
     * @param subject asunto
     * @param htmlContent cuerpo en HTML
     */
    void sendGenericEmail(
            String email,
            String subject,
            String htmlContent);
}