package com.agromarket.application.usecases.user;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.models.user.User;
import com.agromarket.domain.exceptions.user.UserNotFoundException;
import com.agromarket.domain.ports.in.user.UpdateProfileCommand;
import com.agromarket.domain.ports.in.user.UserPort;
import com.agromarket.domain.ports.in.user.UserResult;
import com.agromarket.domain.ports.out.user.PasswordHashPort;
import com.agromarket.domain.services.user.PasswordPolicyService;
import com.agromarket.domain.services.user.UserService;

@Service
@Transactional
public class UserUseCase implements UserPort {

    private final com.agromarket.domain.ports.out.user.UserPort userPersistencePort;
    private final PasswordHashPort passwordHashPort;
    private final PasswordPolicyService passwordPolicyService;
    private final UserService userService;

    public UserUseCase(
            com.agromarket.domain.ports.out.user.UserPort userPersistencePort,
            PasswordHashPort passwordHashPort,
            PasswordPolicyService passwordPolicyService,
            UserService userService) {
        this.userPersistencePort = userPersistencePort;
        this.passwordHashPort = passwordHashPort;
        this.passwordPolicyService = passwordPolicyService;
        this.userService = userService;
    }

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
        user.setUpdatedAt(LocalDateTime.now());
        return toResult(userPersistencePort.save(user));
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

    private User findUser(Long id) {
        return userPersistencePort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private void apply(UpdateProfileCommand c, User u) {
        if (c.getFirstName() != null) u.setFirstName(c.getFirstName());
        if (c.getLastName() != null) u.setLastName(c.getLastName());
        if (c.getPhone() != null) u.setPhone(c.getPhone());
        if (c.getCountryCode() != null) u.setCountryCode(c.getCountryCode());
        if (c.getLocation() != null) u.setLocation(c.getLocation());
        if (c.getIdNumber() != null) u.setIdNumber(c.getIdNumber());
        if (c.getBirthDate() != null) u.setBirthDate(c.getBirthDate());
        if (c.getIdType() != null) u.setIdType(c.getIdType());
        if (c.getCompanyName() != null) u.setCompanyName(c.getCompanyName());
        if (c.getNit() != null) u.setNit(c.getNit());
        if (c.getIsCompany() != null) u.setIsCompany(c.getIsCompany());
        if (c.getDepartment() != null) u.setDepartment(c.getDepartment());
        if (c.getCity() != null) u.setCity(c.getCity());
        if (c.getFullAddress() != null) u.setFullAddress(c.getFullAddress());
        if (c.getAddressReference() != null) u.setAddressReference(c.getAddressReference());
        if (c.getPostalCode() != null) u.setPostalCode(c.getPostalCode());
        if (c.getPhotoUrl() != null) u.setPhotoUrl(c.getPhotoUrl());
        if (c.getPreferredCurrency() != null) u.setPreferredCurrency(c.getPreferredCurrency());
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
                .accountComplete(u.getAccountComplete())
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
