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

                                                /*
                                                 * CRÍTICO: /error debe ser público.
                                                 *
                                                 * Cuando un endpoint lanza
                                                 * cualquier excepción (JSON
                                                 * malformado, error de SQL,
                                                 * 404), Spring la reenvía al
                                                 * dispatcher de errores en
                                                 * POST /error. Si esa ruta cae
                                                 * bajo anyRequest()
                                                 * .authenticated(), el 401
                                                 * ENMASCARA el error real y el
                                                 * frontend lo muestra como
                                                 * "no tienes autorización",
                                                 * haciendo creer al usuario que
                                                 * su sesión caducó cuando el
                                                 * problema era otro.
                                                 *
                                                 * Permitir /error devuelve el
                                                 * código verdadero (400/404/409/
                                                 * 500) y su mensaje, que es lo
                                                 * único que permite
                                                 * diagnosticar.
                                                 */
                                                .requestMatchers("/error")
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
                                                                "/api/divisas/**",
                                                                "/api/v1/divisas/**")
                                                .permitAll()

                                                /*
                                                 * Costo de envío configurado:
                                                 * lectura pública para que el
                                                 * carrito lo muestre también
                                                 * sin sesión; la escritura es
                                                 * exclusiva del administrador.
                                                 */
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/shipments/config")
                                                .permitAll()
                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/v1/shipments/config")
                                                .hasRole("ADMIN")

                                                /*
                                                 * Configuración global del
                                                 * sistema: lectura pública
                                                 * (aviso de mantenimiento en
                                                 * todo el frontend) y
                                                 * escritura solo para ADMIN.
                                                 */
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/config/**")
                                                .permitAll()
                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/v1/config/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/v1/config/**")
                                                .hasRole("ADMIN")

                                                /*
                                                 * Newsletter: suscripción pública
                                                 * (formulario "Suscríbete" del
                                                 * home). El conteo queda
                                                 * reservado al ADMIN.
                                                 */
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/v1/newsletter/subscribe")
                                                .permitAll()
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/newsletter/count")
                                                .hasRole("ADMIN")

                                                /*
                                                  * Directorio de productores.
                                                  *
                                                  * SOLO la vista publica queda
                                                  * sin sesion: nombre, empresa,
                                                  * foto y ciudad. El listado
                                                  * completo (GET /users) lleva
                                                  * telefono, documento, fecha
                                                  * de nacimiento y direccion,
                                                  * asi que pasa a exigir
                                                  * sesion. El panel de
                                                  * administradores no lo usa:
                                                  * ese lee /api/v1/admins/**.
                                                  */
                                                 .requestMatchers(
                                                                 HttpMethod.GET,
                                                                 "/api/v1/users/publicos")
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
         * Normaliza los orígenes admitidos.
         *
         * <p>Spring Boot 3 no divide automáticamente un valor de entorno
         * separado por comas al enlazarlo sobre {@code List<String>}, y un
         * placeholder dentro de una lista YAML puede desplazar el resto de
         * los elementos. Por eso aquí se admiten las tres formas: lista ya
         * separada, string único con comas, y origins con barra final.</p>
         *
         * <p>Nunca se devuelve una lista vacía: sin origins configurados
         * Spring rechaza TODOS los preflights y el frontend se queda sin
         * poder llamar a la API, que es peor que exponer los de desarrollo.</p>
         */
        private List<String> normalizeOrigins(List<String> origins) {

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
                                // Normaliza la barra final: "https://x/" y
                                // "https://x" deben compararse iguales.
                                .map(origin -> origin.endsWith("/")
                                                ? origin.substring(0, origin.length() - 1)
                                                : origin)
                                .distinct()
                                .toList();
        }
}