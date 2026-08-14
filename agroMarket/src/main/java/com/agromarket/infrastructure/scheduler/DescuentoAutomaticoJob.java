package com.agromarket.infrastructure.scheduler;

import com.agromarket.infrastructure.persistence.sql.entities.ProductEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.ProductJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Trabajo programado para aplicar descuentos automáticos a productos menos vendidos.
 * Ejecuta periódicamente para identificar productos con bajas ventas y aplicarles descuentos,
 * y para expirar promociones que han finalizado.
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DescuentoAutomaticoJob {

    private final ProductJpaRepository productRepository;

    /**
     * Aplica descuento automático a los productos menos vendidos.
     * Ejecuta cada 3 días a las 11pm.
     */
    @Scheduled(cron = "0 0 23 */3 * *")
    @Transactional
    public void applyDiscountToLeastSoldProducts() {
        long count = productRepository.countActive();
        if (count == 0) {
            log.info("No hay productos activos para aplicar descuento automático");
            return;
        }

        int limit = (int) (count * 0.20);
        if (limit == 0) {
            limit = 1; // aplicar al menos a 1 producto
        }

        List<ProductEntity> leastSold = productRepository.findLeastSold(PageRequest.of(0, limit));

        for (ProductEntity p : leastSold) {
            if (!p.isOnPromotion()) {
                p.setOnPromotion(true);
                // 60% descuento significa que el precio promocional es el 40% del precio original
                BigDecimal promotionPrice = p.getPrice().multiply(new BigDecimal("0.40"));
                p.setPromotionPrice(promotionPrice);
                p.setPromotionEndDate(LocalDateTime.now().plusDays(3));
                productRepository.save(p);
            }
        }
        log.info("Descuento aplicado a {} productos menos vendidos", leastSold.size());
    }

    /**
     * Expira promociones que han finalizado.
     * Ejecuta cada hora.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expirePromotions() {
        List<ProductEntity> expired = productRepository.findByOnPromotionTrueAndPromotionEndDateBefore(LocalDateTime.now());
        for (ProductEntity p : expired) {
            p.setOnPromotion(false);
            p.setPromotionPrice(null);
            p.setPromotionEndDate(null);
            productRepository.save(p);
        }
        log.info("Se expiraron {} promociones vencidas", expired.size());
    }
}
