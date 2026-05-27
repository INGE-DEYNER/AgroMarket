package com.agromarket.interfaces.rest.controller;

import com.agromarket.BaseIT;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.domain.model.TipoFruta;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.agromarket.infrastructure.security.JwtUserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class ProductoControllerIT extends BaseIT {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    UsuarioJpaRepository usuarioJpaRepository;

    @Autowired
    ProductoJpaRepository productoJpaRepository;

    ProductorEntity productor;

    @BeforeEach
    public void setup() {
        productor = ProductorEntity.builder()
                .nombre("ProdIT")
                .correo("prod.it@example.com")
                .contrasena("x")
                .telefono("3000000002")
                .build();
        productor = (ProductorEntity) usuarioJpaRepository.save(productor);
    }

    @Test
    public void getAll_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    public void postCrear_shouldReturn200_withAuth() throws Exception {
        JwtUserPrincipal principal = JwtUserPrincipal.builder().userId(productor.getId()).correo(productor.getCorreo()).rol(RolUsuario.PRODUCTOR).build();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, List.of(new SimpleGrantedAuthority("ROLE_PRODUCTOR")));

        Map<String, Object> payload = Map.of(
                "nombre", "ManzanaIT",
                "precio", new BigDecimal("2.50"),
                "cantidadDisponible", 5,
                "tipoFruta", "OTRO",
                "enPromocion", false
        );

        mockMvc.perform(post("/api/productos")
                .with(authentication(auth))
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    public void getById_notFound_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/productos/9999999"))
                .andExpect(status().isNotFound());
    }
}
