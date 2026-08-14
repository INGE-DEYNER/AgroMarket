package com.agromarket.application.dto.shared;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clase que representa una respuesta de error de la API.
 * Contiene información detallada sobre el error ocurrido, incluyendo código de estado,
 * mensajes y errores de validación de campos.
 * 
 * <p>Todos los mensajes visibles para el usuario final están en español.</p>
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    /**
     * Código de estado HTTP del error.
     */
    private int status;
    
    /**
     * Código de error (en inglés, para uso interno).
     */
    private String error;
    
    /**
     * Mensaje de error (en español, para el usuario final).
     */
    private String message;
    
    /**
     * Mensaje de error alternativo (en español).
     */
    private String mensaje;
    
    /**
     * Fecha y hora en que ocurrió el error.
     */
    private LocalDateTime timestamp;
    
    /**
     * Ruta de la API donde ocurrió el error.
     */
    private String path;
    
    /**
     * Lista de errores de validación de campos.
     */
    private List<String> fieldErrors;
    
    /**
     * Mapa con errores específicos por campo.
     */
    private Map<String, String> campos;
}
