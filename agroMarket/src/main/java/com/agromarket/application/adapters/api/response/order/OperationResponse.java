package com.agromarket.application.adapters.api.response.order;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OperationResponse {
    private boolean success;
    private String message;

    /** Respuesta de operación exitosa. */
    public static OperationResponse success(String message) {
        return new OperationResponse(true, message);
    }

    /** Respuesta de operación fallida. */
    public static OperationResponse error(String message) {
        return new OperationResponse(false, message);
    }
}
