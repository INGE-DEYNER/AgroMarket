package com.agromarket.application.adapters.persistence.sql.repositories.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.agromarket.application.adapters.persistence.sql.entities.user.AddressEntity;

public interface AddressJpaRepository extends JpaRepository<AddressEntity, Long> {
    List<AddressEntity> findByUser_IdAndActiveTrue(Long userId);
    Optional<AddressEntity> findByIdAndUser_Id(Long id, Long userId);
    Optional<AddressEntity> findFirstByUser_IdAndActiveTrueOrderByIdAsc(Long userId);
}
