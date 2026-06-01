package com.agromarket.infrastructure.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.agromarket.domain.model.RolUsuario;
import com.agromarket.domain.model.TipoFruta;
import com.agromarket.infrastructure.persistence.entity.AdministradorEntity;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.ProductoEntity;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final ProductoJpaRepository productoJpaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioJpaRepository.existsByCorreo("admin@agromarket.com")) {
            log.info("Datos de desarrollo ya inicializados");
            return;
        }

        AdministradorEntity admin = AdministradorEntity.builder()
                .nombre("Administrador")
                .correo("admin@agromarket.com")
                .contrasena(passwordEncoder.encode("admin123"))
                .telefono("0000000000")
                .activo(true)
                .fechaRegistro(LocalDateTime.now())
                .build();
        admin.setRol(RolUsuario.ADMINISTRADOR);
        usuarioJpaRepository.save(admin);

        ProductorEntity luis = guardarProductor("Luis Palacios", "luis.productor@agromarket.com", "pass123", "Chigorodó, Antioquia");
        ProductorEntity ana = guardarProductor("Ana Córdoba", "ana.productor@agromarket.com", "pass123", "Turbo, Antioquia");
        ProductorEntity pedro = guardarProductor("Pedro Urrego", "pedro.productor@agromarket.com", "pass123", "Apartadó, Antioquia");

        guardarComprador("María Torres", "maria@agromarket.com", "pass123");
        guardarComprador("Jorge Restrepo", "jorge@agromarket.com", "pass123");

        List<ProductoEntity> productos = List.of(
                producto("Banano Urabá", "Banano fresco de alta calidad", new BigDecimal("3200"), 120, TipoFruta.BANANO, luis, true),
                producto("Piña Manzana", "Piña dulce y aromática", new BigDecimal("8500"), 80, TipoFruta.PINA, luis, false),
                producto("Mango Tommy", "Mango maduro para exportación", new BigDecimal("6400"), 95, TipoFruta.MANGO, ana, false),
                producto("Maracuyá", "Fruta tropical para jugos", new BigDecimal("5200"), 100, TipoFruta.MARACUYA, ana, true),
                producto("Guanábana", "Guanábana fresca de Urabá", new BigDecimal("11000"), 45, TipoFruta.GUANABANA, pedro, false),
                producto("Naranja Valencia", "Naranja jugosa y dulce", new BigDecimal("3900"), 140, TipoFruta.NARANJA, pedro, false),
                producto("Coco Fresco", "Coco recién cosechado", new BigDecimal("4700"), 70, TipoFruta.COCO, luis, false),
                producto("Limón Tahití", "Limón ideal para bebidas", new BigDecimal("2600"), 160, TipoFruta.LIMON, ana, true)
        );
        productoJpaRepository.saveAll(Objects.requireNonNull(productos));
        log.info("Datos de desarrollo inicializados correctamente");
    }

    private ProductorEntity guardarProductor(String nombre, String correo, String contrasena, String ubicacion) {
        ProductorEntity productor = ProductorEntity.builder()
                .nombre(nombre)
                .correo(correo)
                .contrasena(passwordEncoder.encode(contrasena))
                .telefono("3000000000")
                .ubicacion(ubicacion)
                .activo(true)
                .fechaRegistro(LocalDateTime.now())
                .build();
        productor.setRol(RolUsuario.PRODUCTOR);
        return (ProductorEntity) usuarioJpaRepository.save(productor);
    }

    private CompradorEntity guardarComprador(String nombre, String correo, String contrasena) {
        CompradorEntity comprador = CompradorEntity.builder()
                .nombre(nombre)
                .correo(correo)
                .contrasena(passwordEncoder.encode(contrasena))
                .telefono("3100000000")
                .activo(true)
                .fechaRegistro(LocalDateTime.now())
                .build();
        comprador.setRol(RolUsuario.COMPRADOR);
        return (CompradorEntity) usuarioJpaRepository.save(comprador);
    }

    private ProductoEntity producto(String nombre, String descripcion, BigDecimal precio, Integer cantidad, TipoFruta tipoFruta, ProductorEntity productor, boolean promocion) {
        return ProductoEntity.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .precio(precio)
                .cantidadDisponible(cantidad)
                .imagenUrl(null)
                .tipoFruta(tipoFruta)
                .productor(productor)
                .enPromocion(promocion)
                .activo(true)
                .build();
    }
}
