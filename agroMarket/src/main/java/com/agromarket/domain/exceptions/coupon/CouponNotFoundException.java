
package com.agromarket.domain.exceptions.coupon;

/**
 * Excepción lanzada cuando no se encuentra un cupón.
 */
public class CouponNotFoundException extends RuntimeException {

    public CouponNotFoundException(String message) {
        super(message);
    }
}