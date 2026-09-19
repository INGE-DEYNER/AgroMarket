package com.agromarket.application.adapters.persistence.sql.entities.payment;

import java.time.LocalDateTime;

import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.enums.payment.CardStatus;
import com.agromarket.domain.models.enums.payment.CardType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tarjeta tokenizada por la pasarela.
 *
 * <p>
 * NUNCA se almacena el PAN (número completo) ni el CVV. Únicamente se
 * persisten datos NO sensibles: el token emitido por la pasarela, la marca,
 * los últimos cuatro dígitos y la expiración informativa (mes/año).
 * </p>
 */
@Entity
@Table(name = "credit_cards", indexes = @Index(name = "idx_credit_cards_user", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class CreditCardEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CardType cardType;

    @Column(nullable = false, length = 4)
    private String lastFourDigits;

    @Column(nullable = false, length = 512)
    private String gatewayToken;

    /** Proveedor de tokenización (MERCADO_PAGO por defecto). */
    @Column(length = 40)
    private String provider = "MERCADO_PAGO";

    /** Mes de expiración (1-12). Dato NO sensible. */
    @Column(name = "expiration_month")
    private Integer expirationMonth;

    /** Año de expiración (p. ej. 2030). Dato NO sensible. */
    @Column(name = "expiration_year")
    private Integer expirationYear;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CardStatus status = CardStatus.ACTIVE;

    @Column(nullable = false)
    private boolean isDefault;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = CardStatus.ACTIVE;
        }
        if (provider == null || provider.isBlank()) {
            provider = "MERCADO_PAGO";
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
