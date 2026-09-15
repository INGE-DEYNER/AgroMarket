package com.agromarket.domain.ports.in.user;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Comando de dominio para actualizar información del perfil.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileCommand {

    private String firstName;

    private String lastName;

    private String phone;

    private String countryCode;

    private String location;

    private String idNumber;

    private LocalDate birthDate;

    private String idType;

    private String companyName;

    private String nit;

    private Boolean isCompany;

    private String department;

    private String city;

    private String fullAddress;

    private String addressReference;

    private String postalCode;

    private String photoUrl;

    private String preferredCurrency;
}