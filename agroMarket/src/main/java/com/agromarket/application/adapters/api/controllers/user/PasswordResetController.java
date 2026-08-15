package com.agromarket.application.adapters.api.controllers.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.agromarket.application.adapters.api.request.user.ChangePasswordRequest;
import com.agromarket.application.adapters.api.request.user.PasswordResetRequest;
import com.agromarket.application.adapters.api.request.user.ResetPasswordRequest;
import com.agromarket.application.adapters.api.response.user.OperationResponse;
import com.agromarket.domain.ports.in.user.PasswordResetPort;

@RestController
@RequestMapping("/api/v1/auth/password-reset")
public class PasswordResetController {

    private final PasswordResetPort passwordResetPort;

    public PasswordResetController(PasswordResetPort passwordResetPort) {
        this.passwordResetPort = passwordResetPort;
    }

    @PostMapping("/request")
    public ResponseEntity<OperationResponse> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {
        passwordResetPort.requestPasswordReset(request.email());
        return ResponseEntity.ok(
                OperationResponse.success("Si la cuenta existe, se enviará un correo de recuperación"));
    }

    @PostMapping("/reset")
    public ResponseEntity<OperationResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetPort.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(
                OperationResponse.success("Contraseña restablecida correctamente"));
    }

    @PostMapping("/change/{userId}")
    public ResponseEntity<OperationResponse> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        passwordResetPort.changePassword(
                userId, request.currentPassword(), request.newPassword());
        return ResponseEntity.ok(
                OperationResponse.success("Contraseña actualizada correctamente"));
    }
}
