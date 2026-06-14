package com.agromarket.infrastructure.scheduler;

import com.agromarket.infrastructure.persistence.entity.ProductoEntity;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DescuentoAutomaticoJob {

    private final ProductoJpaRepository productoRepository;

    // Ejecutar a las 11pm cada 3 días
    @Scheduled(cron = "0 0 23 */3 * *")
    @Transactional
    public void aplicarDescuentoProductosMenosVendidos() {
        long count = productoRepository.countActivos();
        if (count == 0) {
            log.info("No hay productos activos para aplicar descuento automático");
            return;
        }

        int limite = (int) (count * 0.20);
        if (limite == 0) {
            limite = 1; // aplicar al menos a 1 producto
        }

        List<ProductoEntity> menosVendidos = productoRepository.findMenosVendidos(PageRequest.of(0, limite));

        for (ProductoEntity p : menosVendidos) {
            if (!p.isEnPromocion()) {
                p.setEnPromocion(true);
                // 60% descuento significa que el precio promocional es el 40% del precio original
                BigDecimal precioPromocion = p.getPrecio().multiply(new BigDecimal("0.40"));
                p.setPrecioPromocion(precioPromocion);
                p.setFechaFinPromocion(LocalDateTime.now().plusDays(3));
                productoRepository.save(p);
            }
        }
        log.info("Descuento aplicado a {} productos menos vendidos", menosVendidos.size());
    }
}
