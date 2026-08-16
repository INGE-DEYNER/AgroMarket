package com.agromarket.domain.models.coupon;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.exceptions.coupon.InvalidCouponException;
import com.agromarket.domain.models.enums.coupon.CouponType;
import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    private Long id;
    private String code;
    private CouponType type;
    private BigDecimal value;
    private BigDecimal minimumAmount;
    private User user;

    @Builder.Default
    private boolean used = false;

    private LocalDateTime expirationDate;

    public boolean isActive() {
        return !used
                && (expirationDate == null
                        || expirationDate.isAfter(LocalDateTime.now()));
    }

    public BigDecimal calculateDiscount(BigDecimal total) {
        if (!isActive() || total.compareTo(minimumAmount) < 0) {
            return BigDecimal.ZERO;
        }

        switch (type) {
            case PERCENTAGE:
                return total.multiply(value)
                        .divide(BigDecimal.valueOf(100), 2,
                                java.math.RoundingMode.HALF_UP);
            case FIXED_AMOUNT:
                return value.min(total);
            case FREE_SHIPPING:
                return BigDecimal.ZERO;
            default:
                return BigDecimal.ZERO;
        }
    }

    public void use() {
        if (!isActive()) {
            throw new InvalidCouponException(
                    "El cupón no puede usarse: ya fue usado o expiró");
        }
        this.used = true;
    }
}
