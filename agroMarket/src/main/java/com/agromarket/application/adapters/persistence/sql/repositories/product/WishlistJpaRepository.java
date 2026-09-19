package com.agromarket.application.adapters.persistence.sql.repositories.product;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.agromarket.application.adapters.persistence.sql.entities.product.WishlistEntity;

public interface WishlistJpaRepository extends JpaRepository<WishlistEntity, Long> {
    List<WishlistEntity> findByUser_Id(Long userId);
    Optional<WishlistEntity> findByUser_IdAndProduct_Id(Long userId, Long productId);
}
