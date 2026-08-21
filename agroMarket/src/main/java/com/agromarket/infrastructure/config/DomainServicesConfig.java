package com.agromarket.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
import com.agromarket.domain.services.user.TwoFactorService;
import com.agromarket.domain.services.user.TokenValidationService;
import com.agromarket.domain.services.user.UserService;

@Configuration
public class DomainServicesConfig {

    @Bean
    public AdminService adminService() {
        return new AdminService();
    }

    @Bean
    public CouponService couponService() {
        return new CouponService();
    }

    @Bean
    public ImageService imageService() {
        return new ImageService();
    }

    @Bean
    public MessagingService messagingService() {
        return new MessagingService();
    }

    @Bean
    public OrderService orderService() {
        return new OrderService();
    }

    @Bean
    public InvoiceService invoiceService() {
        return new InvoiceService();
    }

    @Bean
    public PaymentService paymentService() {
        return new PaymentService();
    }

    @Bean
    public ProductService productService() {
        return new ProductService();
    }

    @Bean
    public ProductStockService productStockService() {
        return new ProductStockService();
    }

    @Bean
    public ReviewService reviewService() {
        return new ReviewService();
    }

    @Bean
    public QuoteOfferService quoteOfferService() {
        return new QuoteOfferService();
    }

    @Bean
    public RequestForQuoteService requestForQuoteService() {
        return new RequestForQuoteService();
    }

    @Bean
    public ShippingService shippingService() {
        return new ShippingService();
    }

    @Bean
    public PasswordPolicyService passwordPolicyService() {
        return new PasswordPolicyService();
    }

    @Bean
    public TwoFactorService twoFactorService() {
        return new TwoFactorService();
    }

    @Bean
    public TokenValidationService tokenValidationService() {
        return new TokenValidationService();
    }

    @Bean
    public UserService userService() {
        return new UserService();
    }
}