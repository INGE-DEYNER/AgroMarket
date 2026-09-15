package com.agromarket.application.adapters.persistence.sql.entities.admin;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.admin.Admin;
import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad JPA de administradores.
 * Reemplaza la antigua colección Mongo "admins":
 * los administradores son datos estructurales del negocio (MySQL).
 */
@Entity
@Table(name = "admins", indexes = {
        @Index(name = "uk_admins_user", columnList = "user_id", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "user_name", length = 255)
    private String userName;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Admin toDomain() {
        User domainUser = null;
        if (user != null) {
            domainUser = User.builder()
                    .id(user.getId())
                    .firstName(extractFirstName(userName))
                    .lastName(extractLastName(userName))
                    .build();
        }
        return Admin.builder()
                .id(id)
                .user(domainUser)
                .active(active)
                .createdAt(createdAt)
                .build();
    }

    public static AdminEntity fromDomain(Admin admin, UserEntity user) {
        String userName = null;
        if (admin.getUser() != null) {
            userName = buildName(
                    admin.getUser().getFirstName(),
                    admin.getUser().getLastName());
        }
        return AdminEntity.builder()
                .id(admin.getId())
                .user(user)
                .userName(userName)
                .active(admin.isActive())
                .createdAt(admin.getCreatedAt() == null
                        ? LocalDateTime.now()
                        : admin.getCreatedAt())
                .build();
    }

    private static String buildName(String first, String last) {
        String f = first == null ? "" : first.trim();
        String l = last == null ? "" : last.trim();
        return (f + " " + l).trim();
    }

    private static String extractFirstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return null;
        }
        int separator = fullName.indexOf(' ');
        return separator < 0
                ? fullName
                : fullName.substring(0, separator);
    }

    private static String extractLastName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return null;
        }
        int separator = fullName.indexOf(' ');
        return separator < 0
                ? null
                : fullName.substring(separator + 1);
    }
}
