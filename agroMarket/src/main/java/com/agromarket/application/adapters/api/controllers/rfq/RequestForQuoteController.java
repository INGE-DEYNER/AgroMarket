package com.agromarket.application.adapters.api.controllers.rfq;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.rfq.CreateRequestForQuoteRequest;
import com.agromarket.application.adapters.api.response.rfq.QuoteOfferResponse;
import com.agromarket.application.adapters.api.response.rfq.RequestForQuoteResponse;
import com.agromarket.domain.ports.in.rfq.CreateRequestForQuoteCommand;
import com.agromarket.domain.ports.in.rfq.QuoteOfferPort;
import com.agromarket.domain.ports.in.rfq.RequestForQuotePort;
import com.agromarket.domain.ports.in.rfq.RequestForQuoteResult;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/rfq")
@RequiredArgsConstructor
public class RequestForQuoteController {

        private final RequestForQuotePort requestForQuotePort;
        private final QuoteOfferPort quoteOfferPort;

        @PostMapping
        public ResponseEntity<RequestForQuoteResponse> create(
                        @RequestParam Long buyerId,
                        @Valid @RequestBody CreateRequestForQuoteRequest request) {

                RequestForQuoteResult result = requestForQuotePort.create(
                                new CreateRequestForQuoteCommand(
                                                buyerId,
                                                request.fruitType(),
                                                request.requiredQuantity(),
                                                request.description(),
                                                request.deadline()));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(toResponse(result));
        }

        @GetMapping("/active")
        public ResponseEntity<List<RequestForQuoteResponse>> getActive() {

                return ResponseEntity.ok(
                                requestForQuotePort.getActive()
                                                .stream()
                                                .map(this::toResponse)
                                                .toList());
        }

        @GetMapping("/buyer/{buyerId}")
        public ResponseEntity<List<RequestForQuoteResponse>> getByBuyer(
                        @PathVariable Long buyerId) {

                return ResponseEntity.ok(
                                requestForQuotePort.getMyRequests(buyerId)
                                                .stream()
                                                .map(this::toResponse)
                                                .toList());
        }

        private RequestForQuoteResponse toResponse(
                        RequestForQuoteResult result) {

                List<QuoteOfferResponse> offers = quoteOfferPort.getOffersForRequest(result.getId())
                                .stream()
                                .map(QuoteOfferResponse::fromResult)
                                .toList();

                return RequestForQuoteResponse.fromResult(
                                result,
                                offers);
        }
}
