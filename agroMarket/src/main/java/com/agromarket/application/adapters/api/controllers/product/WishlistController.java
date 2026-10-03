package com.agromarket.application.adapters.api.controllers.product;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.application.adapters.persistence.sql.entities.product.WishlistEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.product.ProductJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.product.WishlistJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.infrastructure.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;

/**
 * Lista de deseos (favoritos) persistida por usuario y producto.
 *
 * <p>
 * Endpoint canónico {@code /api/v1/wishlist} con alias
 * {@code /api/v1/lista-deseos} (el que ya consumía el frontend).
 * </p>
 *
 * <ul>
 *   <li>Sin duplicados: la tabla tiene una constraint única
 *       (user_id, product_id) y el alta es idempotente.</li>
 *   <li>Toda operación se resuelve contra el usuario del JWT, nunca con un
 *       id enviado por el cliente.</li>
 * </ul>
 */
@RestController
@RequestMapping({ "/api/v1/wishlist", "/api/v1/lista-deseos" })
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistJpaRepository wishlists;
    private final ProductJpaRepository products;
    private final UserJpaRepository users;

    /** GET /api/v1/wishlist — favoritos del usuario. */
    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(
            @AuthenticationPrincipal JwtUserPrincipal principal) {

        return wishlists.findByUser_Id(principal.getUserId())
                .stream()
                .map(this::view)
                .toList();
    }

    /**
     * GET /api/v1/wishlist/{productId} — indica si el producto es favorito.
     *
     * <p>
     * Usado por el catálogo y la tarjeta de producto para pintar el estado
     * real del corazón sin traer la lista completa.
     * </p>
     */
    @GetMapping("/{productId}")
    @Transactional(readOnly = true)
    public Map<String, Object> isFavorite(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long productId) {

        boolean favorite = wishlists
                .findByUser_IdAndProduct_Id(principal.getUserId(), productId)
                .isPresent();

        return Map.of("productId", productId, "favorite", favorite);
    }

    /**
     * POST /api/v1/wishlist/{productId} — agrega a favoritos (idempotente).
     *
     * <p>
     * 201 cuando se crea y 200 cuando ya existía; en ambos casos devuelve el
     * mismo recurso, de modo que la UI puede refrescar su estado sin
     * lógica especial.
     * </p>
     */
    @PostMapping("/{productId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> add(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long productId) {

        Long userId = principal.getUserId();

        var existing = wishlists.findByUser_IdAndProduct_Id(userId, productId);

        if (existing.isPresent()) {
            Map<String, Object> payload = view(existing.get());
            payload.put("saved", true);
            return ResponseEntity.ok(payload);
        }

        UserEntity user = users.findById(userId)
                .orElseThrow(() -> new IllegalStateException(
                        "Usuario autenticado no existe: " + userId));

        ProductEntity product = products.findById(productId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Producto no encontrado: " + productId));

        WishlistEntity item = new WishlistEntity();
        item.setUser(user);
        item.setProduct(product);

        Map<String, Object> payload = view(wishlists.save(item));
        payload.put("saved", true);

        return ResponseEntity.status(HttpStatus.CREATED).body(payload);
    }

    /**
     * DELETE /api/v1/wishlist/{productId} — quita de favoritos.
     *
     * <p>
     * Idempotente: si el producto no estaba en la lista, igual devuelve 204.
     * </p>
     */
    @DeleteMapping("/{productId}")
    @Transactional
    public ResponseEntity<Void> remove(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long productId) {

        wishlists.findByUser_IdAndProduct_Id(principal.getUserId(), productId)
                .ifPresent(wishlists::delete);

        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> view(WishlistEntity item) {
        ProductEntity p = item.getProduct();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", item.getId());
        response.put("productId", p.getId());
        response.put("name", p.getName());
        response.put("price", p.getPrice());
        response.put("wholesalePrice", p.getWholesalePrice());
        response.put("imageUrl", p.getImageUrl());
        response.put("availableQuantity", p.getAvailableQuantity());
        response.put("fruitType",
                p.getFruitType() == null ? null : p.getFruitType().name());
        response.put("producerId",
                p.getProducer() == null ? null : p.getProducer().getId());
        response.put("favorite", true);

        return response;
    }
}
