package com.agromarket.application.usecases.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.api.response.admin.AdminDashboardResponse;
import com.agromarket.application.adapters.api.response.admin.IngresosMesResponse;
import com.agromarket.application.adapters.api.response.admin.TopProductorResponse;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.order.OrderPort;
import com.agromarket.domain.ports.in.order.OrderResult;
import com.agromarket.domain.ports.in.product.ProductPort;
import com.agromarket.domain.ports.in.product.ProductResult;
import com.agromarket.domain.ports.in.user.UserPort;
import com.agromarket.domain.ports.in.user.UserResult;

import lombok.RequiredArgsConstructor;

/**
 * Caso de uso que agrega los datos del dashboard administrativo.
 *
 * CAUSA RAÍZ del panel Admin vacío: el frontend llama a
 * /admin/dashboard, /admin/usuarios-pendientes, etc., pero el backend no
 * exponía ninguno de esos endpoints (solo existía /api/v1/admins con
 * operaciones sobre la entidad Admin). Este servicio compone la
 * información a partir de los puertos de dominio ya existentes.
 */
@Service
@RequiredArgsConstructor
public class AdminDashboardUseCase {

        private static final String[] NOMBRES_MES = { "Ene", "Feb", "Mar",
                        "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct",
                        "Nov", "Dic" };

        private final UserPort userPort;
        private final ProductPort productPort;
        private final OrderPort orderPort;

        @Transactional(readOnly = true)
        public AdminDashboardResponse construir() {

                List<UserResult> usuarios = userPort.getAll();
                List<ProductResult> productos = productPort.getAllActiveProducts();
                List<OrderResult> pedidos = orderPort.getAllOrders();

                LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
                LocalDateTime hace30Dias = LocalDate.now().minusDays(30)
                                .atStartOfDay();

                long productores = usuarios.stream()
                                .filter(u -> u.getRole() == Role.PRODUCER)
                                .count();

                long nuevosUsuarios = usuarios.stream()
                                .filter(u -> u.getRegistrationDate() != null
                                                && u.getRegistrationDate().isAfter(hace30Dias))
                                .count();

                long nuevosProductores = usuarios.stream()
                                .filter(u -> u.getRole() == Role.PRODUCER)
                                .filter(u -> u.getRegistrationDate() != null
                                                && u.getRegistrationDate().isAfter(hace30Dias))
                                .count();

                // Solo cuentan para ingresos los pedidos no cancelados.
                List<OrderResult> pedidosValidos = pedidos.stream()
                                .filter(p -> p.getState() != OrderState.CANCELLED)
                                .toList();

                BigDecimal ingresos = sumar(pedidosValidos.stream()
                                .map(OrderResult::getTotal)
                                .toList());

                BigDecimal ventasHoy = sumar(pedidosValidos.stream()
                                .filter(p -> p.getCreatedAt() != null
                                                && !p.getCreatedAt().isBefore(inicioHoy))
                                .map(OrderResult::getTotal)
                                .toList());

                return new AdminDashboardResponse(
                                usuarios.size(),
                                productores,
                                productos.size(),
                                pedidos.size(),
                                ingresos,
                                contarEstado(pedidos, OrderState.DELIVERED),
                                contarEstado(pedidos, OrderState.SHIPPED),
                                contarEstado(pedidos, OrderState.PENDING),
                                contarEstado(pedidos, OrderState.CANCELLED),
                                ventasHoy,
                                nuevosUsuarios,
                                nuevosProductores,
                                calcularTopProductores(pedidosValidos),
                                calcularIngresosPorMes(pedidosValidos));
        }

        private List<TopProductorResponse> calcularTopProductores(
                        List<OrderResult> pedidos) {

                Map<Long, BigDecimal> ventas = new LinkedHashMap<>();
                Map<Long, Long> cantidadPedidos = new LinkedHashMap<>();
                Map<Long, String> nombres = new LinkedHashMap<>();

                for (OrderResult pedido : pedidos) {
                        Product producto = pedido.getProduct();

                        if (producto == null || producto.getProducer() == null) {
                                continue;
                        }

                        User productor = producto.getProducer();
                        Long id = productor.getId();

                        nombres.putIfAbsent(id, construirNombre(productor));
                        ventas.merge(id,
                                        pedido.getTotal() == null ? BigDecimal.ZERO
                                                        : pedido.getTotal(),
                                        BigDecimal::add);
                        cantidadPedidos.merge(id, 1L, Long::sum);
                }

                List<Map.Entry<Long, BigDecimal>> ordenadas = new ArrayList<>(
                                ventas.entrySet());
                ordenadas.sort((a, b) -> b.getValue().compareTo(a.getValue()));

                List<TopProductorResponse> top = new ArrayList<>();

                for (Map.Entry<Long, BigDecimal> entrada : ordenadas) {
                        if (top.size() >= 5) {
                                break;
                        }

                        Long id = entrada.getKey();

                        top.add(new TopProductorResponse(
                                        id,
                                        nombres.get(id),
                                        cantidadPedidos.getOrDefault(id, 0L),
                                        entrada.getValue()));
                }

                return top;
        }

        private List<IngresosMesResponse> calcularIngresosPorMes(
                        List<OrderResult> pedidos) {

                YearMonth mesActual = YearMonth.now();
                Map<YearMonth, BigDecimal> ingresosPorMes = new LinkedHashMap<>();

                for (int i = 5; i >= 0; i--) {
                        ingresosPorMes.put(mesActual.minusMonths(i),
                                        BigDecimal.ZERO);
                }

                for (OrderResult pedido : pedidos) {
                        if (pedido.getCreatedAt() == null) {
                                continue;
                        }

                        YearMonth mes = YearMonth.from(pedido.getCreatedAt());

                        if (ingresosPorMes.containsKey(mes)) {
                                ingresosPorMes.merge(mes,
                                                pedido.getTotal() == null
                                                                ? BigDecimal.ZERO
                                                                : pedido.getTotal(),
                                                BigDecimal::add);
                        }
                }

                return ingresosPorMes.entrySet().stream()
                                .map(e -> new IngresosMesResponse(
                                                e.getKey().toString(),
                                                NOMBRES_MES[e.getKey()
                                                                .getMonthValue() - 1]
                                                                + " "
                                                                + e.getKey().getYear(),
                                                e.getValue()))
                                .toList();
        }

        private long contarEstado(List<OrderResult> pedidos, OrderState estado) {
                return pedidos.stream()
                                .filter(p -> p.getState() == estado)
                                .count();
        }

        private BigDecimal sumar(List<BigDecimal> montos) {
                return montos.stream()
                                .filter(Objects::nonNull)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        private String construirNombre(User usuario) {
                String nombre = usuario.getFirstName() == null ? ""
                                : usuario.getFirstName().trim();
                String apellido = usuario.getLastName() == null ? ""
                                : usuario.getLastName().trim();

                return (nombre + " " + apellido).trim();
        }
}