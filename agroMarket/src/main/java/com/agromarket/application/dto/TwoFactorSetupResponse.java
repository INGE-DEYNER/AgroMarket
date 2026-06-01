package com.agromarket.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
