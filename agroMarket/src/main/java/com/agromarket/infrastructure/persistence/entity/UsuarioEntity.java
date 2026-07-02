package com.agromarket.infrastructure.persistence.entity;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.agromarket.domain.model.RolUsuario;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios", indexes = {
    @jakarta.persistence.Index(name = "idx_usuario_rol", columnList = "rol")
})
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "rol")
public abstract class UsuarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String correo;

    @Column(nullable = false)
    private String contrasena;

    @Column(nullable = false)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, insertable = false, updatable = false)
    private RolUsuario rol;

    public RolUsuario getRol() {
        if (this instanceof AdministradorEntity) {
            return RolUsuario.ADMINISTRADOR;
        }
        if (this instanceof ProductorEntity) {
            return RolUsuario.PRODUCTOR;
        }
        if (this instanceof CompradorEntity) {
            return RolUsuario.COMPRADOR;
        }
        return this.rol;
    }

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean aprobado = true;

    @Column(name = "totp_enabled", nullable = false)
    @Builder.Default
    private boolean totpEnabled = false;

    @Column(name = "totp_secret")
    private String totpSecret;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "foto")
    private String foto;

    @Column(name = "proveedor")
    private String proveedor;

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "email_verificado", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean emailVerificado = false;

    @Column(name = "apellido")
    private String apellido;

    @Column(name = "codigo_pais")
    private String codigoPais;

    @Column(name = "ubicacion")
    private String ubicacion;

    @Column(name = "cedula")
    private String cedula;

    @Column(name = "fecha_nacimiento")
    private java.time.LocalDate fechaNacimiento;

    @Column(name = "tipo_documento")
    private String tipoDocumento;

    @Column(name = "nombre_empresa")
    private String nombreEmpresa;

    @Column(name = "nit")
    private String nit;

    @Column(name = "es_empresa")
    @Builder.Default
    private Boolean esEmpresa = false;

    @Column(name = "telefono_verificado", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean telefonoVerificado = false;

    @Column(name = "cuenta_aprobada", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean cuentaAprobada = false;

    @Column(name = "cuenta_completa", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean cuentaCompleta = false;

    @Column(name = "estado_cuenta")
    @Builder.Default
    private String estadoCuenta = "PENDIENTE_EMAIL";

    @Column(name = "token_verificacion_email")
    private String tokenVerificacionEmail;

    @Column(name = "token_email_expira")
    private LocalDateTime tokenEmailExpira;

    @Column(name = "token_verificacion_telefono")
    private String tokenVerificacionTelefono;

    @Column(name = "token_telefono_expira")
    private LocalDateTime tokenTelefonoExpira;

    @Column(name = "token_recuperacion_password")
    private String tokenRecuperacionPassword;

    @Column(name = "token_recuperacion_expira")
    private LocalDateTime tokenRecuperacionExpira;

    @Column(name = "cuenta_bancaria")
    private String cuentaBancaria;

    @Column(name = "cupon_primer_envio_usado", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean cuponPrimerEnvioUsado = false;

    @Column(name = "divisa_preferida")
    @Builder.Default
    private String divisaPreferida = "COP";

    @Column(name = "departamento")
    private String departamento;

    @Column(name = "ciudad")
    private String ciudad;

    @Column(name = "direccion_completa")
    private String direccionCompleta;

    @Column(name = "referencia")
    private String referencia;

    @Column(name = "codigo_postal")
    private String codigoPostal;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(name = "calificacion_promedio")
    @Builder.Default
    private Double calificacionPromedio = 0.0;

    @Column(name = "total_resenas")
    @Builder.Default
    private Integer totalResenas = 0;

    // Helper alias methods for email and password
    public String getEmail() {
        return this.correo;
    }
    public void setEmail(String email) {
        this.correo = email;
    }
    public String getPasswordHash() {
        return this.contrasena;
    }
    public void setPasswordHash(String passwordHash) {
        this.contrasena = passwordHash;
    }

    // Explicit setter to satisfy IDE / LSP when Lombok annotation processing is unavailable
    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public boolean isAprobado() {
        return this.aprobado;
    }

    public void setAprobado(boolean aprobado) {
        this.aprobado = aprobado;
    }

    public boolean isTotpEnabled() {
        return this.totpEnabled;
    }

    public void setTotpEnabled(boolean totpEnabled) {
        this.totpEnabled = totpEnabled;
    }

    public String getTotpSecret() {
        return this.totpSecret;
    }

    public void setTotpSecret(String totpSecret) {
        this.totpSecret = totpSecret;
    }

    public String getFoto() {
        return this.foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }

    public String getProveedor() {
        return this.proveedor;
    }

    public void setProveedor(String proveedor) {
        this.proveedor = proveedor;
    }

    public String getGoogleId() {
        return this.googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public boolean isEmailVerificado() {
        return this.emailVerificado;
    }

    public void setEmailVerificado(boolean emailVerificado) {
        this.emailVerificado = emailVerificado;
    }

    // Explicit getters to reduce IDE diagnostics when Lombok isn't initialized
    public Long getId() {
        return this.id;
    }

    public String getCorreo() {
        return this.correo;
    }

    public String getNombre() {
        return this.nombre;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public void setTokenRecuperacionPassword(String token) {
        this.tokenRecuperacionPassword = token;
    }

    public void setTokenRecuperacionExpira(LocalDateTime expira) {
        this.tokenRecuperacionExpira = expira;
    }
    
    public LocalDateTime getTokenRecuperacionExpira() {
        return this.tokenRecuperacionExpira;
    }
    
    public String getTokenRecuperacionPassword() {
        return this.tokenRecuperacionPassword;
    }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getDireccionCompleta() { return direccionCompleta; }
    public void setDireccionCompleta(String direccionCompleta) { this.direccionCompleta = direccionCompleta; }
    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }
    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }
}
