package com.agromarket.application.dto.shared;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clase genérica para respuestas paginadas.
 * Proporciona información sobre la página actual, tamaño, elementos totales y páginas totales.
 * 
 * @param <T> tipo de los elementos en la página
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    
    /**
     * Contenido de la página actual.
     */
    private List<T> content;
    
    /**
     * Número de la página actual (0-indexed).
     */
    private int page;
    
    /**
     * Tamaño de la página (número de elementos por página).
     */
    private int size;
    
    /**
     * Número total de elementos en todos los resultados.
     */
    private long totalElements;
    
    /**
     * Número total de páginas.
     */
    private int totalPages;
}
