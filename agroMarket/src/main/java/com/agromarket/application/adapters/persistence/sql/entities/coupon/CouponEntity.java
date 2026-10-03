package com.agromarket.application.adapters.persistence.sql.entities.coupon;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.coupon.Coupon;
import com.agromarket.domain.models.enums.coupon.CouponType;
import com.agromarket.domain.models.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupons", indexes = {
        @Index(name = "uk_coupons_code", columnList = "code", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CouponType type;

    @Column(precision = 19, scale = 2)
    private BigDecimal value;

    @Column(precision = 19, scale = 2)
    private BigDecimal minimumAmount;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(nullable = false)
    private boolean used;

    private LocalDateTime expirationDate;

    @Version
    private Long version;

    public Coupon toDomain() {
        return Coupon.builder()
                .id(id)
                .code(code)
                .type(type)
                .value(value)
                .minimumAmount(minimumAmount)
                .user(userReference(user))
                .used(used)
                .expirationDate(expirationDate)
                .build();
    }

    public static CouponEntity fromDomain(Coupon coupon, UserEntity user) {
        return CouponEntity.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .type(coupon.getType())
                .value(coupon.getValue())
                .minimumAmount(coupon.getMinimumAmount())
                .user(user)
                .used(coupon.isUsed())
                .expirationDate(coupon.getExpirationDate())
                .build();
    }

    private static User userReference(UserEntity entity) {
        if (entity == null) {
            return null;
        }

        return User.builder()
                .id(entity.getId())
                .build();
    }
}
