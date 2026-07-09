package com.agromarket.application.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorCodeRequest {
    @NotBlank
    @Pattern(regexp = "^[0-9]{6}$", message = "El código OTP debe tener 6 dígitos")
    private String codigo;
}
