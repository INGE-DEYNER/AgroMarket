package com.agromarket.domain.ports.out.config;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Puerto de salida para la configuración dinámica de la aplicación.
 * Permite que el panel de administración cambie valores de negocio
 * (p. ej. el costo de envío) sin reiniciar el backend, y que esos valores
 * vivan en la base de datos (fuente de verdad) y no en el frontend.
 */
public interface AppConfigPort {

    /** Clave del costo de envío nacional (COP). */
    String CLAVE_COSTO_ENVIO = "costo_envio";

    /** Clave del modo mantenimiento (1 = activo, 0 = inactivo). */
    String CLAVE_MODO_MANTENIMIENTO = "modo_mantenimiento";

    /**
     * Obtiene el valor de una clave de configuración.
     *
     * @param clave la clave de configuración
     * @return Optional con el valor si existe
     */
    Optional<BigDecimal> getValor(String clave);

    /**
     * Guarda el valor de una clave de configuración.
     *
     * @param clave la clave de configuración
     * @param valor el valor a guardar
     */
    void setValor(String clave, BigDecimal valor);
}