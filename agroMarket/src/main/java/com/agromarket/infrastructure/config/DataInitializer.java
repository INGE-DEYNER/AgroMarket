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
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final ProductoJpaRepository productoJpaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking database seed...");

        // 1. Seed Admin
        if (!usuarioJpaRepository.existsByCorreo("admin@agromarket.com")) {
            AdministradorEntity admin = AdministradorEntity.builder()
                    .nombre("Administrador")
                    .correo("admin@agromarket.com")
                    .contrasena(passwordEncoder.encode("admin123"))
                    .telefono("0000000000")
                    .activo(true)
                    .aprobado(true)
                    .emailVerificado(true)
                    .cuentaAprobada(true)
                    .cuentaCompleta(true)
                    .estadoCuenta("ACTIVA")
                    .fechaRegistro(LocalDateTime.now())
                    .build();
            admin.setRol(RolUsuario.ADMINISTRADOR);
            usuarioJpaRepository.save(admin);
            log.info("Seeded admin@agromarket.com");
        }

        // 2. Seed Test Producer
        ProductorEntity producer = null;
        if (!usuarioJpaRepository.existsByCorreo("producer@test.com")) {
            producer = ProductorEntity.builder()
                    .nombre("Pedro")
                    .apellido("Perez")
                    .correo("producer@test.com")
                    .contrasena(passwordEncoder.encode("Password123!"))
                    .telefono("3001234567")
                    .ubicacion("Urabá")
                    .activo(true)
                    .aprobado(true)
                    .emailVerificado(true)
                    .cuentaAprobada(true)
                    .cuentaCompleta(true)
                    .estadoCuenta("ACTIVA")
                    .verificado(true)
                    .codigoPais("57")
                    .fechaRegistro(LocalDateTime.now())
                    .build();
            producer.setRol(RolUsuario.PRODUCTOR);
            producer = usuarioJpaRepository.save(producer);
            log.info("Seeded producer@test.com");
        } else {
            var existing = usuarioJpaRepository.findByCorreo("producer@test.com").orElse(null);
            if (existing instanceof ProductorEntity) {
                producer = (ProductorEntity) existing;
            }
        }

        // 3. Seed Test Buyer
        if (!usuarioJpaRepository.existsByCorreo("buyer@test.com")) {
            CompradorEntity buyer = CompradorEntity.builder()
                    .nombre("Juan")
                    .apellido("Gomez")
                    .correo("buyer@test.com")
                    .contrasena(passwordEncoder.encode("Password123!"))
                    .telefono("3009876543")
                    .activo(true)
                    .aprobado(true)
                    .emailVerificado(true)
                    .cuentaAprobada(true)
                    .cuentaCompleta(true)
                    .estadoCuenta("ACTIVA")
                    .codigoPais("57")
                    .fechaRegistro(LocalDateTime.now())
                    .build();
            buyer.setRol(RolUsuario.COMPRADOR);
            usuarioJpaRepository.save(buyer);
            log.info("Seeded buyer@test.com");
        }

        // 4. Seed Dev producers if they don't exist
        ProductorEntity luis = null;
        if (!usuarioJpaRepository.existsByCorreo("luis.productor@agromarket.com")) {
            luis = guardarProductor("Luis Palacios", "luis.productor@agromarket.com", "pass123", "Chigorodó, Antioquia");
        }
        ProductorEntity ana = null;
        if (!usuarioJpaRepository.existsByCorreo("ana.productor@agromarket.com")) {
            ana = guardarProductor("Ana Córdoba", "ana.productor@agromarket.com", "pass123", "Turbo, Antioquia");
        }
        ProductorEntity pedro = null;
        if (!usuarioJpaRepository.existsByCorreo("pedro.productor@agromarket.com")) {
            pedro = guardarProductor("Pedro Urrego", "pedro.productor@agromarket.com", "pass123", "Apartadó, Antioquia");
        }

        if (!usuarioJpaRepository.existsByCorreo("maria@agromarket.com")) {
            guardarComprador("María Torres", "maria@agromarket.com", "pass123");
        }
        if (!usuarioJpaRepository.existsByCorreo("jorge@agromarket.com")) {
            guardarComprador("Jorge Restrepo", "jorge@agromarket.com", "pass123");
        }

        // 5. Seed Products with web image URLs if catalog is empty
        if (productoJpaRepository.count() == 0) {
            log.info("Catalog is empty. Seeding products with high-quality web URLs...");
            ProductorEntity defaultProducer = producer != null ? producer : luis;
            if (defaultProducer != null) {
                List<ProductoEntity> productos = List.of(
                        producto("Banano Urabá Premium", "Bananos frescos cultivados en la región de Urabá, alta calidad y sabor dulce natural.", new BigDecimal("3500"), 500, TipoFruta.BANANO, defaultProducer, true, "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800"),
                        producto("Piña Golden Dulce", "Piña de variedad Gold, madurada al sol, con un dulzor excepcional y jugosidad inigualable.", new BigDecimal("4500"), 200, TipoFruta.PINA, defaultProducer, false, "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800"),
                        producto("Mango Tommy Atkins", "Mango Tommy fresco, pulpa firme y sabor dulce con un toque de acidez perfecta.", new BigDecimal("2800"), 300, TipoFruta.MANGO, defaultProducer, true, "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800"),
                        producto("Maracuyá de Exportación", "Fruta de la pasión con excelente aroma y alto porcentaje de pulpa para jugos.", new BigDecimal("5000"), 150, TipoFruta.MARACUYA, defaultProducer, false, "https://images.unsplash.com/photo-1578160112054-954a67602b88?w=800"),
                        producto("Limón Tahití Fresco", "Limones Tahití extra jugosos, ideales para limonadas y sazonar alimentos.", new BigDecimal("3000"), 400, TipoFruta.LIMON, defaultProducer, false, "https://images.unsplash.com/photo-1590502593747-42a996133562?w=800"),
                        producto("Naranja Valencia Jugosa", "Naranjas Valencia ricas en vitamina C, pulpa dulce y abundante zumo.", new BigDecimal("3200"), 600, TipoFruta.NARANJA, defaultProducer, true, "https://images.unsplash.com/photo-1547514701-42782101795e?w=800"),
                        producto("Coco Playero Selecto", "Cocos seleccionados con abundante agua refrescante y deliciosa pulpa carnosa.", new BigDecimal("6000"), 100, TipoFruta.COCO, defaultProducer, false, "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800")
                );
                productoJpaRepository.saveAll(productos);
                log.info("Products seeded successfully.");
            }
        }
    }

    private ProductorEntity guardarProductor(String nombre, String correo, String contrasena, String ubicacion) {
        ProductorEntity productor = ProductorEntity.builder()
                .nombre(nombre)
                .correo(correo)
                .contrasena(passwordEncoder.encode(contrasena))
                .telefono("3000000000")
                .ubicacion(ubicacion)
                .activo(true)
                .aprobado(true)
                .emailVerificado(true)
                .cuentaAprobada(true)
                .cuentaCompleta(true)
                .estadoCuenta("ACTIVA")
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
                .aprobado(true)
                .emailVerificado(true)
                .cuentaAprobada(true)
                .cuentaCompleta(true)
                .estadoCuenta("ACTIVA")
                .fechaRegistro(LocalDateTime.now())
                .build();
        comprador.setRol(RolUsuario.COMPRADOR);
        return (CompradorEntity) usuarioJpaRepository.save(comprador);
    }

    private ProductoEntity producto(String nombre, String descripcion, BigDecimal precio, Integer cantidad, TipoFruta tipoFruta, ProductorEntity productor, boolean promocion, String imagenUrl) {
        return ProductoEntity.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .precio(precio)
                .cantidadDisponible(cantidad)
                .imagenUrl(imagenUrl)
                .tipoFruta(tipoFruta)
                .productor(productor)
                .enPromocion(promocion)
                .activo(true)
                .build();
    }
}
