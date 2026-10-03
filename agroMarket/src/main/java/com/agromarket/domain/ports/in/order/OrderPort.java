package com.agromarket.domain.ports.in.order;
import java.util.List;
public interface OrderPort {
    OrderResult createOrder(CreateOrderCommand command);
    OrderResult getOrderById(Long id);
    List<OrderResult> getAllOrders();
    List<OrderResult> getOrdersByBuyer(Long buyerId);
    List<OrderResult> getOrdersByProducer(Long producerId);
    void advanceOrderState(Long orderId);
    void cancelOrder(Long orderId);

    /**
     * Actualiza el estado de un pedido a uno concreto validando la
     * transición. Lo usa el productor desde su dashboard para marcar el
     * pedido como Enviado/Entregado (y el sistema para cancelar).
     *
     * @param orderId  identificador del pedido
     * @param newState nuevo estado deseado
     * @return el pedido actualizado
     */
    OrderResult updateOrderState(
            Long orderId,
            com.agromarket.domain.models.enums.order.OrderState newState);
    void deleteOrder(Long id);
}
