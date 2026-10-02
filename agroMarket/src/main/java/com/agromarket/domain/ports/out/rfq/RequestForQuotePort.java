package com.agromarket.domain.ports.out.rfq;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.rfq.RequestForQuote;;

/**
 * Puerto de salida que define el contrato para la persistencia de solicitudes de cotización.
 * Este puerto permite gestionar el ciclo de vida de las solicitudes de cotización
 * sin depender de detalles de implementación.
 * 
 * @author AgroMarket Team
 */
public interface RequestForQuotePort {
    
    /**
     * Guarda una solicitud de cotización.
     * 
     * @param requestForQuote la solicitud de cotización a guardar
     * @return la solicitud de cotización guardada
     */
    RequestForQuote save(RequestForQuote requestForQuote);
    
    /**
     * Busca una solicitud de cotización por su ID.
     * 
     * @param id el ID de la solicitud de cotización
     * @return Optional con la solicitud de cotización si existe, vacío de lo contrario
     */
    Optional<RequestForQuote> findById(Long id);
    
    /**
     * Obtiene todas las solicitudes de cotización activas.
     * 
     * @return lista de solicitudes de cotización activas
     */
    List<RequestForQuote> findAllActive();
    
    /**
     * Busca solicitudes de cotización por ID del comprador.
     * 
     * @param buyerId el ID del comprador
     * @return lista de solicitudes de cotización del comprador
     */
    List<RequestForQuote> findByBuyerId(Long buyerId);
}
