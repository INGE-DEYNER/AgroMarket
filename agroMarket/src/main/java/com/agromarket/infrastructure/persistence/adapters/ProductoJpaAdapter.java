package com.agromarket.infrastructure.persistence.adapters;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Producto;
import com.agromarket.domain.models.enums.TipoFruta;
import com.agromarket.domain.ports.out.ProductRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.ProductoMapper;
import com.agromarket.infrastructure.persistence.sql.entities.ProductoEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.ProductoJpaRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductoJpaAdapter implements ProductRepositoryPort {

    private final ProductoJpaRepository productoJpaRepository;
    private final ProductoMapper productoMapper;

    @Override
    public List<Producto> findAll(int page, int size, String search, TipoFruta type, BigDecimal minPrice, BigDecimal maxPrice, String sort, String category, Boolean inPromotion) {
        Pageable pageable = buildPageable(page, size, sort);
        Specification<ProductoEntity> spec = buildSpecification(search, type, minPrice, maxPrice, category, inPromotion);
        Page<ProductoEntity> entities = productoJpaRepository.findAll(spec, pageable);
        return entities.stream().map(productoMapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public long countAll(String search, TipoFruta type, BigDecimal minPrice, BigDecimal maxPrice, String category, Boolean inPromotion) {
        Specification<ProductoEntity> spec = buildSpecification(search, type, minPrice, maxPrice, category, inPromotion);
        return productoJpaRepository.count(spec);
    }

    @Override
    public Optional<Producto> findById(Long id) {
        return productoJpaRepository.findById(id).map(productoMapper::toDomain);
    }

    @Override
    public Producto save(Producto product) {
        ProductoEntity entity = productoMapper.toEntity(product);
        return productoMapper.toDomain(productoJpaRepository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        productoJpaRepository.deleteById(id);
    }

    @Override
    public List<Producto> findByProducerId(Long producerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productoJpaRepository.findByProductorId(producerId, pageable)
                .stream().map(productoMapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public long countByProducerId(Long producerId) {
        Specification<ProductoEntity> spec = (root, query, cb) -> cb.equal(root.get("productor").get("id"), producerId);
        return productoJpaRepository.count(spec);
    }

    @Override
    public boolean existsByNameAndProducerId(String name, Long producerId) {
        return productoJpaRepository.existsByNombreIgnoreCaseAndProductorId(name, producerId);
    }

    @Override
    public long count() {
        return productoJpaRepository.count();
    }

    @Override
    public List<Producto> findAll() {
        return productoJpaRepository.findAll().stream()
                .map(productoMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Producto> findByProductorIdAndTipoFruta(Long producerId, TipoFruta type) {
        return productoJpaRepository.findByProductorIdAndTipoFruta(producerId, type)
                .map(productoMapper::toDomain);
    }

    private Pageable buildPageable(int page, int size, String sort) {
        Sort sortObj = Sort.unsorted();
        if (sort != null && !sort.isBlank()) {
            if (sort.equals("price_asc")) {
                sortObj = Sort.by(Sort.Direction.ASC, "precio");
            } else if (sort.equals("price_desc")) {
                sortObj = Sort.by(Sort.Direction.DESC, "precio");
            } else if (sort.equals("newest")) {
                sortObj = Sort.by(Sort.Direction.DESC, "fechaCreacion");
            } else if (sort.equals("popular")) {
                sortObj = Sort.by(Sort.Direction.DESC, "totalVendido");
            }
        }
        return PageRequest.of(page, size, sortObj);
    }

    private Specification<ProductoEntity> buildSpecification(String search, TipoFruta type, BigDecimal minPrice, BigDecimal maxPrice, String category, Boolean inPromotion) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("activo")));

            if (search != null && !search.isBlank()) {
                String searchLike = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("nombre")), searchLike),
                    cb.like(cb.lower(root.get("descripcion")), searchLike)
                ));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("tipoFruta"), type));
            } else if (category != null && !category.isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("tipoFruta"), TipoFruta.valueOf(category.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("precio"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("precio"), maxPrice));
            }
            if (inPromotion != null && inPromotion) {
                predicates.add(cb.isTrue(root.get("enPromocion")));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
