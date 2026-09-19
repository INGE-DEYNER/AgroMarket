package com.agromarket.domain.exceptions.rfq;

import com.agromarket.domain.exceptions.DomainException;

public class InvalidQuoteOfferException extends DomainException {
    public InvalidQuoteOfferException(String message) {
        super(message);
    }

}
