package com.agromarket.domain.ports.in.user;

import java.time.LocalDate;

import com.agromarket.domain.models.enums.user.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Comando de dominio para registrar un usuario.
 *
 * <p>No incluye `location` (se unificó en `department` + `city`) ni
 * `isCompany` (se deriva de `companyName`).</p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterCommand {

    private String firstName;

    private String lastName;

    private String email;

    private String password;

    private String phone;

    private Role role;

    private String countryCode;

    private String idNumber;

    private LocalDate birthDate;

    private String idType;

    private String companyName;

    private String nit;
}