package com.agromarket.application.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarUsuarioRequest {
    private String nombre;
    private String apellido;
    private String telefono;
    private String codigoPais;
    private String ubicacion;
    private String cedula;
    private LocalDate fechaNacimiento;
    private String tipoDocumento;
    private String nombreEmpresa;
    private String nit;
    private String fotoUrl;
    private String divisaPreferida;
    private String departamento;
    private String ciudad;
    private String direccionCompleta;
    private String referencia;
    private String codigoPostal;
}
