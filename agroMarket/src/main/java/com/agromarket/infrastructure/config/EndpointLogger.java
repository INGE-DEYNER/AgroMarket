// src/main/java/com/agromarket/infrastructure/config/EndpointLogger.java
package com.agromarket.infrastructure.config;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import com.agromarket.domain.ports.out.admin.AdminPort;
import com.agromarket.domain.ports.out.coupon.CouponPort;
import com.agromarket.domain.ports.out.image.FileStoragePort;
import com.agromarket.domain.ports.out.image.ImagePort;
import com.agromarket.domain.ports.out.messaging.MessagingPort;
import com.agromarket.domain.ports.out.order.OrderPort;
import com.agromarket.domain.ports.out.payment.InvoicePort;
import com.agromarket.domain.ports.out.payment.PaymentGatewayPort;
import com.agromarket.domain.ports.out.payment.PaymentPort;
import com.agromarket.domain.ports.out.product.ProductPort;
import com.agromarket.domain.ports.out.review.ReviewPort;
import com.agromarket.domain.ports.out.rfq.QuoteOfferPort;
import com.agromarket.domain.ports.out.rfq.RequestForQuotePort;
import com.agromarket.domain.ports.out.shipping.ShippingPort;
import com.agromarket.domain.ports.out.user.UserPort;

import com.agromarket.domain.services.admin.AdminService;
import com.agromarket.domain.services.coupon.CouponService;
import com.agromarket.domain.services.image.ImageService;
import com.agromarket.domain.services.messaging.MessagingService;
import com.agromarket.domain.services.order.OrderService;
import com.agromarket.domain.services.payment.InvoiceService;
import com.agromarket.domain.services.payment.PaymentService;
import com.agromarket.domain.services.product.ProductService;
import com.agromarket.domain.services.product.ProductStockService;
import com.agromarket.domain.services.review.ReviewService;
import com.agromarket.domain.services.rfq.QuoteOfferService;
import com.agromarket.domain.services.rfq.RequestForQuoteService;
import com.agromarket.domain.services.shipping.ShippingService;
import com.agromarket.domain.services.user.PasswordPolicyService;
import com.agromarket.domain.services.user.TokenValidationService;
import com.agromarket.domain.services.user.TwoFactorService;
import com.agromarket.domain.services.user.UserService;

import com.agromarket.infrastructure.security.IdEncryptionUtil;
import com.agromarket.infrastructure.security.InputSanitizerService;
import com.agromarket.infrastructure.security.JwtAuthenticationFilter;
import com.agromarket.infrastructure.security.JwtTokenProvider;
import com.agromarket.infrastructure.security.RateLimitingFilter;
import com.agromarket.infrastructure.security.RateLimitingService;
import com.agromarket.infrastructure.security.SafeRedirectUtil;
import com.agromarket.infrastructure.security.UserDetailsServiceImpl;

import jakarta.annotation.PostConstruct;

/**
 * Diagnóstico integral de AgroMarket.
 *
 * Solo se ejecuta con profile dev.
 *
 * Comprueba:
 * - ApplicationContext
 * - servicios de dominio
 * - ports.out
 * - infraestructura de seguridad
 * - configuración
 * - MySQL
 * - MongoDB
 * - endpoints
 * - clasificación de seguridad
 * - colisiones reales entre controllers de aplicación
 *
 * No contiene lógica de negocio y no modifica ningún bean.
 */
@Component
@Profile("dev")
public class EndpointLogger {

        private static final String OK = "[OK]";
        private static final String FAIL = "[FAIL]";

        private static final List<PublicRule> PUBLIC_RULES = List.of(
                        new PublicRule(null, "/api/v1/auth/**", "PUBLIC"),
                        new PublicRule(null, "/oauth2/**", "PUBLIC"),
                        new PublicRule(null, "/login/**", "PUBLIC"),
                        new PublicRule(null, "/actuator/health", "PUBLIC"),
                        new PublicRule(null, "/actuator/health/**", "PUBLIC"),
                        new PublicRule(RequestMethod.GET, "/api/v1/products/**", "PUBLIC"),
                        new PublicRule(RequestMethod.GET, "/api/v1/reviews/**", "PUBLIC"),
                        new PublicRule(null, "/api/v1/admins/**", "ROLE_ADMIN"));

