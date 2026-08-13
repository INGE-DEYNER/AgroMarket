package com.agromarket.domain.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.RolUsuario;

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
public abstract class Usuario {
    private Long id;
    private String nombre;
    private String correo;
    private String contrasena;
    private String telefono;
    private RolUsuario rol;
    
    @Builder.Default
    private boolean activo = true;
    
    @Builder.Default
    private boolean aprobado = true;

    @Builder.Default
    private boolean totpEnabled = false;
    private String totpSecret;

    private LocalDateTime fechaRegistro;
    
    private String foto;
    private String proveedor;
    private String googleId;
    
    @Builder.Default
    private boolean emailVerificado = false;

    private String apellido;
    private String codigoPais;
    private String ubicacion;
    private String cedula;
    private LocalDate fechaNacimiento;
    private String tipoDocumento;
    private String nombreEmpresa;
    private String nit;
    
    @Builder.Default
    private Boolean esEmpresa = false;

    @Builder.Default
    private Boolean telefonoVerificado = false;
    
    @Builder.Default
    private Boolean cuentaAprobada = false;
    
    @Builder.Default
    private Boolean cuentaCompleta = false;
    
    @Builder.Default
    private String estadoCuenta = "PENDIENTE_EMAIL";

    private String tokenVerificacionEmail;
    private LocalDateTime tokenEmailExpira;
    private String tokenVerificacionTelefono;
    private LocalDateTime tokenTelefonoExpira;
    private String tokenRecuperacionPassword;
    private LocalDateTime tokenRecuperacionExpira;

    private String cuentaBancaria;
    
    @Builder.Default
    private Boolean cuponPrimerEnvioUsado = false;
    
    @Builder.Default
    private String divisaPreferida = "COP";

    private String departamento;
    private String ciudad;
    private String direccionCompleta;
    private String referencia;
    private String codigoPostal;

    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
    private LocalDateTime ultimoLogin;

    private String fotoUrl;
    
    @Builder.Default
    private Double calificacionPromedio = 0.0;
    
    @Builder.Default
    private Integer totalResenas = 0;

    public boolean estaActivo() {
        return activo;
    }
}
