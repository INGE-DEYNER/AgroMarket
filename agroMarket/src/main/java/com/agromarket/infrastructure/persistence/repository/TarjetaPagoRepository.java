package com.agromarket.infrastructure.persistence.repository;

import com.agromarket.infrastructure.persistence.entity.TarjetaPago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TarjetaPagoRepository extends JpaRepository<TarjetaPago, Long> {
    List<TarjetaPago> findByUsuarioIdAndActivaTrue(Long usuarioId);
}
