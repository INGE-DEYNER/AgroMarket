package com.agromarket.domain.models.enums.user;

/**
 * Enumeración que representa los roles disponibles en el sistema AgroMarket.
 * Define los distintos tipos de usuarios y sus permisos asociados.
 * 
 * @author AgroMarket Team
 */
public enum Role {
    /**
     * Rol de comprador: usuario que adquiere productos en la plataforma.
     */
    BUYER,
    
    /**
     * Rol de productor: usuario que publica y vende productos agrícolas.
     */
    PRODUCER,
    
    /**
     * Rol de administrador: usuario con permisos totales en el sistema.
     */
    ADMIN   
}
