
package com.agromarket.domain.services.coupon;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import com.agromarket.domain.exceptions.coupon.InvalidCouponException;
import com.agromarket.domain.models.coupon.Coupon;
import com.agromarket.domain.models.enums.coupon.CouponType;

/**
 * Servicio de dominio para las reglas de cupones.
 */
public class CouponService {

    /**
     * Verifica si el cupón está vigente.
     */
    public boolean isValid(Coupon coupon) {

        if (coupon == null) {
            return false;
        }

        if (coupon.isUsed()) {
            return false;
        }

        if (coupon.getCode() == null
                || coupon.getCode().isBlank()) {
            return false;
        }

        return coupon.getExpirationDate() == null
                || coupon.getExpirationDate()
                        .isAfter(LocalDateTime.now());
    }

    /**
     * Calcula el descuento aplicable.
     */
    public BigDecimal calculateDiscount(
            Coupon coupon,
            BigDecimal purchaseTotal) {

        if (!isValid(coupon)) {
            throw new InvalidCouponException(
                    "El cupón no es válido"
            );
        }

        if (purchaseTotal == null
                || purchaseTotal.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "El total de la compra no puede ser negativo"
            );
        }

        if (coupon.getMinimumAmount() != null
                && purchaseTotal.compareTo(
                        coupon.getMinimumAmount()) < 0) {

            return BigDecimal.ZERO;
        }

        BigDecimal value =
                coupon.getValue() == null
                        ? BigDecimal.ZERO
                        : coupon.getValue();

        if (coupon.getType() == CouponType.PERCENTAGE) {

            return purchaseTotal
                    .multiply(value)
                    .divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    );
        }

        if (coupon.getType() == CouponType.FIXED_AMOUNT) {
            return value.min(purchaseTotal);
        }

        return BigDecimal.ZERO;
    }
}