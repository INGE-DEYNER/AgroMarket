package com.agromarket.application.usecases.product;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.dto.request.product.CreateProductRequest;
import com.agromarket.application.dto.request.product.UpdateProductRequest;
import com.agromarket.application.dto.response.product.ProductResponse;
import com.agromarket.application.dto.shared.PageResponse;
import com.agromarket.application.mappers.ProductMapper;
import com.agromarket.domain.product.enums.FruitType;
import com.agromarket.domain.product.exceptions.ProductNotFoundException;
import com.agromarket.domain.product.model.Product;
import com.agromarket.domain.product.model.Review;
import com.agromarket.domain.product.ports.in.ProductService;
import com.agromarket.domain.product.ports.out.ProductRepository;
import com.agromarket.domain.user.enums.Role;
import com.agromarket.domain.user.model.User;
import com.agromarket.domain.user.ports.out.UserRepository;

import org.springframework.cache.Cache;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.infrastructure.security.InputSanitizerService;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de productos.
 * Contiene la lógica de negocio para la gestión de productos en el catálogo.
 * 
 * @author AgroMarket Team
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;
    private final InputSanitizerService inputSanitizerService;
    private final Cache productCache;
    private final Cache myProductsCache;

    @Override
    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Producto con ID " + id + " no encontrado"));
    }

    @Override
    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getAllActiveProducts() {
        return productRepository.findAllByActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getProductsByFruitType(FruitType fruitType) {
        return productRepository.findByFruitType(fruitType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getProductsByProducer(Long producerId) {
        return productRepository.findByProducerId(producerId);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
        // Invalidate caches
        productCache.evict(id);
        myProductsCache.invalidate();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> searchProducts(String query) {
        return productRepository.searchByNameOrDescription(query);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getProductsOnPromotion() {
        return productRepository.findByOnPromotionTrue();
    }

    @Override
    @Transactional
    public Review addReview(Review review) {
        // Verify that the user hasn't already reviewed this product
        boolean exists = productRepository.existsReviewByProductIdAndBuyerId(
            review.getProduct().getId(), 
            review.getBuyer().getId()
        );
        if (exists) {
            throw new IllegalStateException("Ya ha dejado una reseña para este producto");
        }
        return productRepository.saveReview(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> getReviewsByProduct(Long productId) {
        return productRepository.findReviewsByProductId(productId);
    }

    @Override
    @Transactional
    public Product updateProductStock(Long productId, int newQuantity) {
        Product product = getProductById(productId);
        product.setAvailableQuantity(newQuantity);
        return productRepository.save(product);
    }
    
    // ==================== MÉTODOS DE APLICACIÓN ====================

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
     * @return PageResponse con los productos
     */
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAll(int page, int size, String search, 
            FruitType fruitType, BigDecimal minPrice, BigDecimal maxPrice, 
            String sort, String category, Boolean onPromotion) {
        
        String cleanCategory = category;
        if (category != null && !category.isBlank()) {
            cleanCategory = category.toLowerCase()
                    .trim()
                    .replace("á", "a")
                    .replace("é", "e")
                    .replace("í", "i")
                    .replace("ó", "o")
                    .replace("ú", "u")
                    .replace("ñ", "n");
        }
        
        // Filtrar productos
        List<Product> products = productRepository.findAll().stream()
            .filter(p -> search == null || 
                (p.getName() != null && p.getName().toLowerCase().contains(search.toLowerCase())) ||
                (p.getDescription() != null && p.getDescription().toLowerCase().contains(search.toLowerCase())))
            .filter(p -> fruitType == null || p.getFruitType() == fruitType)
            .filter(p -> minPrice == null || (p.getPrice() != null && p.getPrice().compareTo(minPrice) >= 0))
            .filter(p -> maxPrice == null || (p.getPrice() != null && p.getPrice().compareTo(maxPrice) <= 0))
            .filter(p -> cleanCategory == null || 
                (p.getFruitType() != null && p.getFruitType().name().equalsIgnoreCase(cleanCategory)))
            .filter(p -> onPromotion == null || p.isOnPromotion() == onPromotion)
            .filter(p -> p.isActive())
            .collect(Collectors.toList());
        
        // Aplicar ordenamiento
        if (sort != null) {
            switch (sort.toLowerCase()) {
                case "price_asc":
                    products.sort((p1, p2) -> p1.getPrice() != null && p2.getPrice() != null ? 
                        p1.getPrice().compareTo(p2.getPrice()) : 0);
                    break;
                case "price_desc":
                    products.sort((p1, p2) -> p1.getPrice() != null && p2.getPrice() != null ? 
                        p2.getPrice().compareTo(p1.getPrice()) : 0);
                    break;
                case "name_asc":
                    products.sort((p1, p2) -> p1.getName() != null && p2.getName() != null ? 
                        p1.getName().compareToIgnoreCase(p2.getName()) : 0);
                    break;
                case "name_desc":
                    products.sort((p1, p2) -> p1.getName() != null && p2.getName() != null ? 
                        p2.getName().compareToIgnoreCase(p1.getName()) : 0);
                    break;
                case "sold_desc":
                    products.sort((p1, p2) -> p1.getTotalSold() != null && p2.getTotalSold() != null ? 
                        p2.getTotalSold().compareTo(p1.getTotalSold()) : 0);
                    break;
                default:
                    // Orden por defecto: más reciente primero
                    products.sort((p1, p2) -> p1.getCreatedAt() != null && p2.getCreatedAt() != null ? 
                        p2.getCreatedAt().compareTo(p1.getCreatedAt()) : 0);
            }
        }
        
        // Aplicar paginación
        int start = page * size;
        int end = Math.min(start + size, products.size());
        List<Product> pageProducts = products.subList(start, end);
        
        List<ProductResponse> content = pageProducts.stream()
            .map(productMapper::toResponse)
            .collect(Collectors.toList());
        
        int totalPages = (int) Math.ceil((double) products.size() / size);
        
        return PageResponse.<ProductResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(products.size())
                .totalPages(totalPages)
                .build();
    }

    /**
     * Crea un producto a partir de una solicitud DTO.
     * 
     * @param request la solicitud de creación
     * @param producerId el ID del productor
     * @return el producto creado
     */
    @Transactional
    public ProductResponse create(CreateProductRequest request, Long producerId) {
        boolean existsDuplicate = productRepository.findByProducerId(producerId).stream()
            .anyMatch(p -> p.getName() != null && p.getName().equalsIgnoreCase(request.getName()));
        
        if (existsDuplicate) {
            throw new IllegalArgumentException("Ya tienes un producto con ese nombre. Usa un nombre diferente o edita el existente.");
        }
        
        User producer = userRepository.findById(producerId)
            .orElseThrow(() -> new ProductNotFoundException("Productor no encontrado"));
        
        // Verify that the user is a PRODUCER
        if (!producer.getRole().equals(Role.PRODUCER)) {
            throw new IllegalArgumentException("Solo los productores pueden crear productos");
        }
        
        Product product = Product.builder()
                .name(inputSanitizerService.sanitize(request.getName()))
                .description(inputSanitizerService.sanitize(request.getDescription()))
                .price(request.getPrice())
                .availableQuantity(request.getAvailableQuantity())
                .imageUrl(request.getImageUrl())
                .fruitType(request.getFruitType())
                .producer(producer)
                .onPromotion(request.isOnPromotion())
                .minimumWholesaleQuantity(request.getMinimumWholesaleQuantity())
                .wholesalePrice(request.getWholesalePrice())
                .active(true)
                .build();
        
        Product saved = productRepository.save(product);
        // Invalidate caches
        myProductsCache.invalidate();
        productCache.invalidate();
        return productMapper.toResponse(saved);
    }

    /**
     * Actualiza un producto existente.
     * 
     * @param id el ID del producto
     * @param request la solicitud de actualización
     * @param requesterId el ID del solicitante
     * @return el producto actualizado
     */
    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request, Long requesterId) {
        Product product = getProductById(id);
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new ProductNotFoundException("Usuario no encontrado"));
        
        // Verify that the requester is the owner of the product
        if (product.getProducer() == null || !product.getProducer().getId().equals(requesterId)) {
            throw new SecurityException("No tiene permiso para actualizar este producto");
        }
        
        if (request.getName() != null) {
            product.setName(inputSanitizerService.sanitize(request.getName()));
        }
        if (request.getDescription() != null) {
            product.setDescription(inputSanitizerService.sanitize(request.getDescription()));
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getAvailableQuantity() != null) {
            product.setAvailableQuantity(request.getAvailableQuantity());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getFruitType() != null) {
            product.setFruitType(request.getFruitType());
        }
        if (request.getOnPromotion() != null) {
            product.setOnPromotion(request.getOnPromotion());
        }
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }
        if (request.getMinimumWholesaleQuantity() != null) {
            product.setMinimumWholesaleQuantity(request.getMinimumWholesaleQuantity());
        }
        if (request.getWholesalePrice() != null) {
            product.setWholesalePrice(request.getWholesalePrice());
        }
        
        Product saved = productRepository.save(product);
        // Invalidate caches
        productCache.evict(id);
        myProductsCache.invalidate();
        return productMapper.toResponse(saved);
    }

    /**
     * Elimina un producto.
     * 
     * @param id el ID del producto
     * @param requesterId el ID del solicitante
     */
    @Transactional
    public void delete(Long id, Long requesterId) {
        Product product = getProductById(id);
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new ProductNotFoundException("Usuario no encontrado"));
        
        // Verify that the requester is the owner of the product
        if (product.getProducer() == null || !product.getProducer().getId().equals(requesterId)) {
            throw new SecurityException("No tiene permiso para eliminar este producto");
        }
        
        deleteProduct(id);
    }

    /**
     * Obtiene los productos del usuario actual (productor).
     * 
     * @param producerId el ID del productor
     * @param page página actual
     * @param size tamaño de la página
     * @return PageResponse con los productos del productor
     */
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getMyProducts(Long producerId, int page, int size) {
        Long key = producerId;
        @SuppressWarnings("unchecked")
        PageResponse<ProductResponse> cached = (PageResponse<ProductResponse>) myProductsCache.get(key, k -> null);
        if (cached != null) {
            return cached;
        }
        
        List<Product> products = productRepository.findByProducerId(producerId);
        List<Product> activeProducts = products.stream()
            .filter(Product::isActive)
            .collect(Collectors.toList());
        
        long totalElements = activeProducts.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // Aplicar paginación
        int start = page * size;
        int end = Math.min(start + size, (int) totalElements);
        List<Product> pageProducts = activeProducts.subList(start, end);
        
        List<ProductResponse> content = pageProducts.stream()
            .map(productMapper::toResponse)
            .collect(Collectors.toList());
        
        PageResponse<ProductResponse> result = PageResponse.<ProductResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements((int) totalElements)
                .totalPages(totalPages)
                .build();
        
        myProductsCache.put(key, result);
        return result;
    }
}
