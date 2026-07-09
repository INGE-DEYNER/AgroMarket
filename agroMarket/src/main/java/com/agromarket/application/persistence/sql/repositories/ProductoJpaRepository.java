package com.agromarket.application.persistence.sql.repositories;

import java.math.BigDecimal;
import java.util.List;

import com.agromarket.application.persistence.sql.entities.ProductoEntity;
import com.agromarket.domain.models.enums.TipoFruta;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ProductoJpaRepository extends JpaRepository<ProductoEntity, Long>, JpaSpecificationExecutor<ProductoEntity> {

    @Override
    @EntityGraph(attributePaths = {"productor"})
    Page<ProductoEntity> findAll(Specification<ProductoEntity> spec, Pageable pageable);

    List<ProductoEntity> findByNombreContainingIgnoreCase(String keyword);

    List<ProductoEntity> findByTipoFruta(TipoFruta tipo);

    List<ProductoEntity> findByPrecioBetween(BigDecimal min, BigDecimal max);

    List<ProductoEntity> findByCantidadDisponibleGreaterThan(Integer cantidad);

    List<ProductoEntity> findByProductorId(Long productorId);

    Page<ProductoEntity> findByProductorId(Long productorId, Pageable pageable);

    @Query("SELECT p FROM ProductoEntity p WHERE p.activo=true ORDER BY p.totalVendido ASC")
    List<ProductoEntity> findMenosVendidos(Pageable pageable);

    @Query("SELECT COUNT(p) FROM ProductoEntity p WHERE p.activo=true")
    long countActivos();

    boolean existsByNombreIgnoreCaseAndProductorId(String nombre, Long productorId);

    java.util.Optional<ProductoEntity> findByProductorIdAndTipoFruta(Long productorId, TipoFruta tipoFruta);

    List<ProductoEntity> findByEnPromocionTrueAndFechaFinPromocionBefore(java.time.LocalDateTime fecha);

    @Query("SELECT AVG(p.precio) FROM ProductoEntity p")
    Double getAveragePrice();
}
