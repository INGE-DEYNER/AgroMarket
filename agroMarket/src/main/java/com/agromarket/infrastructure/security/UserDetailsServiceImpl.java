package com.agromarket.infrastructure.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.out.user.UserPort;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl
        implements UserDetailsService {

    private final UserPort userPort;

    @Override
    public UserDetails loadUserByUsername(
            String username)
            throws UsernameNotFoundException {

        User user = userPort.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado"));

        return new JwtUserPrincipal(user);
    }

    public UserDetails loadUserById(
            Long userId)
            throws UsernameNotFoundException {

        User user = userPort.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado"));

        return new JwtUserPrincipal(user);
    }
}