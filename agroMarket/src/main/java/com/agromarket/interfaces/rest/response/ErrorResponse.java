package com.agromarket.interfaces.rest.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private String mensaje;
    private LocalDateTime timestamp;
    private String path;
    private List<String> fieldErrors;
    private Map<String, String> campos;
}
