package com.agromarket.application.adapters.api.controllers.rfq;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.rfq.CreateQuoteOfferRequest;
import com.agromarket.application.adapters.api.response.rfq.QuoteOfferResponse;
import com.agromarket.domain.ports.in.rfq.CreateQuoteOfferCommand;
import com.agromarket.domain.ports.in.rfq.QuoteOfferPort;
import com.agromarket.domain.ports.in.rfq.QuoteOfferResult;
import com.agromarket.domain.ports.in.rfq.RequestForQuotePort;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/rfq/{requestForQuoteId}/offers")
@RequiredArgsConstructor
public class QuoteOfferController {

        private final RequestForQuotePort requestForQuotePort;
        private final QuoteOfferPort quoteOfferPort;

        @PostMapping
        public ResponseEntity<QuoteOfferResponse> create(
                        @PathVariable Long requestForQuoteId,
                        @RequestParam Long producerId,
                        @RequestParam Long productId,
                        @Valid @RequestBody CreateQuoteOfferRequest request) {

                QuoteOfferResult result = requestForQuotePort.offer(
                                new CreateQuoteOfferCommand(
                                                requestForQuoteId,
                                                producerId,
                                                productId,
                                                request.proposedPrice(),
                                                request.comments()));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(QuoteOfferResponse.fromResult(result));
        }

        @GetMapping
        public ResponseEntity<List<QuoteOfferResponse>> getOffers() {

                return ResponseEntity.ok(
                                quoteOfferPort
                                                .getOffersForRequest(requestForQuoteId)
                                                .stream()
                                                .map(QuoteOfferResponse::fromResult)
                                                .toList());
        }

        @PatchMapping("/{offerId}/accept")
        public ResponseEntity<Void> accept(
                        @PathVariable Long requestForQuoteId,
                        @PathVariable Long offerId,
                        @RequestParam Long buyerId) {

                requestForQuotePort.acceptOffer(
                                offerId,
                                buyerId);

                return ResponseEntity.noContent().build();
        }

        @PatchMapping("/{offerId}/reject")
        public ResponseEntity<Void> reject(
                        @PathVariable Long requestForQuoteId,
                        @PathVariable Long offerId,
                        @RequestParam Long buyerId) {

                quoteOfferPort.rejectOffer(
                                offerId,
                                buyerId);

                return ResponseEntity.noContent().build();
        }
}
