package com.agromarket.application.adapters.api.response.admin;

import java.time.LocalDateTime;

import com.agromarket.domain.models.admin.Admin;

public record AdminResponse(
                Long id,
                Long userId,
                String userName,
                boolean active,
                LocalDateTime createdAt) {

        public static AdminResponse fromDomain(Admin admin) {
                if (admin == null) {
                        return null;
                }

                Long userId = admin.getUser() != null
                                ? admin.getUser().getId()
                                : null;

                String userName = admin.getUser() != null
                                ? buildName(
                                                admin.getUser().getFirstName(),
                                                admin.getUser().getLastName())
                                : null;

                return new AdminResponse(
                                admin.getId(),
                                userId,
                                userName,
                                admin.isActive(),
                                admin.getCreatedAt());
        }

        private static String buildName(String firstName, String lastName) {
                String first = firstName == null ? "" : firstName.trim();
                String last = lastName == null ? "" : lastName.trim();
                return (first + " " + last).trim();
        }
}
