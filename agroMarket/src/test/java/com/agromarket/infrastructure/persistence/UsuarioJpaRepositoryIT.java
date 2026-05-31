package com.agromarket.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import java.util.Objects;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
public class UsuarioJpaRepositoryIT {

    @Autowired
    UsuarioJpaRepository usuarioJpaRepository;

    @Test
    public void saveFindDelete_usuarioEntity() {
        CompradorEntity comprador = CompradorEntity.builder()
                .nombre("Juan")
                .correo("juan.repo@example.com")
                .contrasena("x")
                .telefono("3000000000")
                .build();

        CompradorEntity saved = (CompradorEntity) usuarioJpaRepository.save(Objects.requireNonNull(comprador));
        assertThat(saved.getId()).isNotNull();

        assertThat(usuarioJpaRepository.findById(Objects.requireNonNull(saved.getId()))).isPresent();

        usuarioJpaRepository.deleteById(Objects.requireNonNull(saved.getId()));
        assertThat(usuarioJpaRepository.findById(Objects.requireNonNull(saved.getId()))).isNotPresent();
    }
}