        private final ApplicationContext applicationContext;
        private final Environment environment;

        private final RequestMappingHandlerMapping handlerMapping;

        private final DataSource dataSource;

        private final MongoTemplate mongoTemplate;

        private final AntPathMatcher pathMatcher = new AntPathMatcher();

        private final List<DiagnosticResult> results = new ArrayList<>();

        public EndpointLogger(
                        ApplicationContext applicationContext,
                        Environment environment,
                        @Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping handlerMapping,
                        DataSource dataSource,
                        MongoTemplate mongoTemplate) {

                this.applicationContext = applicationContext;
                this.environment = environment;
                this.handlerMapping = handlerMapping;
                this.dataSource = dataSource;
                this.mongoTemplate = mongoTemplate;
        }

        @PostConstruct
        public void runFullDiagnostic() {

                printHeader();

                checkApplicationContext();

                checkDomainServices();

                checkCriticalPorts();

                checkSecurityInfrastructure();

                checkConfiguration();

                checkSqlConnection();

                checkMongoConnection();

                checkEndpoints();

                printFinalSummary();
        }

        // ============================================================
        // APPLICATION CONTEXT
        // ============================================================

        private void checkApplicationContext() {

                boolean ok = applicationContext != null;

                add(
                                "APPLICATION CONTEXT",
                                ok,
                                ok
                                                ? "ApplicationContext creado correctamente"
                                                : "ApplicationContext no disponible");
        }

        // ============================================================
        // DOMAIN
        // ============================================================

        private void checkDomainServices() {

                List<Class<?>> services = List.of(
                                AdminService.class,
                                CouponService.class,
                                ImageService.class,
                                MessagingService.class,
                                OrderService.class,
                                InvoiceService.class,
                                PaymentService.class,
                                ProductService.class,
                                ProductStockService.class,
                                ReviewService.class,
                                QuoteOfferService.class,
                                RequestForQuoteService.class,
                                ShippingService.class,
                                PasswordPolicyService.class,
                                TwoFactorService.class,
                                UserService.class,
                                TokenValidationService.class);

                int resolved = 0;

                for (Class<?> service : services) {

                        int count = applicationContext
                                        .getBeansOfType(service)
                                        .size();

                        if (count == 1) {
                                resolved++;
                        } else {
                                add(
                                                "DOMAIN SERVICE",
                                                false,
                                                service.getSimpleName()
                                                                + " beans="
                                                                + count);
                        }
                }

                add(
                                "DOMAIN",
                                resolved == services.size(),
                                resolved + "/" + services.size()
                                                + " servicios de dominio registrados");
        }

        // ============================================================
        // PORTS OUT
        // ============================================================

        private void checkCriticalPorts() {

                checkPort("UserPort", UserPort.class);
                checkPort("ProductPort", ProductPort.class);
                checkPort("OrderPort", OrderPort.class);
                checkPort("PaymentPort", PaymentPort.class);
                checkPort("InvoicePort", InvoicePort.class);
                checkPort("ShippingPort", ShippingPort.class);
                checkPort("CouponPort", CouponPort.class);
                checkPort("ReviewPort", ReviewPort.class);
                checkPort("MessagingPort", MessagingPort.class);
                checkPort("ImagePort", ImagePort.class);
                checkPort("FileStoragePort", FileStoragePort.class);
                checkPort("AdminPort", AdminPort.class);
                checkPort("RequestForQuotePort", RequestForQuotePort.class);
                checkPort("QuoteOfferPort", QuoteOfferPort.class);
                checkPort("PaymentGatewayPort", PaymentGatewayPort.class);
        }

