package com.agromarket.domain.models.user;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.user.Role;

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
     * Indica si el usuario está activo en el sistema. Un usuario desactivado
     * no puede iniciar sesión ni operar; lo controla el panel de administración.
     */
    @Builder.Default
    private boolean active = true;
    
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
     * Provedor de autenticación (ej: "local", "google").
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
     * Indica si el usuario es una empresa. Es un valor DERIVADO de la
     * existencia de {@code companyName}; no se persiste como columna propia.
     */
    @Builder.Default
    private Boolean isCompany = false;
    
    
    // ==================== VERIFICACIÓN Y ESTADO ====================

    /**
     * Indica si la cuenta ha sido aprobada por un administrador. Para el rol
     * PRODUCER es la validación que autoriza operar en el marketplace
     * (lo alterna el panel de administración). Para BUYER/ADMIN no aporta
     * información adicional a {@link #active}, por eso queda en {@code true}
     * al registrarse.
     */
    @Builder.Default
    private Boolean accountApproved = false;
    
    
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
     * Token para recuperación de contraseña.
     */
    private String passwordResetToken;
    
    /**
     * Fecha de expiración del token de recuperación de contraseña.
     */
    private LocalDateTime passwordResetTokenExpiry;
    
    
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
    
    
    // ==================== FECHAS DE AUDITORÍA ====================
    
    /**
     * Fecha de creación del registro. Es también la fecha de registro del
     * usuario: antes existían {@code registrationDate} y {@code createdAt}
     * con el mismo valor, por lo que se unificaron en esta sola columna.
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
    
    /**
     * Indica si la cuenta tiene completos los datos de identidad (KYC).
     *
     * <p>Este valor es DERIVADO: antes se persistía la columna
     * {@code account_complete}, que podía quedar desincronizada de los datos
     * reales y provocaba que el modal "Completar cuenta" reapareciera al
     * recargar. Ahora la fuente de verdad son los propios campos KYC.</p>
     *
     * @return true si tiene tipo de documento, número de documento y fecha
     *         de nacimiento
     */
    public boolean isAccountComplete() {
        return tieneDato(this.idType)
                && tieneDato(this.idNumber)
                && this.birthDate != null;
    }
    
    /**
     * Indica si el usuario representa a una empresa.
     *
     * <p>Es DERIVADO de {@code companyName}: si no hay razón social, no es
     * empresa. Antes existía la columna {@code is_company} que podía
     * contradecir a la razón social almacenada.</p>
     *
     * @return true si tiene razón social registrada
     */
    public boolean isCompanyUser() {
        return tieneDato(this.companyName);
    }
    
    private static boolean tieneDato(String valor) {
        return valor != null && !valor.isBlank();
    }
}
