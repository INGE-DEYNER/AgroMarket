package com.agromarket.application.adapters.persistence.mongodb.documents.review;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.review.Review;
import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
@CompoundIndex(name = "uk_review_product_buyer", def = "{'productId': 1, 'buyerId': 1}", unique = true)
public class ReviewDocument {

    @Id
    private String id;

    private Long buyerId;

    private String buyerName;

    private Long productId;

    private String productName;

    private Integer rating;

    private String comment;

    private LocalDateTime date;

    public Review toDomain() {
        return Review.builder()
                .id(parseId(id))
                .buyer(User.builder()
                        .id(buyerId)
                        .firstName(extractFirstName(buyerName))
                        .lastName(extractLastName(buyerName))
                        .build())
                .product(Product.builder()
                        .id(productId)
                        .name(productName)
                        .build())
                .rating(rating)
                .comment(comment)
                .date(date)
                .build();
    }

    public static ReviewDocument fromDomain(Review review) {
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

        String productName = review.getProduct() != null
                ? review.getProduct().getName()
                : null;

        return ReviewDocument.builder()
                .id(review.getId() != null ? review.getId().toString() : null)
                .buyerId(buyerId)
                .buyerName(buyerName)
                .productId(productId)
                .productName(productName)
                .rating(review.getRating())
                .comment(review.getComment())
                .date(review.getDate())
                .build();
    }

    private static String buildName(String first, String last) {
        String f = first == null ? "" : first.trim();
        String l = last == null ? "" : last.trim();
        return (f + " " + l).trim();
    }

    private static String extractFirstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return null;
        }
        int separator = fullName.indexOf(' ');
        return separator < 0 ? fullName : fullName.substring(0, separator);
    }

    private static String extractLastName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return null;
        }
        int separator = fullName.indexOf(' ');
        return separator < 0 ? null : fullName.substring(separator + 1);
    }

    private static Long parseId(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
