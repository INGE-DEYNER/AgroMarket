package com.agromarket.application.adapters.persistence.sql.adapters.coupon;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.sql.entities.coupon.CouponEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.coupon.CouponJpaRepository;
import com.agromarket.domain.models.coupon.Coupon;
import com.agromarket.domain.ports.out.coupon.CouponPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CouponSqlAdapter implements CouponPort {

    private final CouponJpaRepository repository;

    @Override
    public Coupon save(Coupon coupon) {
        if (coupon.getId() == null) {
            return repository.save(
                    CouponEntity.fromDomain(coupon, userReference(coupon)))
                    .toDomain();
        }

        CouponEntity entity = repository.findById(coupon.getId())
                .orElseGet(() -> CouponEntity.fromDomain(
                        coupon, userReference(coupon)));

        entity.setCode(coupon.getCode());
        entity.setType(coupon.getType());
        entity.setValue(coupon.getValue());
        entity.setMinimumAmount(coupon.getMinimumAmount());
        entity.setUser(userReference(coupon));
        entity.setUsed(coupon.isUsed());
        entity.setExpirationDate(coupon.getExpirationDate());

        return repository.save(entity).toDomain();
    }

    @Override
    public Optional<Coupon> findById(Long id) {
        return repository.findById(id)
                .map(CouponEntity::toDomain);
    }

    @Override
    public Optional<Coupon> findByCode(String code) {
        return repository.findByCode(code)
                .map(CouponEntity::toDomain);
    }

    @Override
    public List<Coupon> findActive() {
        LocalDateTime now = LocalDateTime.now();

        return repository.findByUsedFalse()
                .stream()
                .filter(entity -> entity.getExpirationDate() == null
                        || entity.getExpirationDate().isAfter(now))
                .map(CouponEntity::toDomain)
                .toList();
    }

    @Override
    public void delete(Coupon coupon) {
        if (coupon != null && coupon.getId() != null) {
            repository.deleteById(coupon.getId());
        }
    }

    private UserEntity userReference(Coupon coupon) {
        if (coupon.getUser() == null
                || coupon.getUser().getId() == null) {
            return null;
        }

        UserEntity user = new UserEntity();
        user.setId(coupon.getUser().getId());
        return user;
    }
}
