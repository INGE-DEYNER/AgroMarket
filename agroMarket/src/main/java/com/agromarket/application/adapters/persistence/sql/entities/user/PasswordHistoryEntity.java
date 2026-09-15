package com.agromarket.application.adapters.persistence.sql.entities.user;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.agromarket.domain.models.user.PasswordHistory;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "password_history",
       indexes = @Index(name = "idx_password_history_user", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class PasswordHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false)
    private LocalDateTime usedAt;

    public PasswordHistory toDomain() {
        return PasswordHistory.builder()
                .id(id)
                .userId(user.getId())
                .password(password)
                .usedAt(usedAt)
                .build();
    }

    public static PasswordHistoryEntity fromDomain(PasswordHistory history, UserEntity user) {
        PasswordHistoryEntity entity = new PasswordHistoryEntity();
        entity.id = history.getId();
        entity.user = user;
        entity.password = history.getPassword();
        entity.usedAt = history.getUsedAt();
        return entity;
    }
}
