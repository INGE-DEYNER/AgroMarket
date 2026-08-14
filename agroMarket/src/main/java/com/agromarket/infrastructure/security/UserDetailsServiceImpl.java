package com.agromarket.infrastructure.security;

import java.util.List;

import com.agromarket.domain.user.enums.Role;
import com.agromarket.infrastructure.persistence.sql.entities.UserEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.UserJpaRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio UserDetailsService de Spring Security.
 * Carga los detalles del usuario desde la base de datos para la autenticación.
 * 
 * @author AgroMarket Team
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserJpaRepository userJpaRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userJpaRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return new User(
                user.getEmail(),
                user.getPassword(),
                user.isActive(),
                user.isEmailVerified(),
                true,
                user.isApproved(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
