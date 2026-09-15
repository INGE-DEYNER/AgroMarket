package com.agromarket.infrastructure.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.ports.out.product.ProductPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpirePromotionsJob {

    private final ProductPort productPort;

    @Scheduled(fixedDelayString = "${app.scheduler.promotions-delay-ms:300000}")
    public void expirePromotions() {

        List<Product> products = productPort.findByOnPromotionTrue();

        LocalDateTime now = LocalDateTime.now();

        int expired = 0;

        for (Product product : products) {

            if (product.getPromotionEndDate() == null) {
                continue;
            }

            if (!product.getPromotionEndDate()
                    .isAfter(now)) {

                product.endPromotion();

                productPort.save(product);

                expired++;
            }
        }

        if (expired > 0) {
            log.info(
                    "Promociones expiradas: {}",
                    expired);
        }
    }
}