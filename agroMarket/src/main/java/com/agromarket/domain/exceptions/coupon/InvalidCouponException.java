package com.agromarket.domain.exceptions.coupon;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando un cupón no puede utilizarse.
 */
public class InvalidCouponException extends DomainException {

    public InvalidCouponException(String message) {
        super(message);
    }
}