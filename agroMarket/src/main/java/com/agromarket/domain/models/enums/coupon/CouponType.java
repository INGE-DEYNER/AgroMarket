package com.agromarket.domain.models.enums.coupon;

/**
 * Enumeración que representa los tipos de cupones de descuento disponibles.
 * Define la forma en que se aplica el descuento.
 *
 * @author AgroMarket Team
 */
public enum CouponType {
    /**
     * Cupón que ofrece envío gratis.
     */
    FREE_SHIPPING,
    
    /**
     * Cupón que aplica un porcentaje de descuento sobre el total.
     */
    PERCENTAGE,
    
    /**
     * Cupón que resta un monto fijo del total.
     */
    FIXED_AMOUNT
}
