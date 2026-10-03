package com.agromarket.application.adapters.api.request.coupon;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.coupon.CouponType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCouponRequest {

    @NotBlank
    private String code;

    @NotNull
    private CouponType type;

    /**
     * Para FREE_SHIPPING el valor puede ser null.
     * La validación condicional se realiza en el UseCase.
     */
    @DecimalMin(value = "0.01", inclusive = true)
    private BigDecimal value;

    @DecimalMin(value = "0.00", inclusive = true)
    private BigDecimal minimumAmount;

    private Long userId;

    private LocalDateTime expirationDate;
}
