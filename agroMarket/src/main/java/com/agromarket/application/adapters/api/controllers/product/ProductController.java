package com.agromarket.application.adapters.api.controllers.product;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.agromarket.application.adapters.api.request.product.*;
import com.agromarket.application.adapters.api.response.product.*;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.product.*;
import com.agromarket.infrastructure.security.JwtUserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductPort productPort;

    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @Valid @RequestBody CreateProductRequest r,
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        // EL productor se obtiene del token JWT (nunca se confía en el body).
        // Si el body trae un producerId, lo ignoramos a favor del principal
        // autenticado para evitar suplantación.
        Long producerId = principal != null ? principal.getUserId() : r.getProducerId();

        CreateProductCommand command = CreateProductCommand.builder()
                .name(r.getName())
                .description(r.getDescription())
                .price(r.getPrice())
                .availableQuantity(r.getAvailableQuantity())
                .imageUrl(r.getImageUrl())
                .minimumWholesaleQuantity(r.getMinimumWholesaleQuantity())
                .wholesalePrice(r.getWholesalePrice())
                .fruitType(r.getFruitType())
                .producerId(producerId)
                .onPromotion(r.isOnPromotion())
                .promotionPrice(r.getPromotionPrice())
                .promotionEndDate(r.getPromotionEndDate())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(full(productPort.createProduct(command)));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody UpdateProductRequest r) {
        return full(productPort.updateProduct(id, update(r)));
    }

    @PatchMapping("/{id}/stock")
    public ProductResponse stock(@PathVariable Long id, @Valid @RequestBody UpdateStockRequest r) {
        return full(productPort.updateProductStock(id,
                UpdateProductStockCommand.builder().availableQuantity(r.getAvailableQuantity()).build()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productPort.deleteProduct(id);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return full(productPort.getProductById(id));
    }

    @GetMapping
    public List<ProductSummaryResponse> all() {
        return productPort.getAllActiveProducts().stream().map(x -> summary(x)).collect(Collectors.toList());
    }

    @GetMapping("/fruit/{fruitType}")
    public List<ProductSummaryResponse> fruit(@PathVariable String fruitType) {
        return productPort.getProductsByFruitType(fruitType).stream().map(x -> summary(x)).collect(Collectors.toList());
    }

    @GetMapping("/producer/{producerId}")
    public List<ProductSummaryResponse> producer(@PathVariable Long producerId) {
        return productPort.getProductsByProducer(producerId).stream().map(x -> summary(x)).collect(Collectors.toList());
    }

    /**
     * Productos del productor actualmente autenticado (usado por el
     * dashboard de productor: GET /api/v1/productos/mis-productos, alias
     * hacia esta ruta vía ApiPathAliasFilter).
     */
    @GetMapping("/mis-productos")
    public List<ProductSummaryResponse> misProductos(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return productPort.getProductsByProducer(principal.getUserId()).stream().map(x -> summary(x))
                .collect(Collectors.toList());
    }

    @GetMapping("/search")
    public List<ProductSummaryResponse> search(@RequestParam String q) {
        return productPort.searchProducts(q).stream().map(x -> summary(x)).collect(Collectors.toList());
    }

    @GetMapping("/promotions")
    public List<ProductSummaryResponse> promotions() {
        return productPort.getProductsOnPromotion().stream().map(x -> summary(x)).collect(Collectors.toList());
    }

    @GetMapping("/categorias")
    public List<String> getCategorias() {
        return Arrays.asList("BANANO", "MANGO", "PINA", "MARACUYA", "GUANABANA", "NARANJA", "COCO", "LIMON", "OTRO");
    }

    private UpdateProductCommand update(UpdateProductRequest r) {
        return UpdateProductCommand.builder().name(r.getName()).description(r.getDescription()).price(r.getPrice())
                .imageUrl(r.getImageUrl()).minimumWholesaleQuantity(r.getMinimumWholesaleQuantity())
                .wholesalePrice(r.getWholesalePrice()).fruitType(r.getFruitType()).onPromotion(r.isOnPromotion())
                .promotionPrice(r.getPromotionPrice()).promotionEndDate(r.getPromotionEndDate()).build();
    }

    private ProductResponse full(ProductResult r) {
        Product p = r.getProduct();
        return ProductResponse.builder().id(p.getId()).name(p.getName()).description(p.getDescription())
                .price(p.getPrice()).availableQuantity(p.getAvailableQuantity()).imageUrl(p.getImageUrl())
                .minimumWholesaleQuantity(p.getMinimumWholesaleQuantity()).wholesalePrice(p.getWholesalePrice())
                .fruitType(p.getFruitType()).onPromotion(p.isOnPromotion()).promotionPrice(p.getPromotionPrice())
                .promotionEndDate(p.getPromotionEndDate()).totalSold(p.getTotalSold()).active(p.isActive())
                .createdAt(p.getCreatedAt()).version(p.getVersion()).averageRating(r.getAverageRating())
                .totalReviews(r.getTotalReviews()).producer(ps(p.getProducer())).build();
    }

    private ProductSummaryResponse summary(ProductResult r) {
        Product p = r.getProduct();
        return ProductSummaryResponse.builder().id(p.getId()).name(p.getName()).price(p.getPrice())
                .availableQuantity(p.getAvailableQuantity()).imageUrl(p.getImageUrl()).fruitType(p.getFruitType())
                .onPromotion(p.isOnPromotion()).promotionPrice(p.getPromotionPrice())
                .averageRating(r.getAverageRating()).totalReviews(r.getTotalReviews()).producer(ps(p.getProducer()))
                .build();
    }

    private ProducerSummaryResponse ps(User u) {
        return u == null ? null
                : ProducerSummaryResponse.builder().id(u.getId())
                        .name(((u.getFirstName() == null ? "" : u.getFirstName()) + " "
                                + (u.getLastName() == null ? "" : u.getLastName())).trim())
                        .companyName(u.getCompanyName())
                        .averageRating(u.getAverageRating() == null ? 0 : u.getAverageRating()).build();
    }
}