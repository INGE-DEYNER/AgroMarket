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
    void deleteOrder(Long id);
}
