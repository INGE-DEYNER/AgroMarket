package com.agromarket.application.adapters.api.controllers.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.agromarket.application.adapters.api.request.user.UpdateProfileRequest;
import com.agromarket.application.adapters.api.request.user.UpdateUserRequest;
import com.agromarket.application.adapters.api.response.user.OperationResponse;
import com.agromarket.application.adapters.api.response.user.UserResponse;
import com.agromarket.domain.ports.in.user.UpdateProfileCommand;
import com.agromarket.domain.ports.in.user.UserPort;
import com.agromarket.domain.ports.in.user.UserResult;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserPort userPort;

    public UserController(UserPort userPort) {
        this.userPort = userPort;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(userPort.getById(id)));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(userPort.getProfile(id)));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(
                userPort.getAll().stream().map(this::toResponse).toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(
                toResponse(userPort.update(id, toCommand(request))));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(
                toResponse(userPort.updateProfile(id, toCommand(request))));
    }

    @PatchMapping("/{id}/enable")
    public ResponseEntity<OperationResponse> enable(@PathVariable Long id) {
        userPort.enable(id);
        return ResponseEntity.ok(OperationResponse.success("Usuario habilitado"));
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<OperationResponse> disable(@PathVariable Long id) {
        userPort.disable(id);
        return ResponseEntity.ok(OperationResponse.success("Usuario deshabilitado"));
    }

    private UpdateProfileCommand toCommand(UpdateUserRequest r) {
        return UpdateProfileCommand.builder()
                .firstName(r.firstName()).lastName(r.lastName()).phone(r.phone())
                .countryCode(r.countryCode()).location(r.location()).idNumber(r.idNumber())
                .birthDate(r.birthDate()).idType(r.idType()).companyName(r.companyName())
                .nit(r.nit()).isCompany(r.isCompany()).department(r.department())
                .city(r.city()).fullAddress(r.fullAddress()).addressReference(r.addressReference())
                .postalCode(r.postalCode()).photoUrl(r.photoUrl())
                .preferredCurrency(r.preferredCurrency()).build();
    }

    private UpdateProfileCommand toCommand(UpdateProfileRequest r) {
        return UpdateProfileCommand.builder()
                .firstName(r.firstName()).lastName(r.lastName()).phone(r.phone())
                .countryCode(r.countryCode()).location(r.location()).idNumber(r.idNumber())
                .birthDate(r.birthDate()).idType(r.idType()).companyName(r.companyName())
                .nit(r.nit()).isCompany(r.isCompany()).department(r.department())
                .city(r.city()).fullAddress(r.fullAddress()).addressReference(r.addressReference())
                .postalCode(r.postalCode()).photoUrl(r.photoUrl())
                .preferredCurrency(r.preferredCurrency()).build();
    }

    private UserResponse toResponse(UserResult result) {
        return UserResponse.from(result);
    }
}
