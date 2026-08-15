package com.agromarket.application.adapters.persistence.mongodb.documents.user;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.models.user.PasswordHistory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "password_history")
public class PasswordHistoryDocument {

    @Id
    private String id;

    @Indexed
    private Long domainId;

    @Indexed
    private Long userId;

    private String password;
    private LocalDateTime usedAt;

    public PasswordHistory toDomain() {
        return PasswordHistory.builder()
                .id(domainId)
                .userId(userId)
                .password(password)
                .usedAt(usedAt)
                .build();
    }

    public static PasswordHistoryDocument fromDomain(PasswordHistory history) {
        return PasswordHistoryDocument.builder()
                .id(history.getId() == null ? null : String.valueOf(history.getId()))
                .domainId(history.getId())
                .userId(history.getUserId())
                .password(history.getPassword())
                .usedAt(history.getUsedAt())
                .build();
    }
}
