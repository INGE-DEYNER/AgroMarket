package com.agromarket.interfaces.rest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import com.agromarket.BaseIT;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.util.HashMap;

@AutoConfigureMockMvc
public class AuthControllerIT extends BaseIT {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    public void registroAndLogin_shouldReturn200() throws Exception {
        HashMap<String, Object> payload = new HashMap<>();
        payload.put("nombre", "Test");
        payload.put("apellido", "User");
        payload.put("correo", "test+it@example.com");
        payload.put("telefono", "3000000000");
        payload.put("contrasena", "Passw0rd!");
        payload.put("rol", "COMPRADOR");

        mockMvc.perform(post("/api/auth/registro")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").exists());

        HashMap<String, Object> login = new HashMap<>();
        login.put("correo", "test+it@example.com");
        login.put("contrasena", "Passw0rd!");

        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").exists());
    }
}
