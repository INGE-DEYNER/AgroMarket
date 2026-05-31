package com.agromarket.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponseBuilderManual<T> builder() {
        return new ApiResponseBuilderManual<>();
    }

    public static class ApiResponseBuilderManual<T> {
        private boolean success;
        private String message;
        private T data;

        public ApiResponseBuilderManual<T> success(boolean success) {
            this.success = success;
            return this;
        }

        public ApiResponseBuilderManual<T> message(String message) {
            this.message = message;
            return this;
        }

        public ApiResponseBuilderManual<T> data(T data) {
            this.data = data;
            return this;
        }

        public ApiResponse<T> build() {
            return new ApiResponse<>(this.success, this.message, this.data);
        }
    }
}
