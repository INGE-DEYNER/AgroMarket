package com.agromarket.application.adapters.api.controllers.product;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

/**
 * Controlador público para endpoints de productos sin /v1/.
 * Usado por el frontend para rutas como /api/productos/categorias.
 */
@RestController
@RequestMapping("/api/productos")
public class ProductPublicController {

    @GetMapping("/categorias")
    public List<String> getCategorias() {
        return Arrays.asList("BANANA", "MANGO", "PINEAPPLE", "PASSION_FRUIT", "SOURSOP", "ORANGE", "COCONUT", "LEMON", "OTHER");
    }
}