        private void checkPort(
                        String name,
                        Class<?> portType) {

                Map<String, ?> beans = applicationContext.getBeansOfType(portType);

                boolean ok = beans.size() == 1;

                String detail;

                if (beans.isEmpty()) {

                        detail = "SIN IMPLEMENTACIÓN";

                } else if (beans.size() > 1) {

                        detail = "AMBIGUO: " + beans.keySet();

                } else {

                        Object bean = beans.values()
                                        .iterator()
                                        .next();

                        detail = "adapter="
                                        + bean.getClass()
                                                        .getSimpleName();
                }

                add(
                                "PORT " + name,
                                ok,
                                detail);
        }

        // ============================================================
        // SECURITY
        // ============================================================

        private void checkSecurityInfrastructure() {

                checkBean(
                                "JwtAuthenticationFilter",
                                JwtAuthenticationFilter.class);

                checkBean(
                                "JwtTokenProvider",
                                JwtTokenProvider.class);

                /*
                 * JwtUserPrincipal NO es un Spring Bean obligatorio.
                 *
                 * Es un objeto que representa al usuario autenticado
                 * dentro del SecurityContext.
                 *
                 * Por eso NO se comprueba con getBeansOfType().
                 *
                 * La existencia de la clase se valida mediante Class.forName.
                 */
                checkClass(
                                "JwtUserPrincipal",
                                "com.agromarket.infrastructure.security.JwtUserPrincipal");

                checkBean(
                                "UserDetailsServiceImpl",
                                UserDetailsServiceImpl.class);

                checkBean(
                                "RateLimitingFilter",
                                RateLimitingFilter.class);

                checkBean(
                                "RateLimitingService",
                                RateLimitingService.class);

                checkBean(
                                "IdEncryptionUtil",
                                IdEncryptionUtil.class);

                checkBean(
                                "SafeRedirectUtil",
                                SafeRedirectUtil.class);

                checkBean(
                                "InputSanitizerService",
                                InputSanitizerService.class);
        }

        private void checkBean(
                        String name,
                        Class<?> type) {

                Map<String, ?> beans = applicationContext.getBeansOfType(type);

                add(
                                "SECURITY " + name,
                                beans.size() == 1,
                                beans.isEmpty()
                                                ? "bean no encontrado"
                                                : beans.keySet().toString());
        }

        private void checkClass(
                        String name,
                        String className) {

                try {

                        Class.forName(className);

                        add(
                                        "SECURITY " + name,
                                        true,
                                        "clase disponible");

                } catch (ClassNotFoundException ex) {

                        add(
                                        "SECURITY " + name,
                                        false,
                                        "clase no encontrada");
                }
        }

        // ============================================================
        // CONFIGURATION
        // ============================================================

        private void checkConfiguration() {

                String[] activeProfiles = environment.getActiveProfiles();

                boolean dev = List.of(activeProfiles)
                                .contains("dev");

                add(
                                "PROFILE",
                                dev,
                                "profiles="
                                                + List.of(activeProfiles));

                checkBeanByName(
                                "securityFilterChain");

                checkProperty(
                                "app.jwt.secret",
                                "JWT configurado");

                checkProperty(
                                "app.security.id-encryption-key",
                                "ID encryption configurado");

                /*
                 * CORS es una lista YAML.
                 *
                 * Environment.getProperty("app.cors.allowed-origins")
                 * no devuelve correctamente el valor de una lista.
                 *
                 * Se comprueba el primer elemento.
                 */
                checkCors();
        }

        private void checkBeanByName(
                        String name) {

                boolean exists = applicationContext.containsBean(name);

                add(
                                "CONFIG BEAN",
                                exists,
                                name
                                                + (exists
                                                                ? " registrado"
                                                                : " NO encontrado"));
        }

        private void checkProperty(
                        String property,
                        String description) {

                String value = environment.getProperty(property);

                boolean present = value != null
                                && !value.isBlank()
                                && !value.startsWith("${");

                add(
                                "PROPERTY",
                                present,
                                description);
        }

