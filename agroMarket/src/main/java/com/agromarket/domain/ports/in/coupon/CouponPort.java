
package com.agromarket.domain.ports.in.coupon;

import java.util.List;

import com.agromarket.domain.models.coupon.Coupon;

/**
 * Puerto de entrada para la gestión de cupones.
 */
public interface CouponPort {

    /**
     * Crea un cupón.
     */
    Coupon create(Coupon coupon);

    /**
     * Obtiene un cupón por ID.
     */
    Coupon getById(Long id);

    /**
     * Busca un cupón mediante su código.
     */
    Coupon getByCode(String code);

    /**
     * Obtiene los cupones activos.
     */
    List<Coupon> getActive();

    /**
     * Desactiva un cupón.
     */
    void deactivate(Long id);

    /**
     * Valida un cupón para un comprador.
     */
    boolean isValid(String code, Long buyerId);
}