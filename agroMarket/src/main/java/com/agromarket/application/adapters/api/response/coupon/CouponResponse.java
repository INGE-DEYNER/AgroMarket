package com.agromarket.application.adapters.api.response.coupon;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.coupon.Coupon;
import com.agromarket.domain.models.enums.coupon.CouponType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {

    private Long id;
    private String code;
    private CouponType type;
    private BigDecimal value;
    private BigDecimal minimumAmount;
    private boolean used;
    private LocalDateTime expirationDate;
    private boolean active;

    public static CouponResponse fromDomain(Coupon coupon) {
        if (coupon == null) {
            return null;
        }

        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .type(coupon.getType())
                .value(coupon.getValue())
                .minimumAmount(coupon.getMinimumAmount())
                .used(coupon.isUsed())
                .expirationDate(coupon.getExpirationDate())
                .active(coupon.isActive())
                .build();
    }
}
