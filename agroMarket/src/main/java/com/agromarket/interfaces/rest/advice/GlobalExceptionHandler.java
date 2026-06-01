package com.agromarket.interfaces.rest.advice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.agromarket.application.dto.ErrorResponse;
import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.domain.exception.EstadoPedidoInvalidoException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.exception.ResenaDuplicadaException;
import com.agromarket.domain.exception.StockInsuficienteException;
import com.agromarket.domain.exception.UsuarioYaExisteException;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.converter.HttpMessageConversionException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
@SuppressWarnings({"null", "unused"})
public class GlobalExceptionHandler {
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(RecursoNoEncontradoException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI(), "Not Found", List.of(), Map.of());
    }

    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<ErrorResponse> handleStock(StockInsuficienteException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI(), "Conflict", List.of(), Map.of());
    }

    @ExceptionHandler(EstadoPedidoInvalidoException.class)
    public ResponseEntity<ErrorResponse> handleEstado(EstadoPedidoInvalidoException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI(), "Bad Request", List.of(), Map.of());
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(AccesoDenegadoException ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage(), request.getRequestURI(), "Forbidden", List.of(), Map.of());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI(), "Bad Request", List.of(), Map.of());
    }

    @ExceptionHandler(UsuarioYaExisteException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(UsuarioYaExisteException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI(), "Conflict", List.of(), Map.of());
    }

    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<ErrorResponse> handleAuth(CredencialesInvalidasException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI(), "Unauthorized", List.of(), Map.of());
    }

    @ExceptionHandler(ResenaDuplicadaException.class)
    public ResponseEntity<ErrorResponse> handleReview(ResenaDuplicadaException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI(), "Conflict", List.of(), Map.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, "Conflicto con la información almacenada", request.getRequestURI(), "Conflict", List.of(), Map.of());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleJpaNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Recurso no encontrado", request.getRequestURI(), "Not Found", List.of(), Map.of());
    }

    @ExceptionHandler({java.util.NoSuchElementException.class})
    public ResponseEntity<ErrorResponse> handleNoSuchElement(java.util.NoSuchElementException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Recurso no encontrado", request.getRequestURI(), "Not Found", List.of(), Map.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleSpringForbidden(AccessDeniedException ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, "No tienes permisos para realizar esta acción", request.getRequestURI(), "Forbidden", List.of(), Map.of());
    }

    @ExceptionHandler({JwtException.class, ExpiredJwtException.class})
    public ResponseEntity<ErrorResponse> handleJwt(JwtException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, "Tu sesión no es válida o ha expirado", request.getRequestURI(), "Unauthorized", List.of(), Map.of());
    }

    @ExceptionHandler(com.agromarket.domain.exception.TooManyRequestsException.class)
    public ResponseEntity<ErrorResponse> handleTooMany(com.agromarket.domain.exception.TooManyRequestsException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).header("Retry-After", "3600").body(ErrorResponse.builder()
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error("Too Many Requests")
                .message(ex.getMessage())
                .mensaje(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .fieldErrors(List.of())
                .campos(Map.of())
                .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldMap = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> fieldMap.put(error.getField(), error.getDefaultMessage()));
        List<String> fieldErrors = fieldMap.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.toList());
        return build(HttpStatus.BAD_REQUEST, "Validation Failed", request.getRequestURI(), "Validation Failed", fieldErrors, fieldMap);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, HttpMediaTypeNotSupportedException.class})
    public ResponseEntity<ErrorResponse> handleUnreadableBody(Exception ex, HttpServletRequest request) {
        log.warn("Malformed request at {}: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, "Cuerpo inválido", request.getRequestURI(), "Bad Request", List.of(), Map.of());
    }

    @ExceptionHandler({JsonProcessingException.class, HttpMessageConversionException.class})
    public ResponseEntity<ErrorResponse> handleJsonProcessing(Exception ex, HttpServletRequest request) {
        // Jackson parsing / mapping errors should return 400 and not 500
        log.warn("JSON parsing/mapping error at {}: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, "El cuerpo de la solicitud contiene JSON inválido o campos inesperados", request.getRequestURI(), "Bad Request", List.of(), Map.of());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> fieldMap = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(violation -> fieldMap.put(violation.getPropertyPath().toString(), violation.getMessage()));
        List<String> errors = fieldMap.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.toList());
        return build(HttpStatus.BAD_REQUEST, "Validation Failed", request.getRequestURI(), "Validation Failed", errors, fieldMap);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", request.getRequestURI(), "Internal Server Error", List.of(), Map.of());
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, String path, String error, List<String> fieldErrors, Map<String, String> campos) {
        return ResponseEntity.status(status).body(ErrorResponse.builder()
                .status(status.value())
                .error(error)
                .message(message)
                .mensaje(message)
                .timestamp(LocalDateTime.now())
                .path(path)
                .fieldErrors(fieldErrors)
                .campos(campos)
                .build());
    }
}