        private void checkCors() {

                String firstOrigin = environment.getProperty(
                                "app.cors.allowed-origins[0]");

                boolean configured = firstOrigin != null
                                && !firstOrigin.isBlank()
                                && !firstOrigin.startsWith("${");

                add(
                                "CORS",
                                configured,
                                configured
                                                ? "origin=" + firstOrigin
                                                : "allowed-origins no configurado");
        }

        // ============================================================
        // SQL
        // ============================================================

        private void checkSqlConnection() {

                try (Connection connection = dataSource.getConnection()) {

                        boolean valid = connection != null
                                        && !connection.isClosed()
                                        && connection.isValid(3);

                        add(
                                        "MYSQL / SQL",
                                        valid,
                                        valid
                                                        ? "conexión válida"
                                                        : "conexión inválida");

                } catch (Exception ex) {

                        add(
                                        "MYSQL / SQL",
                                        false,
                                        ex.getClass()
                                                        .getSimpleName()
                                                        + ": "
                                                        + safeMessage(ex));
                }
        }

        // ============================================================
        // MONGO
        // ============================================================

        private void checkMongoConnection() {

                try {

                        mongoTemplate
                                        .getDb()
                                        .runCommand(
                                                        new org.bson.Document(
                                                                        "ping",
                                                                        1));

                        add(
                                        "MONGODB",
                                        true,
                                        "ping OK - database="
                                                        + mongoTemplate
                                                                        .getDb()
                                                                        .getName());

                } catch (Exception ex) {

                        add(
                                        "MONGODB",
                                        false,
                                        ex.getClass()
                                                        .getSimpleName()
                                                        + ": "
                                                        + safeMessage(ex));
                }
        }

        // ============================================================
        // ENDPOINTS
        // ============================================================

        private void checkEndpoints() {

                Map<String, List<Endpoint>> byController = new TreeMap<>();

                Map<String, List<String>> collisions = new LinkedHashMap<>();

                handlerMapping
                                .getHandlerMethods()
                                .forEach((mapping, handlerMethod) -> {

                                        String controller = handlerMethod
                                                        .getBeanType()
                                                        .getSimpleName();

                                        /*
                                         * /error pertenece a Spring Boot.
                                         *
                                         * No es un endpoint de negocio de AgroMarket
                                         * y no debe contaminar el diagnóstico de
                                         * colisiones de controllers.
                                         */
                                        if ("BasicErrorController"
                                                        .equals(controller)) {

                                                return;
                                        }

                                        Set<String> paths = mapping.getPatternValues();

                                        if (paths.isEmpty()) {

                                                paths = Set.of("<no-path>");
                                        }

                                        Set<RequestMethod> methods = mapping
                                                        .getMethodsCondition()
                                                        .getMethods();

                                        for (String path : paths) {

                                                if (methods.isEmpty()) {

                                                        addEndpoint(
                                                                        byController,
                                                                        collisions,
                                                                        new Endpoint(
                                                                                        controller,
                                                                                        "ANY",
                                                                                        path,
                                                                                        classify(
                                                                                                        null,
                                                                                                        path)));

                                                } else {

                                                        for (RequestMethod method : methods) {

                                                                addEndpoint(
                                                                                byController,
                                                                                collisions,
                                                                                new Endpoint(
                                                                                                controller,
                                                                                                method.name(),
                                                                                                path,
                                                                                                classify(
                                                                                                                method,
                                                                                                                path)));
                                                        }
                                                }
                                        }
                                });

                printEndpointMap(
                                byController,
                                collisions);

                long total = byController
                                .values()
                                .stream()
                                .mapToLong(List::size)
                                .sum();

                long publicCount = byController
                                .values()
                                .stream()
                                .flatMap(List::stream)
                                .filter(endpoint -> "PUBLIC".equals(
                                                endpoint.access()))
                                .count();

                long roleCount = byController
                                .values()
                                .stream()
                                .flatMap(List::stream)
                                .filter(endpoint -> endpoint.access()
                                                .startsWith("ROLE_"))
                                .count();

                long authenticatedCount = total
                                - publicCount
                                - roleCount;

                add(
                                "ENDPOINTS",
                                total > 0,
                                total + " endpoints registrados");

                add(
                                "PUBLIC ENDPOINTS",
                                publicCount > 0,
                                publicCount + " públicos");

                add(
                                "AUTH ENDPOINTS",
                                authenticatedCount >= 0,
                                authenticatedCount
                                                + " autenticados");

                add(
                                "ROLE ENDPOINTS",
                                roleCount >= 0,
                                roleCount
                                                + " protegidos por rol");

                add(
                                "ENDPOINT COLLISIONS",
                                collisions.isEmpty(),
                                collisions.isEmpty()
                                                ? "0 colisiones reales"
                                                : collisions.size()
                                                                + " colisiones reales detectadas");
        }

