package com.agromarket.application.adapters.api.controllers.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.admin.PromoteToAdminRequest;
import com.agromarket.application.adapters.api.response.admin.AdminResponse;
import com.agromarket.domain.models.admin.Admin;
import com.agromarket.domain.models.enums.admin.AdminAction;
import com.agromarket.domain.ports.in.admin.AdminPort;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
public class AdminController {

        private final AdminPort adminPort;

        @PostMapping("/promote")
        public ResponseEntity<AdminResponse> promoteToAdmin(
                        @Valid @RequestBody PromoteToAdminRequest request) {

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(toResponse(
                                                adminPort.promoteToAdmin(request.userId())));
        }

        @GetMapping("/user/{userId}")
        public ResponseEntity<AdminResponse> getByUserId(
                        @PathVariable Long userId) {

                return ResponseEntity.ok(
                                toResponse(adminPort.getAdminByUserId(userId)));
        }

        @GetMapping("/active")
        public ResponseEntity<List<AdminResponse>> getActiveAdmins() {

                return ResponseEntity.ok(
                                adminPort.getActiveAdmins()
                                                .stream()
                                                .map(this::toResponse)
                                                .toList());
        }

        @PatchMapping("/{adminId}/deactivate")
        public ResponseEntity<AdminResponse> deactivate(
                        @PathVariable Long adminId) {

                return ResponseEntity.ok(
                                toResponse(adminPort.deactivateAdmin(adminId)));
        }

        @GetMapping("/can-perform")
        public ResponseEntity<Boolean> canPerform(
                        @RequestParam Long userId,
                        @RequestParam AdminAction action) {

                return ResponseEntity.ok(
                                adminPort.canPerform(userId, action));
        }

        private AdminResponse toResponse(Admin admin) {
                return AdminResponse.fromDomain(admin);
        }
}
