package com.agromarket.application.usecases.product;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.agromarket.domain.exceptions.product.ProductNotFoundException;
import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.product.*;
import com.agromarket.domain.ports.out.review.ReviewPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.ports.out.product.ProductPort;
import com.agromarket.domain.services.product.ProductStockService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductUseCase implements com.agromarket.domain.ports.in.product.ProductPort {
  private final ProductPort productRepository;
  private final ProductStockService stockService;
  private final UserPort userPort;
  private final ReviewPort reviewPort;

  @Override
  public ProductResult createProduct(CreateProductCommand c) {
    User producer = producer(c.getProducerId());
    
    // Validar que no exista producto duplicado (mismo nombre y productor)
    productRepository.findByNameAndProducerId(c.getName(), c.getProducerId())
        .ifPresent(existing -> {
          throw new IllegalArgumentException(
              "Ya existe un producto con el nombre '" + c.getName() + "' para este productor");
        });
    
    Product p = Product.builder().name(c.getName()).description(c.getDescription()).price(c.getPrice())
        .availableQuantity(c.getAvailableQuantity())
        .imageUrl(c.getImageUrl()).minimumWholesaleQuantity(c.getMinimumWholesaleQuantity())
        .wholesalePrice(c.getWholesalePrice()).fruitType(c.getFruitType())
        .producer(producer).onPromotion(c.isOnPromotion()).promotionPrice(c.getPromotionPrice())
        .promotionEndDate(c.getPromotionEndDate()).active(true).build();
    return result(productRepository.save(p));
  }

  @Override
  public ProductResult updateProduct(Long id, UpdateProductCommand c) {
    Product p = product(id);
    p.setName(c.getName());
    p.setDescription(c.getDescription());
    p.setPrice(c.getPrice());
    p.setImageUrl(c.getImageUrl());
    p.setMinimumWholesaleQuantity(c.getMinimumWholesaleQuantity());
    p.setWholesalePrice(c.getWholesalePrice());
    p.setFruitType(c.getFruitType());
    p.setOnPromotion(c.isOnPromotion());
    p.setPromotionPrice(c.getPromotionPrice());
    p.setPromotionEndDate(c.getPromotionEndDate());
    return result(productRepository.save(p));
  }

  @Override
  @Transactional(readOnly = true)
  public ProductResult getProductById(Long id) {
    return result(product(id));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ProductResult> getAllActiveProducts() {
    return results(productRepository.findAllByActiveTrue());
  }

  @Override
  @Transactional(readOnly = true)
  public List<ProductResult> getProductsByFruitType(String fruitType) {
    return results(productRepository.findByFruitType(FruitType.valueOf(fruitType.toUpperCase())));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ProductResult> getProductsByProducer(Long producerId) {
    return results(productRepository.findByProducerId(producerId));
  }

  @Override
  public void deleteProduct(Long id) {
    Product p = product(id);
    p.setActive(false);
    productRepository.save(p);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ProductResult> searchProducts(String query) {
    return results(productRepository.searchByNameOrDescription(query));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ProductResult> getProductsOnPromotion() {
    return results(productRepository.findByOnPromotionTrue());
  }

  @Override
  public ProductResult updateProductStock(Long id, UpdateProductStockCommand c) {
    Product p = product(id);
    int current = p.getAvailableQuantity() == null ? 0 : p.getAvailableQuantity();
    int target = c.getAvailableQuantity();
    if (target > current)
      stockService.increase(p, target - current);
    else if (target < current)
      stockService.decrease(p, current - target);
    return result(productRepository.save(p));
  }

  @Override
  public java.util.Optional<Product> findByNameAndProducerId(String name, Long producerId) {
    return productRepository.findByNameAndProducerId(name, producerId);
  }

  private User producer(Long id) {
    User u = userPort.findById(id).orElseThrow(() -> new ProductNotFoundException("Productor no encontrado: " + id));
    if (!u.isProducer())
      throw new ProductNotFoundException("El usuario no tiene rol PRODUCER: " + id);
    return u;
  }

  private Product product(Long id) {
    return productRepository.findById(id)
        .orElseThrow(() -> new ProductNotFoundException("Producto no encontrado: " + id));
  }

  private ProductResult result(Product p) {
    var reviews = reviewPort.findByProductId(p.getId());
    return ProductResult.builder().product(p).averageRating(p.calculateAverageRating(reviews))
        .totalReviews(reviews.size()).build();
  }

  private List<ProductResult> results(List<Product> p) {
    return p.stream().map(this::result).collect(Collectors.toList());
  }
}