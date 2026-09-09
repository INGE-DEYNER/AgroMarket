package com.agromarket.application.adapters.persistence.mongodb.documents.config;

import java.math.BigDecimal;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "app_config")
public class AppConfigDocument {

    @Id
    private String clave;

    private BigDecimal valor;
}