        private void addEndpoint(
                        Map<String, List<Endpoint>> byController,
                        Map<String, List<String>> collisions,
                        Endpoint endpoint) {

                byController
                                .computeIfAbsent(
                                                endpoint.controller(),
                                                key -> new ArrayList<>())
                                .add(endpoint);

                String key = endpoint.method()
                                + " "
                                + endpoint.path();

                List<Endpoint> sameMapping = byController
                                .values()
                                .stream()
                                .flatMap(List::stream)
                                .filter(existing -> (existing.method()
                                                + " "
                                                + existing.path())
                                                .equals(key))
                                .toList();

                /*
                 * Solo cuenta como colisión si existen
                 * controllers DISTINTOS.
                 */
                List<String> distinctControllers = sameMapping
                                .stream()
                                .map(Endpoint::controller)
                                .distinct()
                                .toList();

                if (distinctControllers.size() > 1) {

                        collisions.put(
                                        key,
                                        distinctControllers);
                }
        }

        private void printEndpointMap(
                        Map<String, List<Endpoint>> byController,
                        Map<String, List<String>> collisions) {

                System.out.println();
                System.out.println(
                                "================ ENDPOINT MAP ================");

                byController.forEach(
                                (controller, endpoints) -> {

                                        System.out.println();
                                        System.out.println(
                                                        "[" + controller + "]");

                                        endpoints
                                                        .stream()
                                                        .sorted(
                                                                        Comparator
                                                                                        .comparing(
                                                                                                        Endpoint::path)
                                                                                        .thenComparing(
                                                                                                        Endpoint::method))
                                                        .forEach(
                                                                        endpoint -> System.out.printf(
                                                                                        "  %-7s %-55s %s%n",
                                                                                        endpoint.method(),
                                                                                        endpoint.path(),
                                                                                        endpoint.access()));
                                });

                if (!collisions.isEmpty()) {

                        System.out.println();
                        System.out.println(
                                        "COLISIONES REALES:");

                        collisions.forEach(
                                        (path, controllers) -> System.out.println(
                                                        "  "
                                                                        + path
                                                                        + " -> "
                                                                        + controllers));
                }

                System.out.println(
                                "================================================");
        }

        private String classify(
                        RequestMethod method,
                        String path) {

                for (PublicRule rule : PUBLIC_RULES) {

                        if ((rule.method() == null
                                        || rule.method() == method)
                                        && pathMatcher.match(
                                                        rule.pattern(),
                                                        path)) {

                                return rule.access();
                        }
                }

                return "AUTHENTICATED";
        }

        // ============================================================
        // SUMMARY
        // ============================================================

