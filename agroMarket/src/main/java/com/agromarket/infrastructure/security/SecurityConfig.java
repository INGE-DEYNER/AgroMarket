// infrastructure/security/SecurityConfig.java
package com.agromarket.infrastructure.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.agromarket.infrastructure.config.properties.AppProperties;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final RateLimitingFilter rateLimitingFilter;
        private final OAuth2LoginSuccessHandler successHandler;
        private final OAuth2LoginFailureHandler failureHandler;
        private final AppProperties appProperties;

        public SecurityConfig(
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        RateLimitingFilter rateLimitingFilter,
                        OAuth2LoginSuccessHandler successHandler,
                        OAuth2LoginFailureHandler failureHandler,
                        AppProperties appProperties) {

                this.jwtAuthenticationFilter = jwtAuthenticationFilter;

                this.rateLimitingFilter = rateLimitingFilter;

                this.successHandler = successHandler;

                this.failureHandler = failureHandler;

                this.appProperties = appProperties;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http)
                        throws Exception {

                http
                                .csrf(csrf -> csrf.disable())

                                .cors(cors -> cors.configurationSource(
                                                corsConfigurationSource()))

                                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(
                                                new HttpStatusEntryPoint(
                                                                HttpStatus.UNAUTHORIZED)))

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.IF_REQUIRED))

                                .authorizeHttpRequests(auth -> auth

                                                /*
                                                 * Preflight CORS: siempre
                                                 * público, sin importar el
                                                 * endpoint real.
                                                 */
                                                .requestMatchers(
                                                                HttpMethod.OPTIONS,
                                                                "/**")
                                                .permitAll()

                                                // Autenticación.
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/api/v1/auth/**")
                                                .permitAll()
                                                // OAuth2.
                                                .requestMatchers(
                                                                "/oauth2/**",
                                                                "/login/**")
                                                .permitAll()

                                                // Health / diagnóstico.
                                                .requestMatchers(
                                                                "/actuator/health",
                                                                "/actuator/health/**",
                                                                "/api/public/**")
                                                .permitAll()

                                                // Productos del productor autenticado: debe ir ANTES que la
                                                // regla pública de abajo, porque Spring Security aplica la
                                                // primera regla que matchee.
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/products/mis-productos")
                                                .authenticated()

                                                // Catálogo público (rutas del frontend sin /v1/).
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/productos/**",
                                                                "/api/v1/products/**")
                                                .permitAll()

                                                // Reseñas públicas (rutas del frontend sin /v1/).
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/resenas/**",
                                                                "/api/v1/reviews/**")
                                                .permitAll()

                                                // Divisas públicas.
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/divisas/**")
                                                .permitAll()

                                                // Listado público de productores (para la página /productores).
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/users")
                                                .permitAll()

                                                /*
                                                 * Webhook server-to-server de MercadoPago:
                                                 * llega SIN JWT, es la forma en que la
                                                 * pasarela confirma los cobros reales.
                                                 */
                                                .requestMatchers(
                                                                "/api/v1/payments/webhook",
                                                                "/api/v1/mercadopago/webhook")
                                                .permitAll()

                                                // Administración.
                                                .requestMatchers(
                                                                "/api/v1/admins/**")
                                                .hasRole("ADMIN")

                                                // Resto de la API.
                                                .anyRequest()
                                                .authenticated())

                                .oauth2Login(oauth2 -> oauth2
                                                .authorizationEndpoint(
                                                                endpoint -> endpoint.authorizationRequestRepository(
                                                                                new HttpSessionOAuth2AuthorizationRequestRepository()))

                                                .successHandler(
                                                                successHandler)

                                                .failureHandler(
                                                                failureHandler))

                                /*
                                 * Rate limiting se ejecuta antes del flujo de
                                 * autenticación estándar de Spring Security.
                                 */
                                .addFilterBefore(
                                                rateLimitingFilter,
                                                UsernamePasswordAuthenticationFilter.class)

                                /*
                                 * JWT se ejecuta antes de UsernamePasswordAuthenticationFilter.
                                 */
                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(
                                normalizeOrigins(appProperties
                                                .getCors()
                                                .getAllowedOrigins()));

                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "PATCH",
                                                "DELETE",
                                                "OPTIONS"));

                configuration.setAllowedHeaders(
                                List.of(
                                                "Authorization",
                                                "Content-Type",
                                                "Accept",
                                                "Origin",
                                                "X-Requested-With"));

                configuration.setExposedHeaders(
                                List.of(
                                                "Authorization",
                                                "X-RateLimit-Remaining"));

                configuration.setAllowCredentials(true);

                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }

        /*
         * Filtro CORS independiente registrado al NIVEL DE SERVLET con la
         * máxima prioridad. Se ejecuta ANTES que el filtro de Spring Security,
         * por lo que garantiza que todos los preflights (OPTIONS) reciban
         * respuesta con las cabeceras Access-Control-*, incluso si el
         * CorsFilter interno de Spring Security no llega a procesarlos.
         */
        @Bean
        public FilterRegistrationBean<CorsFilter> standaloneCorsFilter(
                        AppProperties appProperties) {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(
                                normalizeOrigins(appProperties
                                                .getCors()
                                                .getAllowedOrigins()));

                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "PATCH",
                                                "DELETE",
                                                "OPTIONS"));

                configuration.setAllowedHeaders(List.of("*"));

                configuration.setExposedHeaders(
                                List.of(
                                                "Authorization",
                                                "X-RateLimit-Remaining"));

                configuration.setAllowCredentials(true);

                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                FilterRegistrationBean<CorsFilter> registration = new FilterRegistrationBean<>(
                                new CorsFilter(source));

                registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
                registration.setName("standaloneCorsFilter");

                return registration;
        }

        /**
         * Spring Boot 3.x ya no divide automáticamente los valores separados
         * por coma de una variable de entorno (p. ej. APP_CORS_ALLOWED_ORIGIN)
         * al hacer binding sobre una List<String>. Este método normaliza la
         * lista dividiendo cada elemento que contenga comas en varios
         * orígenes.
         */
        private List<String> normalizeOrigins(
                        List<String> origins) {

                if (origins == null || origins.isEmpty()) {
                        return List.of();
                }

                return origins.stream()
                                .filter(origin -> origin != null
                                                && !origin.isBlank())
                                .flatMap(origin -> Arrays.stream(
                                                origin.split(",")))
                                .map(String::trim)
                                .filter(origin -> !origin.isEmpty())
                                .distinct()
                                .toList();
        }
}