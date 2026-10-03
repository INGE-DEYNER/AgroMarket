package com.agromarket.application.adapters.api.request.user;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;

/**
 * Petición de actualización de perfil propio (PUT /usuarios/me y su alias
 * PUT /usuarios/mi-perfil).
 *
 * <p>No acepta `location` (se unificó en `department` + `city`) ni
 * `isCompany` (se deriva de `companyName`).</p>
 *
 * <p>Los alias en español evitan que un cliente que mande las claves
 * traducidas (p. ej. `nombre`, `telefono`) se quede creyendo que guardó el
 * perfil cuando el backend descarta en silencio los campos desconocidos.
 * Es el mismo criterio que ya usa `CreditCardController.CreateCardRequest`.</p>
 */
public record UpdateProfileRequest(
        @Size(max=100) @JsonAlias({ "nombre" }) String firstName,
        @Size(max=100) @JsonAlias({ "apellido" }) String lastName,
        @Size(max=30) @JsonAlias({ "telefono" }) String phone,
        @Size(max=10) @JsonAlias({ "codigoPais" }) String countryCode,
        @Size(max=50) String idNumber,
        @Past LocalDate birthDate,
        @Size(max=20) String idType,
        @Size(max=255) @JsonAlias({ "nombreEmpresa" }) String companyName,
        @Size(max=50) String nit,
        @Size(max=100) @JsonAlias({ "departamento" }) String department,
        @Size(max=100) @JsonAlias({ "ciudad" }) String city,
        @Size(max=500) @JsonAlias({ "direccionCompleta" }) String fullAddress,
        @Size(max=255) @JsonAlias({ "referencia" }) String addressReference,
        @Size(max=20) @JsonAlias({ "codigoPostal" }) String postalCode,
        @Size(max=500) @JsonAlias({ "fotoUrl" }) String photoUrl,
        @Size(max=10) @JsonAlias({ "divisaPreferida" }) String preferredCurrency) {}
