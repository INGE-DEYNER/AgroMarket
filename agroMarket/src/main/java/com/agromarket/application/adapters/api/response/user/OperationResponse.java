package com.agromarket.application.adapters.api.response.user;

public record OperationResponse(String message) {
    public static OperationResponse success(String message) {
        return new OperationResponse(message);
    }

    public static OperationResponse error(String message) {
        return new OperationResponse(message);
    }
}
