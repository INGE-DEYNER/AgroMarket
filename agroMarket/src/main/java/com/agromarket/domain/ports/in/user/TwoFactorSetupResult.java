package com.agromarket.domain.ports.in.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Resultado de la inicialización de 2FA.
 *
 * <p>El secreto es necesario para que application pueda decidir cómo
 * exponerlo a la API. No contiene información de contraseña.</p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorSetupResult {

    private Long userId;

    private String secret;

    private String qrCodeUri;
}
