package com.agromarket.interfaces.rest.controllers;

import java.math.BigDecimal;
import java.net.URI;

import com.agromarket.application.dto.request.product.CreateProductRequest;
import com.agromarket.application.dto.request.product.UpdateProductRequest;
import com.agromarket.application.dto.response.product.ProductResponse;
import com.agromarket.application.dto.shared.ApiResponse;
import com.agromarket.application.dto.shared.PageResponse;
import com.agromarket.application.usecases.product.ProductServiceImpl;
import com.agromarket.domain.product.enums.FruitType;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import jakarta.validation.Valid;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controlador REST para la gestión de productos.
 * Proporciona endpoints para listar, crear, actualizar y eliminar productos.
 * 
 * @author AgroMarket Team
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {
    private final ProductServiceImpl productService;

    /**
     * Obtiene todos los productos con paginación, filtrado y ordenamiento.
     * 
     * @param page página actual (0-indexed)
     * @param size tamaño de la página
     * @param search término de búsqueda
     * @param fruitType tipo de fruta a filtrar
     * @param minPrice precio mínimo
     * @param maxPrice precio máximo
     * @param sort campo por el cual ordenar
     * @param category categoría a filtrar
     * @param onPromotion si filtrar solo productos en promoción
     * @return ResponseEntity con la lista paginada de productos
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) FruitType fruitType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean onPromotion) {
        ApiResponse<PageResponse<ProductResponse>> body = ApiResponse.<PageResponse<ProductResponse>>builder()
            .success(true)
            .message("Productos listados")
            .data(productService.getAll(page, size, search, fruitType, minPrice, maxPrice, sort, category, onPromotion))
            .build();
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(30, java.util.concurrent.TimeUnit.SECONDS).cachePublic())
            .body(body);
    }

    /**
     * Obtiene todas las categorías de frutas disponibles.
     * 
     * @return ResponseEntity con la lista de categorías
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getCategories() {
        java.util.List<String> cats = java.util.Arrays.stream(FruitType.values())
                .map(Enum::name)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<java.util.List<String>>builder()
                .success(true)
                .message("Categorías listadas")
                .data(cats)
                .build());
    }

    /**
     * Obtiene un producto por su identificador.
     * 
     * @param id el identificador del producto
     * @return ResponseEntity con el producto encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Producto recuperado")
                .data(productService.getProductById(id))
                .build());
    }

    /**
     * Crea un nuevo producto.
     * Solo accesible para productores y administradores.
     * 
     * @param request la solicitud de creación del producto
     * @param principal el usuario autenticado
     * @return ResponseEntity con el producto creado
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('PRODUCER','ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody CreateProductRequest request, 
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Creating product for user {}", principal.getUserId());
        ProductResponse response = productService.create(request, principal.getUserId());
        URI location = URI.create("/api/products/" + response.getId());
        return ResponseEntity.created(location).body(ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Producto creado")
                .data(response)
                .build());
    }

    /**
     * Actualiza un producto existente.
     * Solo accesible para productores y administradores.
     * 
     * @param id el identificador del producto
     * @param request la solicitud de actualización
     * @param principal el usuario autenticado
     * @return ResponseEntity con el producto actualizado
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PRODUCER','ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable Long id, 
            @Valid @RequestBody UpdateProductRequest request, 
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Producto actualizado")
                .data(productService.update(id, request, principal.getUserId()))
                .build());
    }

    /**
     * Elimina un producto.
     * Solo accesible para productores y administradores.
     * 
     * @param id el identificador del producto
     * @param principal el usuario autenticado
     * @return ResponseEntity vacía
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PRODUCER','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, 
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        productService.delete(id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtiene los productos del usuario actual (productor).
     * Solo accesible para productores y administradores.
     * 
     * @param principal el usuario autenticado
     * @param page página actual (0-indexed)
     * @param size tamaño de la página
     * @return ResponseEntity con la lista paginada de productos del productor
     */
    @GetMapping("/my-products")
    @PreAuthorize("hasAnyRole('PRODUCER','ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> myProducts(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<ProductResponse>>builder()
                .success(true)
                .message("Productos del productor")
                .data(productService.getMyProducts(principal.getUserId(), page, size))
                .build());
    }
}
