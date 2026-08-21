// infrastructure/security/SecurityConfig.java
package com.agromarket.infrastructure.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

                                                // Autenticación.
                                                .requestMatchers(
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
                                appProperties
                                                .getCors()
                                                .getAllowedOrigins());

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
}