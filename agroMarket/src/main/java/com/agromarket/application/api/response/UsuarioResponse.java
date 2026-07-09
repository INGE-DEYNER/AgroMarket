package com.agromarket.application.api.response;

import com.agromarket.domain.models.enums.RolUsuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String correo;
    private String telefono;
    private RolUsuario rol;
    private boolean activo;
    private boolean aprobado;
    private boolean twoFactorEnabled;
    private String ubicacion;
    private boolean emailVerificado;
    private String proveedor;
    private String idEncriptado;
    private boolean verificado;
    private String apellido;
    private String cedula;
    private java.time.LocalDate fechaNacimiento;
    private String tipoDocumento;
    private String nombreEmpresa;
    private String nit;
    private Boolean esEmpresa;
    private boolean cuentaCompleta;
    private String estadoCuenta;
    private String codigoPais;
    private String fotoUrl;
    private Boolean cuponPrimerEnvioUsado;
    private String divisaPreferida;
    private String departamento;
    private String ciudad;
    private String direccionCompleta;
    private String referencia;
    private String codigoPostal;
}
