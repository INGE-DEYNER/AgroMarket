package com.agromarket.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
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

        CompradorEntity saved = (CompradorEntity) usuarioJpaRepository.save(comprador);
        assertThat(saved.getId()).isNotNull();

        assertThat(usuarioJpaRepository.findById(saved.getId())).isPresent();

        usuarioJpaRepository.deleteById(saved.getId());
        assertThat(usuarioJpaRepository.findById(saved.getId())).isNotPresent();
    }
}
