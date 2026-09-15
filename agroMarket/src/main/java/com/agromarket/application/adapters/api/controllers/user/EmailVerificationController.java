package com.agromarket.application.adapters.api.controllers.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.agromarket.application.adapters.api.request.user.ResendVerificationEmailRequest;
import com.agromarket.application.adapters.api.request.user.SendVerificationEmailRequest;
import com.agromarket.application.adapters.api.request.user.VerifyEmailRequest;
import com.agromarket.application.adapters.api.response.user.OperationResponse;
import com.agromarket.domain.ports.in.user.EmailVerificationPort;

@RestController
@RequestMapping("/api/v1/auth/email-verification")
public class EmailVerificationController {

    private final EmailVerificationPort emailVerificationPort;

    public EmailVerificationController(EmailVerificationPort emailVerificationPort) {
        this.emailVerificationPort = emailVerificationPort;
    }

    @PostMapping("/send")
    public ResponseEntity<OperationResponse> send(
            @Valid @RequestBody SendVerificationEmailRequest request) {
        emailVerificationPort.sendVerificationEmail(request.email());
        return ResponseEntity.ok(
                OperationResponse.success("Correo de verificación enviado"));
    }

    @PostMapping("/verify")
    public ResponseEntity<OperationResponse> verify(
            @Valid @RequestBody VerifyEmailRequest request) {
        emailVerificationPort.verifyEmail(request.token());
        return ResponseEntity.ok(
                OperationResponse.success("Correo verificado correctamente"));
    }

    @PostMapping("/resend")
    public ResponseEntity<OperationResponse> resend(
            @Valid @RequestBody ResendVerificationEmailRequest request) {
        emailVerificationPort.resendVerificationEmail(request.email());
        return ResponseEntity.ok(
                OperationResponse.success("Correo de verificación reenviado"));
    }
}
