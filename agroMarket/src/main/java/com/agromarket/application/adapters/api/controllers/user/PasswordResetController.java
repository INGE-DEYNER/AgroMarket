package com.agromarket.application.adapters.api.controllers.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.agromarket.application.adapters.api.request.user.PasswordRecoveryRequest;
import com.agromarket.application.adapters.api.request.user.ResetPasswordRequest;
import com.agromarket.application.adapters.api.request.user.VerifyPasswordRecoveryRequest;
import com.agromarket.application.adapters.api.response.user.OperationResponse;
import com.agromarket.domain.ports.in.user.AuthenticationPort;

@RestController
@RequestMapping({
                "/api/v1/auth",
                "/api/auth"
})
public class PasswordResetController {

        private final AuthenticationPort authenticationPort;

        public PasswordResetController(
                        AuthenticationPort authenticationPort) {

                this.authenticationPort = authenticationPort;
        }

        /**
         * Solicita el código de recuperación.
         */
        @PostMapping("/recuperar-contrasena")
        public ResponseEntity<OperationResponse> solicitarRecuperacion(
                        @Valid @RequestBody PasswordRecoveryRequest request) {

                authenticationPort.solicitarRecuperacionContrasena(
                                request.getEmail());

                return ResponseEntity.ok(
                                OperationResponse.success(
                                                "Código de recuperación enviado correctamente"));
        }

        /**
         * Verifica el código de recuperación.
         */
        @PostMapping("/verify-code")
        public ResponseEntity<OperationResponse> verificarCodigo(
                        @Valid @RequestBody VerifyPasswordRecoveryRequest request) {

                authenticationPort.verificarRecuperacionContrasena(
                                request.getEmail(),
                                request.getToken());

                return ResponseEntity.ok(
                                OperationResponse.success(
                                                "Código de recuperación válido"));
        }

        /**
         * Endpoint alternativo en español.
         */
        @PostMapping("/verificar-recuperacion")
        public ResponseEntity<OperationResponse> verificarRecuperacion(
                        @Valid @RequestBody VerifyPasswordRecoveryRequest request) {

                authenticationPort.verificarRecuperacionContrasena(
                                request.getEmail(),
                                request.getToken());

                return ResponseEntity.ok(
                                OperationResponse.success(
                                                "Código de recuperación válido"));
        }

        /**
         * Restablece la contraseña.
         */
        @PostMapping("/restablecer-contrasena")
        public ResponseEntity<OperationResponse> restablecerContrasena(
                        @Valid @RequestBody ResetPasswordRequest request) {

                authenticationPort.restablecerContrasena(
                                request.getEmail(),
                                request.getToken(),
                                request.getNewPassword());

                return ResponseEntity.ok(
                                OperationResponse.success(
                                                "Contraseña restablecida correctamente"));
        }
}