package com.agromarket.application.usecases.admin;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.repositories.order.ReturnRequestJpaRepository;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.enums.order.ReturnStatus;
import com.agromarket.domain.models.enums.payment.PaymentState;
import com.agromarket.domain.models.enums.shipping.ShippingState;
import com.agromarket.domain.ports.in.order.OrderPort;
import com.agromarket.domain.ports.in.order.OrderResult;
import com.agromarket.domain.ports.in.payment.PaymentPort;
import com.agromarket.domain.ports.in.payment.PaymentResult;
import com.agromarket.domain.ports.in.shipping.ShippingPort;
import com.agromarket.domain.ports.in.shipping.ShippingResult;

import lombok.RequiredArgsConstructor;

/**
 * Reportes administrativos calculados sobre datos reales.
 *
 * <p>
 * Todas las cifras provienen de MySQL (pedidos, pagos, envíos,
 * devoluciones) a través de los puertos y repositorios ya existentes. No hay
 * valores inventados ni constantes de ejemplo.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AdminReportsUseCase {

    private static final String[] NOMBRES_MES = { "Ene", "Feb", "Mar", "Abr",
            "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };

    /** Estados de pedido que cuentan como ingreso (no cancelados). */
    private static final List<OrderState> BILLABLE_STATES = List.of(
            OrderState.PENDING,
            OrderState.ACCEPTED,
            OrderState.SHIPPED,
            OrderState.DELIVERED);

    private final OrderPort orderPort;
    private final PaymentPort paymentPort;
    private final ShippingPort shippingPort;
    private final ReturnRequestJpaRepository returns;

    // =====================================================================
    // HELPERS COMPARTIDOS
    // =====================================================================

    private BigDecimal sumarMontos(List<BigDecimal> montos) {
        return montos.stream()
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal totalOf(OrderResult pedido) {
        return pedido.getTotal() == null ? BigDecimal.ZERO : pedido.getTotal();
    }

    private List<OrderResult> billableOrders() {
        return orderPort.getAllOrders().stream()
                .filter(order -> order.getState() != null
                        && BILLABLE_STATES.contains(order.getState()))
                .toList();
    }

    // =====================================================================
    // 1. FINANZAS
    // =====================================================================

    /** Reporte financiero: ingresos, ticket promedio y ventas por mes. */
    @Transactional(readOnly = true)
    public Map<String, Object> finance() {

        List<OrderResult> pedidos = orderPort.getAllOrders();
        List<OrderResult> validos = billableOrders();

        BigDecimal ingresosTotales = sumarMontos(
                validos.stream().map(this::totalOf).toList());

        BigDecimal ticketPromedio = validos.isEmpty()
                ? BigDecimal.ZERO
                : ingresosTotales.divide(
                        BigDecimal.valueOf(validos.size()), 2, RoundingMode.HALF_UP);

        YearMonth mesActual = YearMonth.now();

        BigDecimal ingresosMesActual = sumarMontos(
                validos.stream()
                        .filter(order -> order.getCreatedAt() != null
                                && YearMonth.from(order.getCreatedAt()).equals(mesActual))
                        .map(this::totalOf)
                        .toList());

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalOrders", pedidos.size());
        report.put("billableOrders", validos.size());
        report.put("cancelledOrders", pedidos.size() - validos.size());
        report.put("totalRevenue", ingresosTotales);
        report.put("averageTicket", ticketPromedio);
        report.put("currentMonthRevenue", ingresosMesActual);
        report.put("monthlyRevenue", monthlyRevenue(validos));
        report.put("ordersByState", ordersByState(pedidos));
        return report;
    }

    private List<Map<String, Object>> monthlyRevenue(List<OrderResult> pedidos) {

        Map<YearMonth, BigDecimal> porMes = new TreeMap<>();
        YearMonth mesActual = YearMonth.now();

        for (int i = 11; i >= 0; i--) {
            porMes.put(mesActual.minusMonths(i), BigDecimal.ZERO);
        }

        for (OrderResult pedido : pedidos) {
            if (pedido.getCreatedAt() != null) {
                porMes.merge(YearMonth.from(pedido.getCreatedAt()),
                        totalOf(pedido), BigDecimal::add);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        porMes.forEach((mes, total) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("period", mes.toString());
            row.put("label", NOMBRES_MES[mes.getMonthValue() - 1] + " " + mes.getYear());
            row.put("revenue", total);
            result.add(row);
        });

        return result;
    }

    // =====================================================================
    // 2. PEDIDOS POR ESTADO
    // =====================================================================

    @Transactional(readOnly = true)
    public Map<String, Object> ordersByStateReport() {

        List<OrderResult> pedidos = orderPort.getAllOrders();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("total", pedidos.size());
        report.put("byState", ordersByState(pedidos));
        return report;
    }

    private List<Map<String, Object>> ordersByState(List<OrderResult> pedidos) {

        Map<OrderState, Long> conteo = new EnumMap<>(OrderState.class);

        for (OrderState state : OrderState.values()) {
            conteo.put(state, 0L);
        }

        for (OrderResult pedido : pedidos) {
            if (pedido.getState() != null) {
                conteo.merge(pedido.getState(), 1L, Long::sum);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        conteo.forEach((state, count) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("state", state.name());
            row.put("count", count);
            result.add(row);
        });

        return result;
    }

    // =====================================================================
    // 3. PAGOS
    // =====================================================================

    /**
     * Reporte de pagos: conteo, monto por cada estado del enum de dominio.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> paymentsReport() {

        List<Map<String, Object>> byState = new ArrayList<>();
        long total = 0;
        BigDecimal montoTotal = BigDecimal.ZERO;
        BigDecimal montoConfirmado = BigDecimal.ZERO;

        for (PaymentState state : PaymentState.values()) {

            List<PaymentResult> pagos = paymentPort.getByState(state);

            BigDecimal monto = sumarMontos(
                    pagos.stream().map(PaymentResult::getAmount).toList());

            total += pagos.size();
            montoTotal = montoTotal.add(monto);

            if (state == PaymentState.CONFIRMED || state == PaymentState.IN_ESCROW) {
                montoConfirmado = montoConfirmado.add(monto);
            }

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("state", state.name());
            row.put("count", pagos.size());
            row.put("amount", monto);
            byState.add(row);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalPayments", total);
        report.put("totalAmount", montoTotal);
        report.put("confirmedAmount", montoConfirmado);
        report.put("byState", byState);
        return report;
    }
}