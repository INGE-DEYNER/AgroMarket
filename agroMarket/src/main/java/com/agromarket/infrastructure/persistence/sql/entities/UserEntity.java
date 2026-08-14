package com.agromarket.infrastructure.persistence.sql.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.agromarket.domain.user.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad JPA que representa un usuario en la base de datos.
 * Mapea la tabla "usuarios" y contiene todos los campos necesarios para la persistencia
 * de la información de usuarios en el sistema AgroMarket.
 * 
 * <p>Esta entidad ya no usa herencia (a diferencia de la versión anterior con UsuarioEntity,
 * CompradorEntity, ProductorEntity, AdministradorEntity). En su lugar, todos los usuarios
 * se almacenan en una sola tabla con un campo "role" que diferencia el tipo de usuario.</p>
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios", indexes = {
    @Index(name = "idx_usuario_role", columnList = "userRole"),
    @Index(name = "idx_usuario_email", columnList = "email")
})
public class UserEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean approved = true;

    @Column(name = "totp_enabled", nullable = false)
    @Builder.Default
    private boolean totpEnabled = false;

    @Column(name = "totp_secret")
    private String totpSecret;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime registrationDate;

    @Column(name = "foto")
    private String foto;

    @Column(name = "proveedor")
    private String provider;

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "email_verificado", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean emailVerified = false;

    @Column(name = "apellido")
    private String lastName;

    @Column(name = "codigo_pais")
    private String countryCode;

    @Column(name = "ubicacion")
    private String location;

    @Column(name = "cedula")
    private String idNumber;

    @Column(name = "fecha_nacimiento")
    private LocalDate birthDate;

    @Column(name = "tipo_documento")
    private String idType;

    @Column(name = "nombre_empresa")
    private String companyName;

    @Column(name = "nit")
    private String nit;

    @Column(name = "es_empresa", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isCompany = false;

    @Column(name = "telefono_verificado", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean phoneVerified = false;

    @Column(name = "cuenta_aprobada", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean accountApproved = false;

    @Column(name = "cuenta_completa", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean accountComplete = false;

    @Column(name = "estado_cuenta")
    @Builder.Default
    private String accountStatus = "PENDING_EMAIL";

    @Column(name = "token_verificacion_email")
    private String emailVerificationToken;

    @Column(name = "token_email_expira")
    private LocalDateTime emailTokenExpiry;

    @Column(name = "token_verificacion_telefono")
    private String phoneVerificationToken;

    @Column(name = "token_telefono_expira")
    private LocalDateTime phoneTokenExpiry;

    @Column(name = "token_recuperacion_password")
    private String passwordResetToken;

    @Column(name = "token_recuperacion_expira")
    private LocalDateTime passwordResetTokenExpiry;

    @Column(name = "cuenta_bancaria")
    private String bankAccount;

    @Column(name = "cupon_primer_envio_usado", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean firstShippingCouponUsed = false;

    @Column(name = "divisa_preferida")
    @Builder.Default
    private String preferredCurrency = "COP";

    @Column(name = "departamento")
    private String department;

    @Column(name = "ciudad")
    private String city;

    @Column(name = "direccion_completa")
    private String fullAddress;

    @Column(name = "referencia")
    private String addressReference;

    @Column(name = "codigo_postal")
    private String postalCode;

    @Column(name = "creado_en")
    private LocalDateTime createdAt;

    @Column(name = "actualizado_en")
    private LocalDateTime updatedAt;

    @Column(name = "ultimo_login")
    private LocalDateTime lastLogin;

    @Column(name = "foto_url")
    private String photoUrl;

    @Column(name = "calificacion_promedio")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(name = "total_resenas")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "verificado", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean verifiedProducer = false;
    
    
    // ==================== GETTERS/SETTERS EXPLÍCITOS (para compatibilidad con Lombok) ====================
    
    /**
     * Obtiene el correo electrónico del usuario.
     * 
     * @return correo electrónico
     */
    public String getEmail() {
        return this.email;
    }
    
    /**
     * Establece el correo electrónico del usuario.
     * 
     * @param email correo electrónico
     */
    public void setEmail(String email) {
        this.email = email;
    }
    
    /**
     * Obtiene el hash de la contraseña del usuario.
     * 
     * @return hash de la contraseña
     */
    public String getPasswordHash() {
        return this.password;
    }
    
    /**
     * Obtiene la contraseña del usuario (alias para getPasswordHash).
     * 
     * @return hash de la contraseña
     */
    public String getPassword() {
        return this.password;
    }
    
    /**
     * Establece el hash de la contraseña del usuario.
     * 
     * @param passwordHash hash de la contraseña
     */
    public void setPasswordHash(String passwordHash) {
        this.password = passwordHash;
    }
    
    /**
     * Verifica si el usuario está activo.
     * 
     * @return true si está activo
     */
    public boolean isActive() {
        return this.active;
    }
    
    /**
     * Establece si el usuario está activo.
     * 
     * @param active estado de actividad
     */
    public void setActive(boolean active) {
        this.active = active;
    }
    
    /**
     * Verifica si el usuario está aprobado.
     * 
     * @return true si está aprobado
     */
    public boolean isApproved() {
        return this.approved;
    }
    
    /**
     * Establece si el usuario está aprobado.
     * 
     * @param approved estado de aprobación
     */
    public void setApproved(boolean approved) {
        this.approved = approved;
    }
    
    /**
     * Verifica si el usuario tiene 2FA habilitado.
     * 
     * @return true si 2FA está habilitado
     */
    public boolean isTotpEnabled() {
        return this.totpEnabled;
    }
    
    /**
     * Establece si el usuario tiene 2FA habilitado.
     * 
     * @param totpEnabled estado de 2FA
     */
    public void setTotpEnabled(boolean totpEnabled) {
        this.totpEnabled = totpEnabled;
    }
    
    /**
     * Obtiene el rol del usuario.
     * 
     * @return rol del usuario
     */
    public Role getRole() {
        return this.role;
    }

    /**
     * Establece el rol del usuario.
     * 
     * @param role rol del usuario
     */
    public void setRole(Role role) {
        this.role = role;
    }

    /**
     * Obtiene el secreto de 2FA.
     * 
     * @return secreto de 2FA
     */
    public String getTotpSecret() {
        return this.totpSecret;
    }
    
    /**
     * Establece el secreto de 2FA.
     * 
     * @param totpSecret secreto de 2FA
     */
    public void setTotpSecret(String totpSecret) {
        this.totpSecret = totpSecret;
    }
    
    /**
     * Obtiene la foto de perfil.
     * 
     * @return URL de la foto de perfil
     */
    public String getFoto() {
        return this.foto;
    }
    
    /**
     * Establece la foto de perfil.
     * 
     * @param foto URL de la foto de perfil
     */
    public void setFoto(String foto) {
        this.foto = foto;
    }
    
    /**
     * Obtiene el proveedor de autenticación.
     * 
     * @return proveedor (ej: "local", "google")
     */
    public String getProvider() {
        return this.provider;
    }
    
    /**
     * Establece el proveedor de autenticación.
     * 
     * @param provider proveedor
     */
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    /**
     * Obtiene el ID de Google.
     * 
     * @return ID de Google
     */
    public String getGoogleId() {
        return this.googleId;
    }
    
    /**
     * Establece el ID de Google.
     * 
     * @param googleId ID de Google
     */
    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }
    
    /**
     * Verifica si el correo está verificado.
     * 
     * @return true si el correo está verificado
     */
    public boolean isEmailVerified() {
        return this.emailVerified;
    }
    
    /**
     * Establece si el correo está verificado.
     * 
     * @param emailVerified estado de verificación
     */
    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
    
    /**
     * Obtiene el nombre del usuario.
     * 
     * @return nombre
     */
    public String getFirstName() {
        return this.firstName;
    }
    
    /**
     * Obtiene el apellido del usuario.
     * 
     * @return apellido
     */
    public String getLastName() {
        return this.lastName;
    }
    
    /**
     * Establece la contraseña del usuario.
     * 
     * @param password contraseña
     */
    public void setPassword(String password) {
        this.password = password;
    }
    
    /**
     * Establece el token de recuperación de contraseña.
     * 
     * @param token token de recuperación
     */
    public void setPasswordResetToken(String token) {
        this.passwordResetToken = token;
    }
    
    /**
     * Establece la fecha de expiración del token de recuperación.
     * 
     * @param expiry fecha de expiración
     */
    public void setPasswordResetTokenExpiry(LocalDateTime expiry) {
        this.passwordResetTokenExpiry = expiry;
    }
    
    /**
     * Obtiene la fecha de expiración del token de recuperación.
     * 
     * @return fecha de expiración
     */
    public LocalDateTime getPasswordResetTokenExpiry() {
        return this.passwordResetTokenExpiry;
    }
    
    /**
     * Obtiene el token de recuperación de contraseña.
     * 
     * @return token de recuperación
     */
    public String getPasswordResetToken() {
        return this.passwordResetToken;
    }
    
    // Getters/Setters para campos de ubicación
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getFullAddress() { return fullAddress; }
    public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }
    public String getAddressReference() { return addressReference; }
    public void setAddressReference(String addressReference) { this.addressReference = addressReference; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
}
