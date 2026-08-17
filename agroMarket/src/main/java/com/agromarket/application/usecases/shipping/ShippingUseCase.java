// application/usecases/shipping/ShippingUseCase.java
package com.agromarket.application.usecases.shipping;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.exceptions.order.OrderNotFoundException;
import com.agromarket.domain.exceptions.shipping.InvalidShippingStateException;
import com.agromarket.domain.exceptions.shipping.ShippingNotFoundException;
import com.agromarket.domain.models.enums.shipping.ShippingState;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.shipping.Shipping;
import com.agromarket.domain.ports.in.shipping.ShippingPort;
import com.agromarket.domain.ports.in.shipping.ShippingResult;
import com.agromarket.domain.ports.out.order.OrderPort;
import com.agromarket.domain.services.shipping.ShippingService;

@Service
public class ShippingUseCase implements ShippingPort {

        private final com.agromarket.domain.ports.out.shipping.ShippingPort shippingRepository;
        private final OrderPort orderRepository;
        private final ShippingService shippingService;

        public ShippingUseCase(
                        com.agromarket.domain.ports.out.shipping.ShippingPort shippingRepository,
                        OrderPort orderRepository,
                        ShippingService shippingService) {

                this.shippingRepository = shippingRepository;
                this.orderRepository = orderRepository;
                this.shippingService = shippingService;
        }

        @Override
        @Transactional
        public ShippingResult createShipping(
                        Long orderId) {

                Order order = orderRepository
                                .findById(orderId)
                                .orElseThrow(() -> new OrderNotFoundException(
                                                "Pedido no encontrado: " + orderId));

                if (order.getBuyer() == null
                                || order.getProduct() == null) {

                        throw new IllegalArgumentException(
                                        "El pedido debe tener comprador y producto");
                }

                Shipping shipping = Shipping.builder()
                                .order(order)
                                .destinationAddress(
                                                order.getBuyer().getLocation())
                                .state(ShippingState.ORDER_CONFIRMED)
                                .createdAt(LocalDateTime.now())
                                .build();

                return toResult(
                                shippingRepository.save(shipping));
        }

        @Override
        @Transactional(readOnly = true)
        public ShippingResult getById(
                        Long id) {

                return toResult(findShipping(id));
        }

        @Override
        @Transactional(readOnly = true)
        public ShippingResult getByOrderId(
                        Long orderId) {

                Shipping shipping = shippingRepository
                                .findByOrderId(orderId)
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new ShippingNotFoundException(
                                                "No existe envío para el pedido: "
                                                                + orderId));

                return toResult(shipping);
        }

        @Override
        @Transactional
        public ShippingResult advanceState(
                        Long shippingId) {

                Shipping shipping = findShipping(shippingId);

                if (!shippingService.canAdvance(shipping)) {

                        throw new InvalidShippingStateException(
                                        "El envío no puede avanzar desde el estado actual");
                }

                shipping.advanceState();

                return toResult(
                                shippingRepository.save(shipping));
        }

        @Override
        @Transactional
        public ShippingResult cancel(
                        Long shippingId) {

                Shipping shipping = findShipping(shippingId);

                if (!shippingService.canCancel(shipping)) {

                        throw new InvalidShippingStateException(
                                        "El envío no puede cancelarse desde el estado actual");
                }

                shipping.cancel();

                return toResult(
                                shippingRepository.save(shipping));
        }

        @Override
        @Transactional(readOnly = true)
        public List<ShippingResult> getAll() {

                return shippingRepository
                                .findAll()
                                .stream()
                                .map(this::toResult)
                                .toList();
        }

        private Shipping findShipping(
                        Long id) {

                return shippingRepository
                                .findById(id)
                                .orElseThrow(() -> new ShippingNotFoundException(
                                                "Envío no encontrado: " + id));
        }

        private ShippingResult toResult(
                        Shipping shipping) {

                return ShippingResult.fromDomain(shipping);
        }
}