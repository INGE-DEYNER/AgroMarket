package com.agromarket.application.adapters.api.response.review;

import java.time.LocalDateTime;

import com.agromarket.domain.models.review.Review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

        private Long id;
        private Long buyerId;
        private String buyerName;
        private Long productId;
        private Integer rating;
        private String comment;
        private LocalDateTime date;

        public static ReviewResponse fromDomain(Review review) {
                if (review == null) {
                        return null;
                }

                Long buyerId = review.getBuyer() != null
                                ? review.getBuyer().getId()
                                : null;

                String buyerName = review.getBuyer() != null
                                ? buildName(
                                                review.getBuyer().getFirstName(),
                                                review.getBuyer().getLastName())
                                : null;

                Long productId = review.getProduct() != null
                                ? review.getProduct().getId()
                                : null;

                return ReviewResponse.builder()
                                .id(review.getId())
                                .buyerId(buyerId)
                                .buyerName(buyerName)
                                .productId(productId)
                                .rating(review.getRating())
                                .comment(review.getComment())
                                .date(review.getDate())
                                .build();
        }

        private static String buildName(String firstName, String lastName) {
                String first = firstName == null ? "" : firstName.trim();
                String last = lastName == null ? "" : lastName.trim();

                return (first + " " + last).trim();
        }
}
