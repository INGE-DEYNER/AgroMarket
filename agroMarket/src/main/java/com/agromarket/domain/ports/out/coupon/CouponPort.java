
package com.agromarket.domain.ports.out.coupon;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.coupon.Coupon;

/**
 * Puerto de salida para persistencia de cupones.
 */
public interface CouponPort {

    /**
     * Guarda un cupón.
     */
    Coupon save(Coupon coupon);

    /**
     * Busca un cupón por ID.
     */
    Optional<Coupon> findById(Long id);

    /**
     * Busca un cupón por código.
     */
    Optional<Coupon> findByCode(String code);

    /**
     * Obtiene los cupones activos.
     */
    List<Coupon> findActive();

    /**
     * Obtiene TODOS los cupones, incluidos los usados o vencidos.
     * Lo consume el panel de administración (GET /cupones/todos).
     */
    List<Coupon> findAll();

    /**
     * Elimina un cupón.
     */
    void delete(Coupon coupon);

}