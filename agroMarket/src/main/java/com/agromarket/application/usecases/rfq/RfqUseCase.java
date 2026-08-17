package com.agromarket.application.usecases.rfq;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.exceptions.rfq.InvalidQuoteOfferException;
import com.agromarket.domain.exceptions.rfq.QuoteOfferNotFoundException;
import com.agromarket.domain.exceptions.rfq.RequestForQuoteNotFoundException;
import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.enums.rfq.QuoteOfferStatus;
import com.agromarket.domain.models.enums.rfq.RequestForQuoteStatus;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.rfq.QuoteOffer;
import com.agromarket.domain.models.rfq.RequestForQuote;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.rfq.CreateQuoteOfferCommand;
import com.agromarket.domain.ports.in.rfq.CreateRequestForQuoteCommand;
import com.agromarket.domain.ports.in.rfq.QuoteOfferPort;
import com.agromarket.domain.ports.in.rfq.QuoteOfferResult;
import com.agromarket.domain.ports.in.rfq.RequestForQuotePort;
import com.agromarket.domain.ports.in.rfq.RequestForQuoteResult;
import com.agromarket.domain.ports.out.order.OrderPort;
import com.agromarket.domain.ports.out.product.ProductPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.services.rfq.QuoteOfferService;
import com.agromarket.domain.services.rfq.RequestForQuoteService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RfqUseCase implements RequestForQuotePort, QuoteOfferPort {

        private final com.agromarket.domain.ports.out.rfq.RequestForQuotePort requestPersistencePort;
        private final com.agromarket.domain.ports.out.rfq.QuoteOfferPort offerPersistencePort;
        private final UserPort userPort;
        private final ProductPort productPort;
        private final OrderPort orderPort;
        private final RequestForQuoteService requestForQuoteService;
        private final QuoteOfferService quoteOfferService;

        @Override
        @Transactional
        public RequestForQuoteResult create(
                        CreateRequestForQuoteCommand command) {

                User buyer = findUser(command.getBuyerId());

                if (!buyer.isBuyer()) {
                        throw new IllegalArgumentException(
                                        "El usuario indicado no tiene rol BUYER");
                }

                RequestForQuote request = RequestForQuote.builder()
                                .buyer(buyer)
                                .fruitType(command.getFruitType())
                                .requiredQuantity(command.getRequiredQuantity())
                                .description(command.getDescription())
                                .deadline(command.getDeadline())
                                .status(RequestForQuoteStatus.OPEN)
                                .createdAt(LocalDateTime.now())
                                .build();

                if (!requestForQuoteService.isValid(request)) {
                        throw new IllegalArgumentException(
                                        "La solicitud de cotización no es válida");
                }

                RequestForQuote saved = requestPersistencePort.save(request);
                return toRequestResult(saved);
        }

        @Override
        @Transactional(readOnly = true)
        public List<RequestForQuoteResult> getActive() {
                return requestPersistencePort.findAllActive()
                                .stream()
                                .map(this::toRequestResult)
                                .toList();
        }

        @Override
        @Transactional(readOnly = true)
        public List<RequestForQuoteResult> getMyRequests(
                        Long buyerId) {

                findUser(buyerId);

                return requestPersistencePort.findByBuyerId(buyerId)
                                .stream()
                                .map(this::toRequestResult)
                                .toList();
        }

        @Override
        @Transactional
        public QuoteOfferResult offer(
                        CreateQuoteOfferCommand command) {

                RequestForQuote request = findRequest(command.getRequestForQuoteId());

                if (!requestForQuoteService.canReceiveOffers(request)) {
                        throw new InvalidQuoteOfferException(
                                        "La solicitud no está disponible para recibir ofertas");
                }

                User producer = findUser(command.getProducerId());

                if (!producer.isProducer()) {
                        throw new InvalidQuoteOfferException(
                                        "El usuario indicado no tiene rol PRODUCER");
                }

                if (offerPersistencePort
                                .existsByRequestForQuoteIdAndProducerId(
                                                command.getRequestForQuoteId(),
                                                command.getProducerId())) {
                        throw new InvalidQuoteOfferException(
                                        "El productor ya realizó una oferta para esta solicitud");
                }

                Product product = productPort.findById(command.getProductId())
                                .orElseThrow(() -> new InvalidQuoteOfferException(
                                                "No existe el producto indicado"));

                validateProductForOffer(product, producer, request);

                QuoteOffer offer = QuoteOffer.builder()
                                .requestForQuote(request)
                                .producer(producer)
                                .product(product)
                                .proposedPrice(command.getProposedPrice())
                                .comments(command.getComments())
                                .status(QuoteOfferStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();

                if (!quoteOfferService.canBeAccepted(offer)) {
                        throw new InvalidQuoteOfferException(
                                        "La oferta no contiene datos válidos");
                }

                QuoteOffer saved = offerPersistencePort.save(offer);
                return toOfferResult(saved);
        }

        @Override
        @Transactional(readOnly = true)
        public QuoteOfferResult getById(Long offerId) {
                return toOfferResult(findOffer(offerId));
        }

        @Override
        @Transactional(readOnly = true)
        public List<QuoteOfferResult> getOffersForRequest(
                        Long requestForQuoteId) {

                findRequest(requestForQuoteId);

                return offerPersistencePort
                                .findByRequestForQuoteId(requestForQuoteId)
                                .stream()
                                .map(this::toOfferResult)
                                .toList();
        }

        @Override
        @Transactional
        public void rejectOffer(
                        Long offerId,
                        Long buyerId) {

                QuoteOffer offer = findOffer(offerId);
                RequestForQuote request = requireRequest(offer);

                validateBuyerOwnsRequest(request, buyerId);

                quoteOfferService.reject(offer);
                offerPersistencePort.save(offer);
        }

        @Override
        @Transactional
        public void acceptOffer(
                        Long offerId,
                        Long buyerId) {

                QuoteOffer acceptedOffer = findOffer(offerId);
                RequestForQuote request = requireRequest(acceptedOffer);

                validateBuyerOwnsRequest(request, buyerId);

                if (!quoteOfferService.canBeAccepted(acceptedOffer)) {
                        throw new InvalidQuoteOfferException(
                                        "La oferta no puede ser aceptada");
                }

                /*
                 * canBeAccepted() del dominio también valida que el producto:
                 * 1. pertenezca al productor de la oferta;
                 * 2. tenga el mismo FruitType que la RFQ.
                 */
                validateProductForOffer(
                                acceptedOffer.getProduct(),
                                acceptedOffer.getProducer(),
                                request);

                acceptedOffer.setStatus(QuoteOfferStatus.ACCEPTED);
                offerPersistencePort.save(acceptedOffer);

                requestForQuoteService.close(request);
                requestPersistencePort.save(request);

                List<QuoteOffer> otherOffers = offerPersistencePort
                                .findByRequestForQuoteId(request.getId());

                for (QuoteOffer otherOffer : otherOffers) {
                        if (!otherOffer.getId().equals(acceptedOffer.getId())
                                        && otherOffer.getStatus() == QuoteOfferStatus.PENDING) {

                                quoteOfferService.reject(otherOffer);
                                offerPersistencePort.save(otherOffer);
                        }
                }

                Product product = acceptedOffer.getProduct();
                int quantity = toOrderQuantity(request.getRequiredQuantity());

                if (!product.isAvailable()
                                || product.getAvailableQuantity() < quantity) {
                        throw new InvalidQuoteOfferException(
                                        "El producto de la oferta aceptada no tiene stock suficiente");
                }

                Order order = Order.builder()
                                .buyer(request.getBuyer())
                                .product(product)
                                .quantity(quantity)
                                .unitPrice(acceptedOffer.getProposedPrice())
                                .state(com.agromarket.domain.models.enums.order.OrderState.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();

                order.setTotal(order.calculateTotal());
                orderPort.save(order);
        }

        private RequestForQuote findRequest(Long id) {
                return requestPersistencePort.findById(id)
                                .orElseThrow(() -> new RequestForQuoteNotFoundException(
                                                "No existe la solicitud de cotización con id " + id));
        }

        private QuoteOffer findOffer(Long id) {
                return offerPersistencePort.findById(id)
                                .orElseThrow(() -> new QuoteOfferNotFoundException(
                                                "No existe la oferta con id " + id));
        }

        private RequestForQuote requireRequest(QuoteOffer offer) {
                if (offer.getRequestForQuote() == null
                                || offer.getRequestForQuote().getId() == null) {
                        throw new InvalidQuoteOfferException(
                                        "La oferta no tiene una solicitud de cotización válida");
                }

                return findRequest(offer.getRequestForQuote().getId());
        }

        private User findUser(Long id) {
                return userPort.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "No existe el usuario con id " + id));
        }

        private void validateBuyerOwnsRequest(
                        RequestForQuote request,
                        Long buyerId) {

                if (request.getBuyer() == null
                                || request.getBuyer().getId() == null
                                || !request.getBuyer().getId().equals(buyerId)) {

                        throw new IllegalArgumentException(
                                        "El comprador no es propietario de la solicitud");
                }
        }

        private void validateProductForOffer(
                        Product product,
                        User producer,
                        RequestForQuote request) {

                if (product == null
                                || product.getProducer() == null
                                || producer == null
                                || product.getProducer().getId() == null
                                || producer.getId() == null
                                || !product.getProducer().getId().equals(producer.getId())) {

                        throw new InvalidQuoteOfferException(
                                        "El producto no pertenece al productor de la oferta");
                }

                FruitType requestedType = request.getFruitType();

                if (product.getFruitType() != requestedType) {
                        throw new InvalidQuoteOfferException(
                                        "El tipo de fruta del producto no coincide con la solicitud");
                }
        }

        private int toOrderQuantity(Double requiredQuantity) {
                if (requiredQuantity == null
                                || requiredQuantity <= 0
                                || requiredQuantity % 1 != 0) {

                        throw new InvalidQuoteOfferException(
                                        "La cantidad de la RFQ debe ser un número entero válido para crear el pedido");
                }

                return requiredQuantity.intValue();
        }

        private RequestForQuoteResult toRequestResult(
                        RequestForQuote request) {

                User buyer = request.getBuyer();

                String buyerName = buyer == null
                                ? null
                                : buildName(
                                                buyer.getFirstName(),
                                                buyer.getLastName());

                return new RequestForQuoteResult(
                                request.getId(),
                                buyer == null ? null : buyer.getId(),
                                buyerName,
                                request.getFruitType(),
                                request.getRequiredQuantity(),
                                request.getDescription(),
                                request.getDeadline(),
                                request.getStatus(),
                                request.getCreatedAt());
        }

        private QuoteOfferResult toOfferResult(
                        QuoteOffer offer) {

                User producer = offer.getProducer();

                String producerName = producer == null
                                ? null
                                : buildName(
                                                producer.getFirstName(),
                                                producer.getLastName());

                RequestForQuote request = offer.getRequestForQuote();

                return new QuoteOfferResult(
                                offer.getId(),
                                request == null ? null : request.getId(),
                                producer == null ? null : producer.getId(),
                                producerName,
                                offer.getProposedPrice(),
                                offer.getComments(),
                                offer.getStatus(),
                                offer.getCreatedAt());
        }

        private String buildName(
                        String firstName,
                        String lastName) {

                String first = firstName == null ? "" : firstName.trim();
                String last = lastName == null ? "" : lastName.trim();

                return (first + " " + last).trim();
        }
}
