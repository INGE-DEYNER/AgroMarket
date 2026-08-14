package com.agromarket.application.dto.shared;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clase genérica para envolver respuestas de la API.
 * Proporciona una estructura estándar para todas las respuestas exitosas.
 * 
 * <p>Ejemplo de uso:</p>
 * <pre>
 * ApiResponse&lt;UserResponse&gt; response = ApiResponse.&lt;UserResponse&gt;builder()
 *     .success(true)
 *     .message("Usuario creado exitosamente")
 *     .data(userResponse)
 *     .build();
 * </pre>
 * 
 * @param <T> tipo de los datos de la respuesta
 * @author AgroMarket Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    
    /**
     * Indica si la operación fue exitosa.
     */
    private boolean success;
    
    /**
     * Mensaje descriptivo de la respuesta (en español).
     */
    private String message;
    
    /**
     * Datos de la respuesta.
     */
    private T data;
    
    /**
     * Crea un builder para ApiResponse.
     * 
     * @param <T> tipo de los datos
     * @return builder de ApiResponse
     */
    public static <T> ApiResponseBuilderManual<T> builder() {
        return new ApiResponseBuilderManual<>();
    }
    
    /**
     * Builder manual para ApiResponse que permite encadenar llamadas.
     * 
     * @param <T> tipo de los datos
     */
    public static class ApiResponseBuilderManual<T> {
        private boolean success;
        private String message;
        private T data;
        
        /**
         * Establece el estado de éxito.
         * 
         * @param success true si la operación fue exitosa
         * @return esta instancia del builder
         */
        public ApiResponseBuilderManual<T> success(boolean success) {
            this.success = success;
            return this;
        }
        
        /**
         * Establece el mensaje de la respuesta.
         * 
         * @param message mensaje descriptivo (en español)
         * @return esta instancia del builder
         */
        public ApiResponseBuilderManual<T> message(String message) {
            this.message = message;
            return this;
        }
        
        /**
         * Establece los datos de la respuesta.
         * 
         * @param data datos a incluir en la respuesta
         * @return esta instancia del builder
         */
        public ApiResponseBuilderManual<T> data(T data) {
            this.data = data;
            return this;
        }
        
        /**
         * Construye la instancia de ApiResponse.
         * 
         * @return instancia de ApiResponse
         */
        public ApiResponse<T> build() {
            return new ApiResponse<>(this.success, this.message, this.data);
        }
    }
}
