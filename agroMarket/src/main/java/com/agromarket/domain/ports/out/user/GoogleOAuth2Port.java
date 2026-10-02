package com.agromarket.domain.ports.out.user;


/**
 * Puerto de salida para la integración con Google OAuth2.
 */
public interface GoogleOAuth2Port {

    /**
     * Construye la URL de autorización de Google.
     */
    String buildAuthorizationUrl();

    /**
     * Intercambia el authorization code por la información del usuario.
     *
     * @param code authorization code entregado por Google
     * @return información del usuario autenticado por Google
     */
    GoogleUserInfo exchangeCodeForUserInfo(String code);

    /**
     * Información mínima del usuario devuelta por Google.
     *
     * <p>Se mantiene junto al puerto porque representa el contrato
     * específico de esta integración y no un DTO de la API.</p>
     */
    class GoogleUserInfo {

        private final String email;
        private final String firstName;
        private final String picture;
        private final String googleId;

        public GoogleUserInfo(
                String email,
                String firstName,
                String picture,
                String googleId) {
            this.email = email;
            this.firstName = firstName;
            this.picture = picture;
            this.googleId = googleId;
        }

        public String getEmail() {
            return email;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getPicture() {
            return picture;
        }

        public String getGoogleId() {
            return googleId;
        }
    }
}