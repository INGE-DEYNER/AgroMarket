package com.agromarket.application.adapters.api.controllers.review;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.review.CreateReviewRequest;
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
