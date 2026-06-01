package com.agromarket.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Objects;

import com.agromarket.domain.model.TipoFruta;
import com.agromarket.infrastructure.persistence.entity.ProductoEntity;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
@SuppressWarnings({"null", "unused"})
public class ProductoJpaRepositoryIT {

    @Autowired
    ProductoJpaRepository productoJpaRepository;

    @Autowired
    UsuarioJpaRepository usuarioJpaRepository;

    @Test
    public void saveFindDelete_productoEntity() {
        ProductorEntity productor = ProductorEntity.builder()
                .nombre("Prod")
                .correo("prod.repo@example.com")
                .contrasena("x")
                .telefono("3000000001")
                .build();
        ProductorEntity savedProd = (ProductorEntity) usuarioJpaRepository.save(Objects.requireNonNull(productor));

        ProductoEntity p = ProductoEntity.builder()
                .nombre("Manzana")
                .precio(new BigDecimal("1.23"))
                .cantidadDisponible(10)
                .tipoFruta(TipoFruta.OTRO)
                .productor(Objects.requireNonNull(savedProd))
                .enPromocion(false)
                .build();

        ProductoEntity saved = productoJpaRepository.save(p);
        assertThat(saved.getId()).isNotNull();
        assertThat(productoJpaRepository.findById(Objects.requireNonNull(saved.getId()))).isPresent();

        productoJpaRepository.deleteById(Objects.requireNonNull(saved.getId()));
        assertThat(productoJpaRepository.findById(Objects.requireNonNull(saved.getId()))).isNotPresent();
    }
}
