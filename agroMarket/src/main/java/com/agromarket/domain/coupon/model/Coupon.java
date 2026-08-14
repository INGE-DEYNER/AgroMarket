package com.agromarket.domain.coupon.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.coupon.enums.CouponType;
import com.agromarket.domain.user.model.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un cupón de descuento en el sistema.
 * Los cupones pueden ser de tipo porcentual, monto fijo o envío gratis.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {
    
    private Long id;
    
    /**
     * Código único del cupón que el usuario debe ingresar.
     */
    private String code;
    
    /**
     * Tipo de descuento del cupón.
     */
    private CouponType type;
    
    /**
     * Valor del descuento:
     * - Para PERCENTAGE: el porcentaje (ej: 10.0 para 10%)
     * - Para FIXED_AMOUNT: el monto fijo a descontar
     * - Para FREE_SHIPPING: no se usa
     */
    private BigDecimal value;
    
    /**
     * Monto mínimo de compra requerido para aplicar el cupón.
     */
    private BigDecimal minimumAmount;
    
    /**
     * Usuario al cual está asignado el cupón (puede ser nulo para cupones globales).
     */
    private User user;
    
    /**
     * Indica si el cupón ya ha sido utilizado.
     */
    @Builder.Default
    private boolean used = false;
    
    /**
     * Fecha y hora en que expira el cupón.
     */
    private LocalDateTime expirationDate;
    
    
    // ==================== MÉTODOS DE NEGOCIO ====================
    
    /**
     * Verifica si el cupón está activo (no ha sido usado y no ha expirado).
     * 
     * @return true si el cupón puede ser usado, false de lo contrario
     */
    public boolean isActive() {
        return !used && (expirationDate == null || expirationDate.isAfter(LocalDateTime.now()));
    }
    
    /**
     * Calcula el monto del descuento para un total dado.
     * 
     * @param total monto total de la compra
     * @return monto del descuento a aplicar
     */
    public BigDecimal calculateDiscount(BigDecimal total) {
        if (!isActive() || total.compareTo(minimumAmount) < 0) {
            return BigDecimal.ZERO;
        }
        
        switch (type) {
            case PERCENTAGE:
                return total.multiply(value).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            case FIXED_AMOUNT:
                return value.min(total);
            case FREE_SHIPPING:
                // Para envío gratis, el descuento se aplica al costo de envío
                // Este método no maneja ese caso directamente
                return BigDecimal.ZERO;
            default:
                return BigDecimal.ZERO;
        }
    }
}
