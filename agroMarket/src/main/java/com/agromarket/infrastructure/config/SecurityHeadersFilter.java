package 	com.agromarket.infrastructure.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Prevent MIME type sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");
        // Clickjacking protection
        response.setHeader("X-Frame-Options", "DENY");
        // XSS protection (legacy)
        response.setHeader("X-XSS-Protection", "1; mode=block");
        // Content Security Policy minimal
        response.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https: https://static.cloudflareinsights.com https://sdk.mercadopago.com https://*.mercadopago.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.agro-market.app https://www.agro-market.app https://static.cloudflareinsights.com https://fonts.googleapis.com https://fonts.gstatic.com;");
        // Referrer policy
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        // HSTS (only over HTTPS in production)
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

        filterChain.doFilter(request, response);
    }
}
