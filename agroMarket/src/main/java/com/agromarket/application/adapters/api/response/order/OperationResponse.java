package com.agromarket.application.adapters.api.response.order;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OperationResponse {
    private boolean success;
    private String message;
}
