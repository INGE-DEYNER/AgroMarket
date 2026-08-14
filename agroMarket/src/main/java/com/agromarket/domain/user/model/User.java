package com.agromarket.domain.user.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.agromarket.domain.user.enums.Role;
import com.agromarket.domain.order.model.Order;
import com.agromarket.domain.product.model.Product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un usuario en el sistema AgroMarket.
 * Consolida los conceptos de Comprador, Productor y Administrador en una sola clase
 * utilizando un campo de tipo Role para diferenciar los tipos de usuario.
 * 
 * <p>Esta clase contiene todos los atributos comunes y específicos de los distintos tipos de usuarios,
 * evitando el uso de herencia a favor de composición, lo cual es una mejor práctica en DDD
 * para mantener la flexibilidad y evitar jerarquías rígidas.</p>
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    // ==================== IDENTIFICACIÓN BÁSICA ====================
    
    private Long id;
    
    /**
     * Nombre del usuario.
     */
    private String firstName;
    
    /**
     * Apellido del usuario.
     */
    private String lastName;
    
    /**
     * Correo electrónico del usuario (único).
     */
    private String email;
    
    /**
     * Contraseña del usuario (hasheada).
     */
    private String password;
    
    /**
     * Número de teléfono del usuario.
     */
    private String phone;
    
    /**
     * Rol del usuario en el sistema (BUYER, PRODUCER, ADMIN).
     */
    private Role role;
    
    
    // ==================== AUTENTICACIÓN Y SEGURIDAD ====================
    
    /**
     * Indica si el usuario está activo en el sistema.
     */
    @Builder.Default
    private boolean active = true;
    
    /**
     * Indica si el usuario ha sido aprobado por un administrador.
     */
    @Builder.Default
    private boolean approved = true;
    
    /**
     * Indica si el usuario tiene autenticación de dos factores (2FA) habilitada.
     */
    @Builder.Default
    private boolean totpEnabled = false;
    
    /**
     * Secreto para la autenticación de dos factores.
     */
    private String totpSecret;
    
    /**
     * Fecha y hora en que se registró el usuario.
     */
    private LocalDateTime registrationDate;
    
    /**
     * Provedor de autenticación (ej: "local", "google", "facebook").
     */
    private String provider;
    
    /**
     * ID del usuario en el proveedor externo (ej: Google ID).
     */
    private String providerId;
    
    /**
     * Indica si el correo electrónico ha sido verificado.
     */
    @Builder.Default
    private boolean emailVerified = false;
    
    
    // ==================== INFORMACIÓN PERSONAL/EMRESARIAL ====================
    
    /**
     * Código del país del usuario (ej: "+57" para Colombia).
     */
    private String countryCode;
    
    /**
     * Ubicación general del usuario.
     */
    private String location;
    
    /**
     * Número de cédula o identificación del usuario.
     */
    private String idNumber;
    
    /**
     * Fecha de nacimiento del usuario.
     */
    private LocalDate birthDate;
    
    /**
     * Tipo de documento de identidad (ej: "CC", "NIT", "CE").
     */
    private String idType;
    
    /**
     * Nombre de la empresa (para usuarios empresariales).
     */
    private String companyName;
    
    /**
     * NIT de la empresa (para usuarios empresariales).
     */
    private String nit;
    
    /**
     * Indica si el usuario es una empresa.
     */
    @Builder.Default
    private Boolean isCompany = false;
    
    
    // ==================== VERIFICACIÓN Y ESTADO ====================
    
    /**
     * Indica si el teléfono ha sido verificado.
     */
    @Builder.Default
    private Boolean phoneVerified = false;
    
    /**
     * Indica si la cuenta ha sido aprobada por un administrador.
     */
    @Builder.Default
    private Boolean accountApproved = false;
    
    /**
     * Indica si la cuenta está completa (todos los datos requeridos están proporcionados).
     */
    @Builder.Default
    private Boolean accountComplete = false;
    
    /**
     * Estado actual de la cuenta (ej: "PENDING_EMAIL", "ACTIVE", "SUSPENDED").
     */
    @Builder.Default
    private String accountStatus = "PENDING_EMAIL";
    
    
    // ==================== TOKENS DE VERIFICACIÓN ====================
    
    /**
     * Token para verificación de correo electrónico.
     */
    private String emailVerificationToken;
    
    /**
     * Fecha de expiración del token de verificación de correo.
     */
    private LocalDateTime emailTokenExpiry;
    
    /**
     * Token para verificación de teléfono.
     */
    private String phoneVerificationToken;
    
    /**
     * Fecha de expiración del token de verificación de teléfono.
     */
    private LocalDateTime phoneTokenExpiry;
    
    /**
     * Token para recuperación de contraseña.
     */
    private String passwordResetToken;
    
    /**
     * Fecha de expiración del token de recuperación de contraseña.
     */
    private LocalDateTime passwordResetTokenExpiry;
    
    
    // ==================== INFORMACIÓN FINANCIERA ====================
    
    /**
     * Información de la cuenta bancaria del usuario (para productores).
     */
    private String bankAccount;
    
    /**
     * Indica si el usuario ha utilizado el cupón de primer envío gratis.
     */
    @Builder.Default
    private Boolean firstShippingCouponUsed = false;
    
    
    // ==================== PREFERENCIAS ====================
    
    /**
     * Moneda preferida del usuario (ej: "COP", "USD").
     */
    @Builder.Default
    private String preferredCurrency = "COP";
    
    
    // ==================== UBICACIÓN ====================
    
    /**
     * Departamento o región del usuario.
     */
    private String department;
    
    /**
     * Ciudad del usuario.
     */
    private String city;
    
    /**
     * Dirección completa del usuario.
     */
    private String fullAddress;
    
    /**
     * Referencia de la dirección.
     */
    private String addressReference;
    
    /**
     * Código postal.
     */
    private String postalCode;
    
    
    // ==================== MULTIMEDIA ====================
    
    /**
     * URL de la foto de perfil del usuario.
     */
    private String photoUrl;
    
    
    // ==================== REPUTACIÓN (para productores) ====================
    
    /**
     * Calificación promedio del usuario como productor.
     */
    @Builder.Default
    private Double averageRating = 0.0;
    
    /**
     * Número total de reseñas recibidas.
     */
    @Builder.Default
    private Integer totalReviews = 0;
    
    
    // ==================== FECHAS DE AUDITORÍA ====================
    
    /**
     * Fecha de creación del registro.
     */
    private LocalDateTime createdAt;
    
    /**
     * Fecha de la última actualización.
     */
    private LocalDateTime updatedAt;
    
    /**
     * Fecha del último inicio de sesión.
     */
    private LocalDateTime lastLogin;
    
    
    // ==================== DATOS ESPECÍFICOS POR ROL ====================
    
    /**
     * Indica si el productor ha sido verificado por el sistema.
     * Aplicable solo para usuarios con rol PRODUCER.
     */
    @Builder.Default
    private Boolean verifiedProducer = false;
    
    /**
     * Lista de pedidos realizados por el usuario (como comprador).
     * Aplicable principalmente para usuarios con rol BUYER.
     */
    @Builder.Default
    private List<Order> orderHistory = new ArrayList<>();
    
    /**
     * Lista de productos publicados por el usuario (como productor).
     * Aplicable principalmente para usuarios con rol PRODUCER.
     */
    @Builder.Default
    private List<Product> publishedProducts = new ArrayList<>();
    
    
    // ==================== MÉTODOS DE NEGOCIO ====================
    
    /**
     * Verifica si el usuario está activo en el sistema.
     * 
     * @return true si el usuario está activo, false de lo contrario
     */
    public boolean isActive() {
        return active;
    }
    
    /**
     * Verifica si el usuario es un comprador.
     * 
     * @return true si el rol del usuario es BUYER
     */
    public boolean isBuyer() {
        return role == Role.BUYER;
    }
    
    /**
     * Verifica si el usuario es un productor.
     * 
     * @return true si el rol del usuario es PRODUCER
     */
    public boolean isProducer() {
        return role == Role.PRODUCER;
    }
    
    /**
     * Verifica si el usuario es un administrador.
     * 
     * @return true si el rol del usuario es ADMIN
     */
    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
