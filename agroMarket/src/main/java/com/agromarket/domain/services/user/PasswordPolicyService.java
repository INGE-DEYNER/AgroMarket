package com.agromarket.domain.services.user;


/**
 * Servicio de dominio para validar las reglas de contraseñas.
 */
public class PasswordPolicyService {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;

    /**
     * Valida una contraseña según las reglas del dominio.
     *
     * @param password contraseña
     */
    public void validate(String password) {

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException(
                    "La contraseña es obligatoria"
            );
        }

        if (password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException(
                    "La contraseña debe tener al menos 8 caracteres"
            );
        }

        if (password.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    "La contraseña no puede superar los 128 caracteres"
            );
        }

        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException(
                    "La contraseña debe contener al menos una letra mayúscula"
            );
        }

        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException(
                    "La contraseña debe contener al menos una letra minúscula"
            );
        }

        if (!password.matches(".*\\d.*")) {
            throw new IllegalArgumentException(
                    "La contraseña debe contener al menos un número"
            );

        }

        if (!password.matches(".*[^a-zA-Z0-9].*")) {
            throw new IllegalArgumentException(
                    "La contraseña debe contener al menos un carácter especial"
            );
        }
    }
}