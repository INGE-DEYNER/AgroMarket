package com.agromarket.application.adapters.api.controllers.review;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.review.CreateReviewRequest;
import com.agromarket.application.adapters.api.response.order.OperationResponse;
import com.agromarket.application.adapters.api.response.review.ReviewResponse;
import com.agromarket.domain.models.review.Review;
import com.agromarket.domain.ports.in.review.ReviewPort;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

        private final ReviewPort reviewPort;
        /**
         * GET /api/v1/reviews — listado global de reseñas.
         *
         * <p>Lo consume el panel de moderación de administración
         * ({@code GET /resenas}). Antes no existía y devolvía 404, por lo que
         * la pestaña de reseñas del admin salía vacía.</p>
         */
        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<ReviewResponse>> getAll() {

                return ResponseEntity.ok(
                                reviewPort.getAll()
                                                .stream()
                                                .map(this::toResponse)
                                                .toList());
        }

        /**
         * PUT /api/v1/reviews/{id}/moderar — aprueba o descarta una reseña.
         *
         * <p>Lo consume la moderación del panel de administración
         * ({@code PUT /resenas/{id}/moderar}). Sin este endpoint la acción
         * fallaba con 405 y la reseña no se podía ocultar.</p>
         *
         * <p>Una reseña descartada se elimina: el modelo {@code Review} no tiene
         * campo de estado, así que "moderar" significa publicly retirarla del
         * catálogo en lugar de inventar una columna que nadie más lee.</p>
         */
        @PutMapping("/{id}/moderar")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<OperationResponse> moderate(
                        @PathVariable Long id,
                        @RequestBody(required = false) Map<String, Boolean> body) {

                boolean approved = body != null
                                && Boolean.TRUE.equals(body.get("aprobada"));

                if (!approved) {
                        reviewPort.delete(id);
                        return ResponseEntity.ok(
                                        OperationResponse.success("Reseña descartada"));
                }

                // Aprobada: se valida que exista y se devuelve el estado actual.
                reviewPort.getById(id);

                return ResponseEntity.ok(
                                OperationResponse.success("Reseña aprobada"));
        }



        @PostMapping
        public ResponseEntity<ReviewResponse> create(
                        @Valid @RequestBody CreateReviewRequest request) {

                Review review = reviewPort.create(
                                request.getProductId(),
                                request.getReviewerId(),
                                request.getRating(),
                                request.getComment());

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(toResponse(review));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ReviewResponse> getById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                toResponse(reviewPort.getById(id)));
        }

        @GetMapping("/product/{productId}")
        public ResponseEntity<List<ReviewResponse>> getByProductId(
                        @PathVariable Long productId) {

                return ResponseEntity.ok(
                                reviewPort.getByProductId(productId)
                                                .stream()
                                                .map(this::toResponse)
                                                .toList());
        }

        @GetMapping("/reviewer/{reviewerId}")
        public ResponseEntity<List<ReviewResponse>> getByReviewerId(
                        @PathVariable Long reviewerId) {

                return ResponseEntity.ok(
                                reviewPort.getByReviewerId(reviewerId)
                                                .stream()
                                                .map(this::toResponse)
                                                .toList());
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> delete(
                        @PathVariable Long id) {

                reviewPort.delete(id);
                return ResponseEntity.noContent().build();
        }

        private ReviewResponse toResponse(Review review) {
                return ReviewResponse.fromDomain(review);
        }
}
