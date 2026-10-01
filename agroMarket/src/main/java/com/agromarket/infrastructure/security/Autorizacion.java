package com.agromarket.infrastructure.security;

import java.util.Arrays;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Comprobacion de propietario para recursos que se piden por id.
 *
 * <p>Sin esto, cambiar el id en la URL devuelve el recurso de otra persona:
 * con cualquier token valido, {@code GET /api/v1/orders/15} respondia con el
 * pedido de otro usuario, y {@code DELETE /api/v1/orders/15} lo borraba.
 *
 * <p>El patron no es nuevo: ya se usaba en
 * {@code OrderController.updateEstado} y en devoluciones y RFQ. Lo que faltaba
 * era aplicarlo en el resto de endpoints, y por eso se centraliza aqui para
 * que no dependa de que cada controlador se acuerde.
 *
 * <p>Todos los metodos de recurso individual deben pasar por aqui. Un
 * administrador siempre pasa; un usuario normal solo si es el dueno.
 */
public final class Autorizacion {

    private Autorizacion() {
    }

    /** true si el principal es administrador. */
    public static boolean esAdmin(JwtUserPrincipal principal) {
        return principal != null && "ADMIN".equalsIgnoreCase(principal.getRole());
    }

    /**
     * Indica si el principal puede operar sobre el recurso.
     *
     * @param principal  usuario autenticado; si es null, no puede
     * @param duenos     ids de los Proprietarios legitimos del recurso. Un
     *                   recurso puede tener mas de uno: un pedido pertenece al
     *                   comprador y al productor.
     */
    public static boolean esDueñoOAdmin(
            JwtUserPrincipal principal,
            Long... duenos) {

        if (esAdmin(principal)) {
            return true;
        }
        if (principal == null || principal.getUserId() == null) {
            return false;
        }
        if (duenos == null) {
            return false;
        }
        return Arrays.stream(duenos)
                .anyMatch(d -> d != null && d.equals(principal.getUserId()));
    }

    /**
     * Dueños legitimos de un pedido: el comprador y el/los productores.
     *
     * <p>El productor no esta en el pedido directamente: vive en
     * {@code items[].product.producer}. Un pedido puede traer productos de
     * varios productores, asi que se recogen todos.
     *
     * <p>Los tres controladores (pedidos, facturas, pagos y envios) necesitan
     * la misma comprobacion; centralizarla aqui evita que cada uno assuma una
     * forma de la estructura que no es la real.
     */
    public static Long[] duenosDePedido(
            com.agromarket.domain.models.order.Order pedido) {

        if (pedido == null) {
            return new Long[0];
        }
        java.util.List<Long> duenos = new java.util.ArrayList<>();
        if (pedido.getBuyer() != null && pedido.getBuyer().getId() != null) {
            duenos.add(pedido.getBuyer().getId());
        }
        if (pedido.getItems() != null) {
            pedido.getItems().stream()
                    .filter(java.util.Objects::nonNull)
                    .map(com.agromarket.domain.models.order.OrderItem::getProduct)
                    .filter(java.util.Objects::nonNull)
                    .map(com.agromarket.domain.models.product.Product::getProducer)
                    .filter(java.util.Objects::nonNull)
                    .map(com.agromarket.domain.models.user.User::getId)
                    .filter(java.util.Objects::nonNull)
                    .forEach(duenos::add);
        }
        return duenos.toArray(new Long[0]);
    }

    /**
     * Exige ser el dueno (o administrador). Si no se cumple, lanza 403.
     *
     * <p>Se responde 403 y no 404 a proposito: 404 seria lo correcto para no
     * revelar que el recurso existe, pero el proyecto ya devuelve 403 en otros
     * endpoints con comprobacion de propietario, y un 404 de "No existe"
     * invita a enumerar ids. Si mas adelante se decide ocultar la existencia,
     * el cambio se hace aqui y en ningun otro sitio.
     *
     * @param nombreRecurso nombre en el mensaje de error, para que el usuario
     *                      sepa que paso ("pedido", "factura"...)
     */
    public static void exigirDueñoOAdmin(
            JwtUserPrincipal principal,
            String nombreRecurso,
            Long... duenos) {

        if (esDueñoOAdmin(principal, duenos)) {
            return;
        }
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permiso sobre este " + nombreRecurso + ".");
    }
}