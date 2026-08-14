package com.agromarket.application.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa la respuesta para la configuración de autenticación de dos factores (2FA).
 * Contiene la información necesaria para que el usuario configure 2FA en su dispositivo.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorSetupResponse {
    
    private boolean enabled;
    private String secret;
    private String otpauthUrl;
    private String issuer;
    private String accountName;
}
