package com.agromarket.application.adapters.api.response.admin;

import com.agromarket.domain.ports.in.user.UserResult;

/**
 * Usuario con nombres en español tal como los consume el panel de
 * administración (Admin.jsx espera id/nombre/apellido/email/ubicacion/role/
 * activo/verificado).
 */
public record AdminUsuarioResponse(
                Long id,
                String nombre,
                String apellido,
                String email,
                String ubicacion,
                String role,
                boolean activo,
                boolean verificado,
                Boolean accountApproved) {

        public static AdminUsuarioResponse from(UserResult r) {
                if (r == null) {
                        return null;
                }

                return new AdminUsuarioResponse(
                                r.getId(),
                                r.getFirstName(),
                                r.getLastName(),
                                r.getEmail(),
                                r.getLocation(),
                                r.getRole() == null ? null : r.getRole().name(),
                                r.isActive(),
                                Boolean.TRUE.equals(r.getVerifiedProducer())
                                                || Boolean.TRUE.equals(r.getAccountApproved()),
                                r.getAccountApproved());
        }
}