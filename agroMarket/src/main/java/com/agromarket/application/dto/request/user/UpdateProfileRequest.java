package com.agromarket.application.dto.request.user;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una solicitud para actualizar el perfil de un usuario.
 * Contiene los datos personales que un usuario puede modificar.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    
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
    private String photoUrl;
    private String preferredCurrency;
    private String department;
    private String city;
    private String fullAddress;
    private String addressReference;
    private String postalCode;
}
