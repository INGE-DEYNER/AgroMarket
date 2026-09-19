package com.agromarket.application.adapters.persistence.sql.repositories.coupon;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.coupon.CouponEntity;

public interface CouponJpaRepository
        extends JpaRepository<CouponEntity, Long> {

    Optional<CouponEntity> findByCode(String code);

    List<CouponEntity> findByUsedFalse();
}
