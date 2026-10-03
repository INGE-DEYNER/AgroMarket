package com.agromarket.application.adapters.api.response.user;

import com.agromarket.domain.ports.in.user.TwoFactorSetupResult;

public record TwoFactorSetupResponse(
        Long userId,
        String secret,
        String qrCodeUri) {

    public static TwoFactorSetupResponse from(TwoFactorSetupResult r) {
        return new TwoFactorSetupResponse(r.getUserId(), r.getSecret(), r.getQrCodeUri());
    }
}
