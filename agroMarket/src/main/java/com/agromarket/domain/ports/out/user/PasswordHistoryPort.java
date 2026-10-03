package com.agromarket.domain.ports.out.user;


import java.util.List;

import com.agromarket.domain.models.user.PasswordHistory;

/**
 * Puerto de salida que define el contrato para la persistencia del historial de contraseñas.
 * Este puerto permite gestionar el historial de contraseñas de los usuarios para prevenir
 * el reuso de contraseñas antiguas y mejorar la seguridad.
 * 
 * @author AgroMarket Team
 */
public interface PasswordHistoryPort {
    
    /**
     * Guarda un registro en el historial de contraseñas.
     * 
     * @param passwordHistory registro de historial a guardar
     * @return registro guardado
     */
    PasswordHistory save(PasswordHistory passwordHistory);
    
    /**
     * Busca el historial de contraseñas de un usuario.
     * 
     * @param userId ID del usuario
     * @return lista de registros de historial de contraseñas
     */
    List<PasswordHistory> findByUserId(Long userId);
    
    /**
     * Verifica si una contraseña ha sido usada anteriormente por el usuario.
     * 
     * @param userId ID del usuario
     * @param password contraseña a verificar (ya hasheada)
     * @return true si la contraseña ha sido usada antes, false de lo contrario
     */
    boolean hasUsedPasswordBefore(Long userId, String password);
}