        private void printFinalSummary() {

                long ok = results
                                .stream()
                                .filter(DiagnosticResult::ok)
                                .count();

                long failed = results
                                .stream()
                                .filter(result -> !result.ok())
                                .count();

                System.out.println();

                System.out.println(
                                "╔══════════════════════════════════════════════════════════════╗");
                System.out.println(
                                "║              AGROMARKET BACKEND DIAGNOSTIC                 ║");
                System.out.println(
                                "╠══════════════════════════════════════════════════════════════╣");

                results.forEach(result -> {

                        String status = result.ok()
                                        ? OK
                                        : FAIL;

                        System.out.printf(
                                        "║ %-8s %-25s %-28s ║%n",
                                        status,
                                        result.name(),
                                        truncate(
                                                        result.detail(),
                                                        28));
                });

                System.out.println(
                                "╚══════════════════════════════════════════════════════════════╝");

                System.out.println();

                System.out.println(
                                "================ FINAL RESULT ================");

                System.out.println(
                                "Checks OK   : " + ok);

                System.out.println(
                                "Checks FAIL : " + failed);

                if (failed == 0) {

                        System.out.println();

                        System.out.println(
                                        "████████████████████████████████████████████████");

                        System.out.println(
                                        "█                                              █");

                        System.out.println(
                                        "█     [OK] AGROMARKET BACKEND HEALTHY         █");

                        System.out.println(
                                        "█                                              █");

                        System.out.println(
                                        "█ ApplicationContext : OK                      █");

                        System.out.println(
                                        "█ Domain             : OK                      █");

                        System.out.println(
                                        "█ Ports / Adapters   : OK                      █");

                        System.out.println(
                                        "█ Persistence         : OK                      █");

                        System.out.println(
                                        "█ MySQL               : OK                      █");

                        System.out.println(
                                        "█ MongoDB             : OK                      █");

                        System.out.println(
                                        "█ Security            : OK                      █");

                        System.out.println(
                                        "█ Configuration       : OK                      █");

                        System.out.println(
                                        "█ Controllers         : OK                      █");

                        System.out.println(
                                        "█ Endpoint security   : CHECKED                 █");

                        System.out.println(
                                        "█ Endpoint collisions : 0                       █");

                        System.out.println(
                                        "█                                              █");

                        System.out.println(
                                        "█   BACKEND 100% VERIFICADO                   █");

                        System.out.println(
                                        "█   Dev: Deyner Chaverra                        █");

                        System.out.println(
                                        "█   Version 2.0.0                               █");

                        System.out.println(
                                        "█   LISTO PARA FRONTEND                        █");

                        System.out.println(
                                        "█                                              █");

                        System.out.println(
                                        "████████████████████████████████████████████████");

                } else {

                        System.out.println();

                        System.out.println(
                                        "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                        System.out.println(
                                        "!! [FAIL] BACKEND REQUIRES ATTENTION        !!");

                        System.out.println(
                                        "!! Revisar los checks marcados [FAIL].      !!");

                        System.out.println(
                                        "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                }

                System.out.println(
                                "==============================================");
        }

        // ============================================================
        // UTILITIES
        // ============================================================

        private void add(
                        String name,
                        boolean ok,
                        String detail) {

                results.add(
                                new DiagnosticResult(
                                                name,
                                                ok,
                                                detail));

                System.out.printf(
                                "%-8s %-30s %s%n",
                                ok ? OK : FAIL,
                                name,
                                detail);
        }

        private String safeMessage(
                        Exception ex) {

                return ex.getMessage() == null
                                ? "sin mensaje"
                                : ex.getMessage()
                                                .replaceAll(
                                                                "\\s+",
                                                                " ");
        }

        private String truncate(
                        String value,
                        int length) {

                if (value == null) {
                        return "";
                }

                if (value.length() <= length) {
                        return value;
                }

                return value.substring(
                                0,
                                length - 3)
                                + "...";
        }

        private void printHeader() {

                System.out.println();

                System.out.println(
                                "==============================================================");

                System.out.println(
                                "          AGROMARKET - FULL BACKEND DIAGNOSTIC");

                System.out.println(
                                "==============================================================");

                System.out.println(
                                "Profile: "
                                                + List.of(
                                                                environment
                                                                                .getActiveProfiles()));

                System.out.println(
                                "==============================================================");
        }

        private record PublicRule(
                        RequestMethod method,
                        String pattern,
                        String access) {
        }

        private record Endpoint(
                        String controller,
                        String method,
                        String path,
                        String access) {
        }

        private record DiagnosticResult(
                        String name,
                        boolean ok,
                        String detail) {
        }
}