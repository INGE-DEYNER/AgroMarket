package com.agromarket.application.adapters.api.response.user;

import com.agromarket.domain.ports.in.user.UserResult;

/**
 * Ficha pública de un usuario: lo único que un visitante sin sesión puede ver.
 *
 * <p>La respuesta completa ({@link UserResponse}) incluye teléfono, documento,
 * fecha de nacimiento, dirección y referencia de la misma, que no pertenecen a
 * un perfil público. Con la Ley 1581 de 2012 (Colombia) exponerlos sin
 * consentimiento es una infracción, así que aquí no aparecen.
 */
public record ProducerPublicResponse(
        Long id,
        String firstName,
        String lastName,
        String companyName,
        String photoUrl,
        String department,
        String city,
        String role) {

    public static ProducerPublicResponse from(UserResult u) {
        if (u == null) {
            return null;
        }
        return new ProducerPublicResponse(
                u.getId(),
                u.getFirstName(),
                u.getLastName(),
                u.getCompanyName(),
                u.getPhotoUrl(),
                u.getDepartment(),
                u.getCity(),
                u.getRole() == null ? null : u.getRole().name());
    }

    /** Nombre a mostrar: la empresa si existe, si no nombre y apellido. */
    public String nombreMostrado() {
        if (companyName != null && !companyName.isBlank()) {
            return companyName;
        }
        String nombre = firstName == null ? "" : firstName.trim();
        String apellido = lastName == null ? "" : lastName.trim();
        String completo = (nombre + " " + apellido).trim();
        return completo.isEmpty() ? "Productor" : completo;
    }
}