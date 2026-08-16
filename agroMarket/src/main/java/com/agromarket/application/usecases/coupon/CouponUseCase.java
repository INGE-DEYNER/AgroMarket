package com.agromarket.application.usecases.coupon;

import java.util.List;

import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.exceptions.coupon.CouponNotFoundException;
import com.agromarket.domain.exceptions.coupon.InvalidCouponException;
import com.agromarket.domain.models.coupon.Coupon;
import com.agromarket.domain.models.enums.coupon.CouponType;
import com.agromarket.domain.ports.in.coupon.CouponPort;
import com.agromarket.domain.services.coupon.CouponService;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CouponUseCase implements CouponPort {

    private final CouponPort couponPersistencePort;
    private final CouponService couponService;

    @Override
    @Transactional
    public Coupon create(Coupon coupon) {
        validateForCreation(coupon);
        return couponPersistencePort.save(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getById(Long id) {
        return findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getByCode(String code) {
        return couponPersistencePort.findByCode(code)
                .orElseThrow(() -> new CouponNotFoundException(
                        "No existe un cupón con código: " + code));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Coupon> getActive() {
        return couponPersistencePort.findActive();
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        Coupon coupon = findById(id);

        // El modelo no tiene un estado "deactivated"; isActive() depende de used
        // y expirationDate. Por ello desactivar significa marcarlo como usado.
        coupon.setUsed(true);
        couponPersistencePort.save(coupon);
    }

    @Override
    @Transactional
    public Coupon redeem(String code, Long buyerId) {
        Coupon coupon = getByCode(code);

        if (!couponService.isValid(coupon)) {
            throw new InvalidCouponException(
                    "El cupón no es válido o ya fue utilizado");
        }

        if (!belongsToBuyerOrIsGlobal(coupon, buyerId)) {
            throw new InvalidCouponException(
                    "El cupón no pertenece al comprador indicado");
        }

        coupon.use();

        try {
            return couponPersistencePort.save(coupon);
        } catch (OptimisticLockException
                | OptimisticLockingFailureException ex) {
            throw new InvalidCouponException(
                    "El cupón ya fue utilizado");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isValid(String code, Long buyerId) {
        return couponPersistencePort.findByCode(code)
                .map(coupon -> couponService.isValid(coupon)
                        && belongsToBuyerOrIsGlobal(coupon, buyerId))
                .orElse(false);
    }

    private Coupon findById(Long id) {
        return couponPersistencePort.findById(id)
                .orElseThrow(() -> new CouponNotFoundException(
                        "No existe el cupón con id " + id));
    }

    private boolean belongsToBuyerOrIsGlobal(
            Coupon coupon,
            Long buyerId) {

        if (coupon.getUser() == null) {
            return true;
        }

        return coupon.getUser().getId() != null
                && coupon.getUser().getId().equals(buyerId);
    }

    private void validateForCreation(Coupon coupon) {
        if (coupon == null) {
            throw new InvalidCouponException(
                    "El cupón no puede ser nulo");
        }

        if (coupon.getCode() == null || coupon.getCode().isBlank()) {
            throw new InvalidCouponException(
                    "El código del cupón es obligatorio");
        }

        if (coupon.getType() == null) {
            throw new InvalidCouponException(
                    "El tipo del cupón es obligatorio");
        }

        if (coupon.getType() != CouponType.FREE_SHIPPING
                && (coupon.getValue() == null
                        || coupon.getValue().signum() <= 0)) {
            throw new InvalidCouponException(
                    "El valor debe ser mayor que cero");
        }

        if (coupon.getMinimumAmount() != null
                && coupon.getMinimumAmount().signum() < 0) {
            throw new InvalidCouponException(
                    "El monto mínimo no puede ser negativo");
        }
    }
}
