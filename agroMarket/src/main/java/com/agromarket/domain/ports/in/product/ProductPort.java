package com.agromarket.domain.ports.in.product;

import java.util.List;

public interface ProductPort {
    ProductResult createProduct(CreateProductCommand command);

    ProductResult updateProduct(Long id, UpdateProductCommand command);

    ProductResult getProductById(Long id);

    List<ProductResult> getAllActiveProducts();

    List<ProductResult> getProductsByFruitType(String fruitType);

    List<ProductResult> getProductsByProducer(Long producerId);

    void deleteProduct(Long id);

    List<ProductResult> searchProducts(String query);

    List<ProductResult> getProductsOnPromotion();

    ProductResult updateProductStock(Long productId, UpdateProductStockCommand command);
}