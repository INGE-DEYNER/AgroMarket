package com.agromarket.domain.exceptions.coupon;

/**
 * Excepción lanzada cuando un cupón no puede utilizarse.
 */
public class InvalidCouponException extends RuntimeException {

    public InvalidCouponException(String message) {
        super(message);
    }
}