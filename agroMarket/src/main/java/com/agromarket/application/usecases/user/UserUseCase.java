package com.agromarket.application.usecases.user;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.user.UpdateProfileCommand;
import com.agromarket.domain.ports.in.user.UserPort;
import com.agromarket.domain.ports.in.user.UserResult;
import com.agromarket.domain.ports.out.user.PasswordHashPort;
import com.agromarket.domain.services.user.PasswordPolicyService;

@RequiredArgsConstructor
@Service
@Transactional
public class UserUseCase implements UserPort {

    private final com.agromarket.domain.ports.out.user.UserPort userPersistencePort;
    private final PasswordHashPort passwordHashPort;
    private final PasswordPolicyService passwordPolicyService;

    @Override
    @Transactional(readOnly = true)
    public UserResult getById(Long id) {
        return toResult(findUser(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResult getProfile(Long id) {
        return toResult(findUser(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResult> getAll() {
        return userPersistencePort.findAll().stream().map(this::toResult).toList();
    }

    @Override
    public UserResult update(Long id, UpdateProfileCommand command) {
        User user = findUser(id);
        apply(command, user);
        markAccountCompleteIfKycDone(user);
        user.setUpdatedAt(LocalDateTime.now());
        return toResult(userPersistencePort.save(user));
    }

    /**
     * CAUSA RAÍZ del bug "Completar cuenta vuelve a aparecer al
     * refrescar la página (F5)":
     *
     * El frontend completa el KYC (tipo de documento, número de documento
     * y fecha de nacimiento) mediante PUT /usuarios/mi-perfil, pero el
     * campo accountComplete NUNCA se marcaba en la base de datos: solo
     * existía en el estado de React (marcado optimista en el cliente).
     * Al recargar, GET /usuarios/me devolvía accountComplete=false y el
     * modal volvía a aparecer.
     *
     * Regla: si el usuario ya registró los datos obligatorios de
     * identidad, la cuenta se considera completa y se PERSISTE así.
     */
    private void markAccountCompleteIfKycDone(User user) {
        boolean tieneTipoDocumento = user.getIdType() != null
                && !user.getIdType().isBlank();
        boolean tieneNumeroDocumento = user.getIdNumber() != null
                && !user.getIdNumber().isBlank();
        boolean tieneFechaNacimiento = user.getBirthDate() != null;

        if (tieneTipoDocumento && tieneNumeroDocumento && tieneFechaNacimiento) {
            user.setAccountComplete(true);

            String estado = user.getAccountStatus();
            if (estado == null || estado.isBlank()
                    || "PENDING_EMAIL".equals(estado)) {
                user.setAccountStatus("ACTIVE");
            }
        }
    }

    @Override
    public UserResult updateProfile(Long id, UpdateProfileCommand command) {
        return update(id, command);
    }

    @Override
    public void changePassword(Long id, String newPassword) {
        passwordPolicyService.validate(newPassword);
        String hashed = passwordHashPort.hash(newPassword);
        userPersistencePort.changePassword(id, hashed);
    }

    @Override
    public void changeOwnPassword(Long id, String currentPassword, String newPassword) {
        User user = findUser(id);

        // NOTA: se asume que PasswordHashPort expone "matches(raw, hashed)"
        // y que User expone "getPassword()" con el hash almacenado.
        // Ajusta los nombres si en tu proyecto son distintos (verify, check,
        // getPasswordHash, etc.)
        if (!passwordHashPort.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }

        passwordPolicyService.validate(newPassword);

        String hashed = passwordHashPort.hash(newPassword);

        userPersistencePort.changePassword(id, hashed);
    }

    @Override
    public void enable(Long id) {
        User user = findUser(id);
        user.setActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        userPersistencePort.save(user);
    }

    @Override
    public void disable(Long id) {
        User user = findUser(id);
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userPersistencePort.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResult> getPendientesAprobacion() {
        return userPersistencePort.findAll().stream()
                .filter(u -> u.getRole() == Role.PRODUCER)
                .filter(u -> !Boolean.TRUE.equals(u.getAccountApproved()))
                .map(this::toResult)
                .toList();
    }

    @Override
    public UserResult aprobarUsuario(Long id) {
        User user = findUser(id);
        user.setAccountApproved(true);
        user.setAccountStatus("ACTIVE");
        user.setActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        return toResult(userPersistencePort.save(user));
    }

    @Override
    public UserResult rechazarUsuario(Long id) {
        User user = findUser(id);
        user.setAccountApproved(false);
        user.setAccountStatus("REJECTED");
        user.setUpdatedAt(LocalDateTime.now());
        return toResult(userPersistencePort.save(user));
    }

    @Override
    public UserResult toggleVerificadoProductor(Long id) {
        User user = findUser(id);
        user.setVerifiedProducer(!Boolean.TRUE.equals(user.getVerifiedProducer()));
        user.setUpdatedAt(LocalDateTime.now());
        return toResult(userPersistencePort.save(user));
    }

    private User findUser(Long id) {
        return userPersistencePort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private void apply(UpdateProfileCommand c, User u) {
        if (c.getFirstName() != null)
            u.setFirstName(c.getFirstName());
        if (c.getLastName() != null)
            u.setLastName(c.getLastName());
        if (c.getPhone() != null)
            u.setPhone(c.getPhone());
        if (c.getCountryCode() != null)
            u.setCountryCode(c.getCountryCode());
        if (c.getLocation() != null)
            u.setLocation(c.getLocation());
        if (c.getIdNumber() != null)
            u.setIdNumber(c.getIdNumber());
        if (c.getBirthDate() != null)
            u.setBirthDate(c.getBirthDate());
        if (c.getIdType() != null)
            u.setIdType(c.getIdType());
        if (c.getCompanyName() != null)
            u.setCompanyName(c.getCompanyName());
        if (c.getNit() != null)
            u.setNit(c.getNit());
        if (c.getIsCompany() != null)
            u.setIsCompany(c.getIsCompany());
        if (c.getDepartment() != null)
            u.setDepartment(c.getDepartment());
        if (c.getCity() != null)
            u.setCity(c.getCity());
        if (c.getFullAddress() != null)
            u.setFullAddress(c.getFullAddress());
        if (c.getAddressReference() != null)
            u.setAddressReference(c.getAddressReference());
        if (c.getPostalCode() != null)
            u.setPostalCode(c.getPostalCode());
        if (c.getPhotoUrl() != null)
            u.setPhotoUrl(c.getPhotoUrl());
        if (c.getPreferredCurrency() != null)
            u.setPreferredCurrency(c.getPreferredCurrency());
    }

    /**
     * Una cuenta se considera completada cuando el usuario ya registró los
     * tres datos obligatorios de identidad. Esta derivación hace que GET
     * /usuarios/me devuelva accountComplete=true aunque el campo persistido
     * quedara en false por datos creados ANTES del fix de KYC (al refrescar,
     * el modal "Completar cuenta" no debe volver a aparecer).
     */
    private boolean tieneDatosKyc(User u) {
        boolean tieneTipoDocumento = u.getIdType() != null
                && !u.getIdType().isBlank();
        boolean tieneNumeroDocumento = u.getIdNumber() != null
                && !u.getIdNumber().isBlank();
        return tieneTipoDocumento && tieneNumeroDocumento
                && u.getBirthDate() != null;
    }

    private UserResult toResult(User u) {
        return UserResult.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole())
                .active(u.isActive())
                .approved(u.isApproved())
                .totpEnabled(u.isTotpEnabled())
                .registrationDate(u.getRegistrationDate())
                .provider(u.getProvider())
                .emailVerified(u.isEmailVerified())
                .countryCode(u.getCountryCode())
                .location(u.getLocation())
                .idNumber(u.getIdNumber())
                .birthDate(u.getBirthDate())
                .idType(u.getIdType())
                .companyName(u.getCompanyName())
                .nit(u.getNit())
                .isCompany(u.getIsCompany())
                .phoneVerified(u.getPhoneVerified())
                .accountApproved(u.getAccountApproved())
                .accountComplete(u.getAccountComplete() || tieneDatosKyc(u))
                .accountStatus(u.getAccountStatus())
                .department(u.getDepartment())
                .city(u.getCity())
                .fullAddress(u.getFullAddress())
                .addressReference(u.getAddressReference())
                .postalCode(u.getPostalCode())
                .photoUrl(u.getPhotoUrl())
                .averageRating(u.getAverageRating())
                .totalReviews(u.getTotalReviews())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .lastLogin(u.getLastLogin())
                .verifiedProducer(u.getVerifiedProducer())
                .preferredCurrency(u.getPreferredCurrency())
                .build();
    }
}