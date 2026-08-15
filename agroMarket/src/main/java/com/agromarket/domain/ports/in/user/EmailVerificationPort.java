package com.agromarket.domain.ports.in.user;



 /**
  * Puerto de entrada que define las operaciones para la verificación de correo electrónico.
  * Incluye métodos para enviar correos de verificación y validar tokens/códigos.
 * 
* @author AgroMarket Team
  */
 public interface EmailVerificationPort {
   

     /**
      * Envía un correo de verificación a una dirección de email.

     *
      * @param email dirección de correo electrónico
      */
     void sendVerificationEmail(String email);
 

     /**
      * Verifica un token de verificación.

     *
      * @param token token de verificación
      */
     void verifyEmail(String token);


     /**
      * Reenvía el correo de verificación.

     *
      * @param email dirección de correo electrónico
      */
     void resendVerificationEmail(String email);

-    void verifyEmailWithRequest(EmailVerificationRequest request);
 }