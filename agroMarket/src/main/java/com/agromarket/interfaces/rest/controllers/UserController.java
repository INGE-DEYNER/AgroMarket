package com.agromarket.interfaces.rest.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.dto.request.user.UpdateProfileRequest;
import com.agromarket.application.dto.response.user.UserResponse;
import com.agromarket.application.dto.shared.ApiResponse;
import com.agromarket.domain.user.ports.in.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controlador REST que gestiona las operaciones relacionadas con usuarios.
 * Incluye endpoints para obtener información de usuarios, actualizar perfiles,
 * y gestionar cuentas de usuario.
 * 
 * @author AgroMarket Team
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "Usuarios", description = "Operaciones relacionadas con la gestión de usuarios")
public class UserController {

    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * Obtiene todos los usuarios del sistema.
     * Solo accesible para administradores.
     * 
     * @return lista de todos los usuarios
     */
    @GetMapping
    @Operation(summary = "Obtener todos los usuarios", description = "Retorna una lista de todos los usuarios registrados en el sistema")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAll();
        return ResponseEntity.ok(ApiResponse.success(users, "Usuarios obtenidos exitosamente"));
    }
    
    /**
     * Obtiene un usuario por su ID.
     * 
     * @param id ID del usuario a obtener
     * @return información del usuario
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Retorna la información de un usuario específico")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "Usuario obtenido exitosamente"));
    }
    
    /**
     * Obtiene el perfil del usuario actual.
     * 
     * @param id ID del usuario
     * @return información del perfil del usuario
     */
    @GetMapping("/{id}/profile")
    @Operation(summary = "Obtener perfil de usuario", description = "Retorna la información del perfil de un usuario")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@PathVariable Long id) {
        UserResponse profile = userService.getProfile(id);
        return ResponseEntity.ok(ApiResponse.success(profile, "Perfil obtenido exitosamente"));
    }
    
    /**
     * Actualiza el perfil de un usuario.
     * 
     * @param id ID del usuario a actualizar
     * @param request datos de actualización del perfil
     * @return información del usuario actualizado
     */
    @PutMapping("/{id}/profile")
    @Operation(summary = "Actualizar perfil de usuario", description = "Actualiza la información del perfil de un usuario")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @PathVariable Long id, 
            @RequestBody @Valid UpdateProfileRequest request) {
        UserResponse updatedUser = userService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Perfil actualizado exitosamente"));
    }
    
    /**
     * Actualiza un usuario.
     * Solo accesible para administradores.
     * 
     * @param id ID del usuario a actualizar
     * @param request datos de actualización del usuario
     * @return información del usuario actualizado
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario", description = "Actualiza la información de un usuario (requiere permisos de administrador)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id, 
            @RequestBody @Valid UpdateProfileRequest request) {
        UserResponse updatedUser = userService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Usuario actualizado exitosamente"));
    }
    
    /**
     * Habilita un usuario.
     * Solo accesible para administradores.
     * 
     * @param id ID del usuario a habilitar
     * @return confirmación de la operación
     */
    @PatchMapping("/{id}/enable")
    @Operation(summary = "Habilitar usuario", description = "Habilita una cuenta de usuario (requiere permisos de administrador)")
    public ResponseEntity<ApiResponse<Void>> enableUser(@PathVariable Long id) {
        userService.enable(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Usuario habilitado exitosamente"));
    }
    
    /**
     * Deshabilita un usuario.
     * Solo accesible para administradores.
     * 
     * @param id ID del usuario a deshabilitar
     * @return confirmación de la operación
     */
    @PatchMapping("/{id}/disable")
    @Operation(summary = "Deshabilitar usuario", description = "Deshabilita una cuenta de usuario (requiere permisos de administrador)")
    public ResponseEntity<ApiResponse<Void>> disableUser(@PathVariable Long id) {
        userService.disable(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Usuario deshabilitado exitosamente"));
    }
}
