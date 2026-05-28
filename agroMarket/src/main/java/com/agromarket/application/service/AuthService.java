package com.agromarket.application.service;

import com.agromarket.application.dto.AuthResponse;
import com.agromarket.application.dto.LoginRequest;
import com.agromarket.application.dto.RegistroRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);

    void registro(RegistroRequest request);
}
