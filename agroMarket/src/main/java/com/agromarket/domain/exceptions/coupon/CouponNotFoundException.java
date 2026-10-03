
package com.agromarket.domain.exceptions.coupon;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando no se encuentra un cupón.
 */
public class CouponNotFoundException extends DomainException {

    public CouponNotFoundException(String message) {
        super(message);
    }
}