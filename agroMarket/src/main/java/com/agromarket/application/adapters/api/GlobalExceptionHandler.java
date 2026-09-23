// application/adapters/api/GlobalExceptionHandler.java
package com.agromarket.application.adapters.api;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.agromarket.domain.exceptions.DomainException;
import com.agromarket.domain.exceptions.messaging.MessageNotAllowedException;

/**
 * Manejador global de excepciones HTTP.
 *
 * <p>
 * Se encuentra en application porque traduce excepciones del dominio
 * al contrato HTTP. El dominio permanece completamente independiente
 * de Spring MVC.
 * </p>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(DomainException.class)
        public ResponseEntity<Map<String, Object>> handleDomainException(
                        DomainException exception) {

                HttpStatus status = resolveStatus(exception);

                return ResponseEntity
                                .status(status)
                                .body(buildBody(
                                                status,
                                                exception.getMessage()));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleValidationException(
                        MethodArgumentNotValidException exception) {

                Map<String, Object> body = buildBody(
                                HttpStatus.BAD_REQUEST,
                                "La solicitud contiene datos inválidos");

                Map<String, String> errors = new LinkedHashMap<>();

                exception.getBindingResult()
                                .getFieldErrors()
                                .forEach(error -> errors.put(
                                                error.getField(),
                                                error.getDefaultMessage()));

                body.put("errors", errors);

                return ResponseEntity
                                .badRequest()
                                .body(body);
        }

        @ExceptionHandler(MessageNotAllowedException.class)
        public ResponseEntity<Map<String, Object>> handleMessageNotAllowed(
                        MessageNotAllowedException exception) {

                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(buildBody(
                                                HttpStatus.FORBIDDEN,
                                                exception.getMessage()));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
                        IllegalArgumentException exception) {

                return ResponseEntity
                                .badRequest()
                                .body(buildBody(
                                                HttpStatus.BAD_REQUEST,
                                                exception.getMessage()));
        }

        private HttpStatus resolveStatus(
                        DomainException exception) {

                String simpleName = exception
                                .getClass()
                                .getSimpleName()
                                .toLowerCase();

                /*
                 * Las excepciones *NotFound representan recursos inexistentes.
                 */
                if (simpleName.contains("notfound")) {
                        return HttpStatus.NOT_FOUND;
                }

                /*
                 * Estados inválidos, duplicados, conflictos de concurrencia
                 * y operaciones que chocan con el estado actual del recurso
                 * se exponen como conflicto.
                 */
                if (simpleName.contains("duplicate")
                                || simpleName.contains("conflict")
                                || simpleName.contains("state")
                                || simpleName.contains("already")
                                || simpleName.contains("concurrent")) {

                        return HttpStatus.CONFLICT;
                }

                /*
                 * Las demás excepciones de dominio representan una solicitud
                 * inválida desde el punto de vista HTTP.
                 */
                return HttpStatus.BAD_REQUEST;
        }

        private Map<String, Object> buildBody(
                        HttpStatus status,
                        String message) {

                Map<String, Object> body = new LinkedHashMap<>();

                body.put("timestamp", LocalDateTime.now());
                body.put("status", status.value());
                body.put("error", status.getReasonPhrase());
                body.put("message",
                                message == null
                                                ? "Error de dominio"
                                                : message);

                return body;
        }
}