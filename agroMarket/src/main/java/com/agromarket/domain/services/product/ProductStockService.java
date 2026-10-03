package com.agromarket.domain.services.product;



import com.agromarket.domain.exceptions.product.InsufficientStockException;
import com.agromarket.domain.models.product.Product;

/**
 * Servicio de dominio para operaciones de inventario.
 */
public class ProductStockService {

    /**
     * Descuenta unidades del inventario.
     *
     * @param product producto
     * @param quantity cantidad
     */
    public void decrease(Product product, int quantity) {

        validateQuantity(quantity);

        if (product == null) {
            throw new IllegalArgumentException(
                    "El producto es obligatorio"
            );
        }

        if (product.getAvailableQuantity() == null
                || product.getAvailableQuantity() < quantity) {

            throw new InsufficientStockException(
                    "No hay stock suficiente para realizar la operación"
            );
        }

        product.setAvailableQuantity(
                product.getAvailableQuantity() - quantity
        );

        int totalSold =
                product.getTotalSold() == null
                        ? 0
                        : product.getTotalSold();

        product.setTotalSold(totalSold + quantity);
    }

    /**
     * Restaura unidades al inventario.
     *
     * @param product producto
     * @param quantity cantidad
     */
    public void increase(Product product, int quantity) {

        validateQuantity(quantity);

        if (product == null) {
            throw new IllegalArgumentException(
                    "El producto es obligatorio"
            );
        }

        int currentStock =
                product.getAvailableQuantity() == null
                        ? 0
                        : product.getAvailableQuantity();

        product.setAvailableQuantity(
                currentStock + quantity
        );

        int totalSold =
                product.getTotalSold() == null
                        ? 0
                        : product.getTotalSold();

        product.setTotalSold(
                Math.max(0, totalSold - quantity)
        );
    }

    private void validateQuantity(int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero"
            );
        }
    }
}