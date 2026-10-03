package com.agromarket.application.adapters.persistence.sql.entities.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_addresses", indexes = @Index(name = "idx_addresses_user", columnList = "user_id"))
@Getter @Setter @NoArgsConstructor
public class AddressEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
    @Column(nullable = false, length = 80) private String title;
    @Column(nullable = false, length = 500) private String address;
    @Column(nullable = false, length = 160) private String city;
    @Column(nullable = false, length = 40) private String phone;
    @Column(nullable = false) private boolean isDefault;
    @Column(nullable = false) private boolean active = true;
}
