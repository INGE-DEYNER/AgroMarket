package com.agromarket.application.adapters.api.controllers.coupon;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.coupon.CreateCouponRequest;
import com.agromarket.application.adapters.api.request.coupon.RedeemCouponRequest;
import com.agromarket.application.adapters.api.response.coupon.CouponResponse;
import com.agromarket.domain.models.coupon.Coupon;
import com.agromarket.domain.ports.in.coupon.CouponPort;
import com.agromarket.domain.models.enums.coupon.CouponType;
import com.agromarket.domain.models.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponPort couponPort;

    @PostMapping
    public ResponseEntity<CouponResponse> create(
            @Valid @RequestBody CreateCouponRequest request) {

        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .type(request.getType())
                .value(request.getValue())
                .minimumAmount(request.getMinimumAmount())
                .user(userReference(request.getUserId()))
                .expirationDate(request.getExpirationDate())
                .used(false)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(couponPort.create(coupon)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(toResponse(couponPort.getById(id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<CouponResponse> getByCode(
            @PathVariable String code) {
        return ResponseEntity.ok(toResponse(couponPort.getByCode(code)));
    }

    @GetMapping("/active")
    public ResponseEntity<List<CouponResponse>> getActive() {
        return ResponseEntity.ok(
                couponPort.getActive()
                        .stream()
                        .map(this::toResponse)
                        .toList());
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(
            @PathVariable Long id) {
        couponPort.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/redeem")
    public ResponseEntity<CouponResponse> redeem(
            @Valid @RequestBody RedeemCouponRequest request) {
        return ResponseEntity.ok(
                toResponse(couponPort.redeem(
                        request.getCode(),
                        request.getBuyerId())));
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validate(
            @RequestParam String code,
            @RequestParam Long buyerId) {
        return ResponseEntity.ok(couponPort.isValid(code, buyerId));
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.fromDomain(coupon);
    }

    private User userReference(Long userId) {
        if (userId == null) {
            return null;
        }

        return User.builder()
                .id(userId)
                .build();
    }
}
