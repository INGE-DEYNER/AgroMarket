package com.agromarket.application.adapters.persistence.sql.entities.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.user.User;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private boolean active;
    private boolean totpEnabled;

    @Column(length = 512)
    private String totpSecret;

    private String provider;
    private String providerId;
    private boolean emailVerified;

    private String countryCode;
    private String idNumber;
    private LocalDate birthDate;
    private String idType;
    private String companyName;
    private String nit;

    // `accountApproved` es el único indicador de aprobación: antes coexistían
    // `approved`, `account_approved` y `verified_producer` con el mismo
    // significado. `account_complete` e `is_company` se derivan de los campos
    // KYC y de la razón social (ver User#isAccountComplete / isCompanyUser).
    private Boolean accountApproved;

    @Column(length = 512)
    private String emailVerificationToken;
    private LocalDateTime emailTokenExpiry;

    @Column(length = 512)
    private String passwordResetToken;
    private LocalDateTime passwordResetTokenExpiry;

    private String preferredCurrency;

    private String department;
    private String city;

    @Column(length = 1000)
    private String fullAddress;

    private String addressReference;
    private String postalCode;
    private String photoUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<PasswordHistoryEntity> passwordHistory = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<AuthAccessEventEntity> authEvents = new ArrayList<>();

    public User toDomain() {
        return User.builder()
                .id(id)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(password)
                .phone(phone)
                .role(role)
                .active(active)
                .totpEnabled(totpEnabled)
                .totpSecret(totpSecret)
                .provider(provider)
                .providerId(providerId)
                .emailVerified(emailVerified)
                .countryCode(countryCode)
                .idNumber(idNumber)
                .birthDate(birthDate)
                .idType(idType)
                .companyName(companyName)
                .nit(nit)
                .accountApproved(accountApproved)
                .emailVerificationToken(emailVerificationToken)
                .emailTokenExpiry(emailTokenExpiry)
                .passwordResetToken(passwordResetToken)
                .passwordResetTokenExpiry(passwordResetTokenExpiry)
                .preferredCurrency(preferredCurrency)
                .department(department)
                .city(city)
                .fullAddress(fullAddress)
                .addressReference(addressReference)
                .postalCode(postalCode)
                .photoUrl(photoUrl)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .lastLogin(lastLogin)
                .build();
    }

    public static UserEntity fromDomain(User user) {
        UserEntity entity = new UserEntity();
        entity.id = user.getId();
        entity.firstName = user.getFirstName();
        entity.lastName = user.getLastName();
        entity.email = user.getEmail();
        entity.password = user.getPassword();
        entity.phone = user.getPhone();
        entity.role = user.getRole();
        entity.active = user.isActive();
        entity.totpEnabled = user.isTotpEnabled();
        entity.totpSecret = user.getTotpSecret();
        entity.provider = user.getProvider();
        entity.providerId = user.getProviderId();
        entity.emailVerified = user.isEmailVerified();
        entity.countryCode = user.getCountryCode();
        entity.idNumber = user.getIdNumber();
        entity.birthDate = user.getBirthDate();
        entity.idType = user.getIdType();
        entity.companyName = user.getCompanyName();
        entity.nit = user.getNit();
        entity.accountApproved = user.getAccountApproved();
        entity.emailVerificationToken = user.getEmailVerificationToken();
        entity.emailTokenExpiry = user.getEmailTokenExpiry();
        entity.passwordResetToken = user.getPasswordResetToken();
        entity.passwordResetTokenExpiry = user.getPasswordResetTokenExpiry();
        entity.preferredCurrency = user.getPreferredCurrency();
        entity.department = user.getDepartment();
        entity.city = user.getCity();
        entity.fullAddress = user.getFullAddress();
        entity.addressReference = user.getAddressReference();
        entity.postalCode = user.getPostalCode();
        entity.photoUrl = user.getPhotoUrl();
        entity.createdAt = user.getCreatedAt();
        entity.updatedAt = user.getUpdatedAt();
        entity.lastLogin = user.getLastLogin();
        return entity;
    }
}
