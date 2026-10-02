package com.agromarket.domain.ports.out.shipping;


import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.shipping.Shipping;

/**
 * Puerto de salida que define el contrato para la persistencia de envíos.
 * Este puerto permite gestionar el ciclo de vida de los envíos
 * sin depender de detalles de implementación.
 * 
 * @author AgroMarket Team
 */
public interface ShippingPort {
    
    /**
     * Busca envíos por ID de pedido.
     * 
     * @param orderId el ID del pedido
     * @return lista de envíos asociados al pedido
     */
    List<Shipping> findByOrderId(Long orderId);
    
    /**
     * Busca un envío por su ID.
     * 
     * @param id el ID del envío
     * @return Optional con el envío si existe, vacío de lo contrario
     */
    Optional<Shipping> findById(Long id);
    
    /**
     * Guarda un envío.
     * 
     * @param shipping el envío a guardar
     * @return el envío guardado
     */
    Shipping save(Shipping shipping);
    
    /**
     * Obtiene todos los envíos.
     * 
     * @return lista de todos los envíos
     */
    List<Shipping> findAll();
    
    /**
     * Busca envíos por ID del comprador.
     * 
     * @param buyerId el ID del comprador
     * @return lista de envíos del comprador
     */
    List<Shipping> findByBuyerId(Long buyerId);
    
    /**
     * Busca envíos por ID del productor.
     * 
     * @param producerId el ID del productor
     * @return lista de envíos del productor
     */
    List<Shipping> findByProducerId(Long producerId);
}
