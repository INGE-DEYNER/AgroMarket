package com.agromarket.application.adapters.api.response.admin;

import com.agromarket.domain.ports.in.user.UserResult;

/**
 * Usuario con nombres en español tal como los consume el panel de
 * administración (Admin.jsx espera id/nombre/apellido/email/ubicacion/role/
 * activo/verificado).
 *
 * <p>`verificado` usa el indicador unico `accountApproved`: antes se hacia OR
 * entre `verifiedProducer` y `accountApproved`, dos columnas con el mismo
 * significado. `ubicacion` se compone de `city` + `department`, que
 * reemplazaron a la columna `location`.</p>
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
                                componerUbicacion(r.getCity(),
                                                r.getDepartment()),
                                r.getRole() == null ? null : r.getRole().name(),
                                r.isActive(),
                                Boolean.TRUE.equals(r.getAccountApproved()),
                                r.getAccountApproved());
        }

        private static String componerUbicacion(String ciudad,
                        String departamento) {
                boolean hayCiudad = ciudad != null && !ciudad.isBlank();
                boolean hayDepartamento = departamento != null
                                && !departamento.isBlank();

                if (hayCiudad && hayDepartamento) {
                        return ciudad + ", " + departamento;
                }
                if (hayCiudad) {
                        return ciudad;
                }
                return hayDepartamento ? departamento : null;
        }
}