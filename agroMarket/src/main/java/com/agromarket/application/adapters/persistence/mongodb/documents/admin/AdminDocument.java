package com.agromarket.application.adapters.persistence.mongodb.documents.admin;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.models.admin.Admin;
import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admins")
public class AdminDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private Long userId;

    private String userName;

    private boolean active;

    private LocalDateTime createdAt;

    public Admin toDomain() {
        return Admin.builder()
                .id(parseId(id))
                .user(User.builder()
                        .id(userId)
                        .firstName(extractFirstName(userName))
                        .lastName(extractLastName(userName))
                        .build())
                .active(active)
                .createdAt(createdAt)
                .build();
    }

    public static AdminDocument fromDomain(Admin admin) {
        Long userId = admin.getUser() != null
                ? admin.getUser().getId()
                : null;

        String userName = admin.getUser() != null
                ? buildName(
                        admin.getUser().getFirstName(),
                        admin.getUser().getLastName())
                : null;

        return AdminDocument.builder()
                .id(admin.getId() != null
                        ? admin.getId().toString()
                        : null)
                .userId(userId)
                .userName(userName)
                .active(admin.isActive())
                .createdAt(admin.getCreatedAt())
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

    private static Long parseId(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
