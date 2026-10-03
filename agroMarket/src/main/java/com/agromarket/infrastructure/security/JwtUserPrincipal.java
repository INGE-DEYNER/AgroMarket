package com.agromarket.infrastructure.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.agromarket.domain.models.user.User;

public class JwtUserPrincipal
        implements UserDetails {

    private final User user;

    public JwtUserPrincipal(User user) {
        if (user == null) {
            throw new IllegalArgumentException(
                    "El usuario no puede ser null");
        }

        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public Long getUserId() {
        return user.getId();
    }

    public String getRole() {
        return user.getRole() == null
                ? null
                : user.getRole().name();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        if (user.getRole() == null) {
            return List.of();
        }

        return List.of(
                new SimpleGrantedAuthority(
                        "ROLE_"
                                + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.isActive();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }
}