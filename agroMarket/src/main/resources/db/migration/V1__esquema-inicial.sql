/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admins_user` (`user_id`),
  CONSTRAINT `FKgc8dtql9mkq268detxiox7fpm` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_config` (
  `clave` varchar(100) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `valor` decimal(19,4) DEFAULT NULL,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_access_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `details` varchar(2000) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','BUYER','PRODUCER') DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `success` bit(1) NOT NULL,
  `user_agent` varchar(1000) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_auth_event_user_created` (`user_id`,`created_at`),
  KEY `idx_auth_event_email_created` (`email`,`created_at`),
  CONSTRAINT `FKhw590a4wbdgy10r5196ibmdap` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=268 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `expiration_date` datetime(6) DEFAULT NULL,
  `minimum_amount` decimal(19,2) DEFAULT NULL,
  `type` enum('FIXED_AMOUNT','FREE_SHIPPING','PERCENTAGE') NOT NULL,
  `used` bit(1) NOT NULL,
  `value` decimal(19,2) DEFAULT NULL,
  `version` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupons_code` (`code`),
  KEY `FKhb27gggactdhu0i65fwiaxb0r` (`user_id`),
  CONSTRAINT `FKhb27gggactdhu0i65fwiaxb0r` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_cards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `card_type` enum('AMEX','DINERS','DISCOVER','MASTERCARD','OTHER','VISA') NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expiration_month` int DEFAULT NULL,
  `expiration_year` int DEFAULT NULL,
  `gateway_token` varchar(512) NOT NULL,
  `is_default` bit(1) NOT NULL,
  `last_four_digits` varchar(4) NOT NULL,
  `provider` varchar(40) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','INVALID') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_credit_cards_user` (`user_id`),
  CONSTRAINT `FKn1thfi0pev97g7g4oreo6g4yw` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(255) DEFAULT NULL,
  `issue_date` datetime(6) DEFAULT NULL,
  `subtotal` decimal(38,2) DEFAULT NULL,
  `tax` decimal(38,2) DEFAULT NULL,
  `total` decimal(38,2) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4ko3y00tkkk2ya3p6wnefjj2f` (`order_id`),
  CONSTRAINT `FK4ko3y00tkkk2ya3p6wnefjj2f` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `subtotal` decimal(19,4) NOT NULL,
  `unit_price` decimal(19,4) NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `checkout_id` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `shipping_cost` decimal(19,4) DEFAULT NULL,
  `state` enum('ACCEPTED','CANCELLED','DELIVERED','PENDING','SHIPPED') NOT NULL,
  `total` decimal(19,4) NOT NULL,
  `buyer_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_buyer` (`buyer_id`),
  KEY `idx_orders_state` (`state`),
  KEY `idx_orders_checkout` (`checkout_id`),
  CONSTRAINT `FKhtx3insd5ge6w486omk4fnk54` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(255) NOT NULL,
  `used_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_password_history_user` (`user_id`),
  CONSTRAINT `FK5pj9ewu59pb3s05n3e9ccybt1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `escrow_held_at` datetime(6) DEFAULT NULL,
  `gateway_reference` varchar(255) DEFAULT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `payment_method` tinyint DEFAULT NULL,
  `refunded_at` datetime(6) DEFAULT NULL,
  `released_at` datetime(6) DEFAULT NULL,
  `state` tinyint DEFAULT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK81gagumt0r8y3rmudcgpbk42l` (`order_id`),
  CONSTRAINT `FK81gagumt0r8y3rmudcgpbk42l` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `payments_chk_1` CHECK ((`payment_method` between 0 and 6)),
  CONSTRAINT `payments_chk_2` CHECK ((`state` between 0 and 7))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `available_quantity` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `fruit_type` enum('BANANA','COCONUT','LEMON','MANGO','ORANGE','OTHER','PASSION_FRUIT','PINEAPPLE','SOURSOP') NOT NULL,
  `image_url` varchar(1000) DEFAULT NULL,
  `minimum_wholesale_quantity` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `on_promotion` bit(1) NOT NULL,
  `price` decimal(19,4) NOT NULL,
  `promotion_end_date` datetime(6) DEFAULT NULL,
  `promotion_price` decimal(19,4) DEFAULT NULL,
  `total_sold` int NOT NULL,
  `version` bigint DEFAULT NULL,
  `wholesale_price` decimal(19,4) DEFAULT NULL,
  `producer_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_products_producer` (`producer_id`),
  KEY `idx_products_fruit_type` (`fruit_type`),
  KEY `idx_products_active` (`active`),
  CONSTRAINT `FKj064cd22853kpyth4upg0uq81` FOREIGN KEY (`producer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quote_offers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comments` varchar(2000) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `proposed_price` decimal(19,2) NOT NULL,
  `status` enum('ACCEPTED','PENDING','REJECTED') NOT NULL,
  `producer_id` bigint NOT NULL,
  `request_for_quote_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKt9ktkiy19jhli961b5pnx3cik` (`producer_id`),
  KEY `FK1r52hlr805qnwch0ys9t5a2di` (`request_for_quote_id`),
  CONSTRAINT `FK1r52hlr805qnwch0ys9t5a2di` FOREIGN KEY (`request_for_quote_id`) REFERENCES `request_for_quotes` (`id`),
  CONSTRAINT `FKt9ktkiy19jhli961b5pnx3cik` FOREIGN KEY (`producer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_for_quotes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `deadline` datetime(6) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `fruit_type` enum('BANANA','COCONUT','LEMON','MANGO','ORANGE','OTHER','PASSION_FRUIT','PINEAPPLE','SOURSOP') NOT NULL,
  `required_quantity` double NOT NULL,
  `status` enum('CLOSED','EXPIRED','OPEN') NOT NULL,
  `buyer_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKe2gk60qxu4g388o4jny4odc44` (`buyer_id`),
  CONSTRAINT `FKe2gk60qxu4g388o4jny4odc44` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_request_evidences` (
  `return_request_id` bigint NOT NULL,
  `evidence_url` varchar(1000) DEFAULT NULL,
  KEY `FKs7iqwiu2u3ixw4fgfo1yfaou4` (`return_request_id`),
  CONSTRAINT `FKs7iqwiu2u3ixw4fgfo1yfaou4` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_request_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `unit_price` decimal(19,4) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `return_request_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_return_items_request` (`return_request_id`),
  KEY `FK8teq4lamrbvwxnp01bmne0ur5` (`product_id`),
  CONSTRAINT `FK8teq4lamrbvwxnp01bmne0ur5` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKkghh7hxr9q8ku69j45rqwgh8r` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_comment` varchar(1000) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `gateway_refund_reference` varchar(120) DEFAULT NULL,
  `idempotency_key` varchar(120) DEFAULT NULL,
  `reason` varchar(60) NOT NULL,
  `refund_amount` decimal(19,4) DEFAULT NULL,
  `refunded_at` datetime(6) DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `status` enum('APPROVED','COMPLETED','REFUNDED','REJECTED','REQUESTED','UNDER_REVIEW') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `buyer_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `payment_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_returns_idempotency` (`idempotency_key`),
  KEY `idx_returns_buyer` (`buyer_id`),
  KEY `idx_returns_order` (`order_id`),
  KEY `idx_returns_status` (`status`),
  KEY `FKgdkxqlc7l73tbqrwrhx9oswxi` (`payment_id`),
  CONSTRAINT `FK2x5c7kwyx72wwpm68d19xkoey` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKbski88d6kewx0cbj5pk7nes01` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKgdkxqlc7l73tbqrwrhx9oswxi` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` varchar(2000) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `rating` int NOT NULL,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reviews_product_buyer` (`product_id`,`user_id`),
  KEY `idx_reviews_product` (`product_id`),
  KEY `idx_reviews_user` (`user_id`),
  CONSTRAINT `FKcgy7qjc1r99dp117y9en6lxye` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revoked_tokens` (
  `jti` varchar(64) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `revoked_at` datetime(6) NOT NULL,
  PRIMARY KEY (`jti`),
  KEY `idx_revoked_token_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `buyer_id` bigint DEFAULT NULL,
  `carrier` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `destination_address` varchar(255) DEFAULT NULL,
  `estimated_delivery_date` date DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `producer_id` bigint DEFAULT NULL,
  `state` tinyint DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2umyblvwmvm2ju0be634j89x4` (`order_id`),
  CONSTRAINT `FK2umyblvwmvm2ju0be634j89x4` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `shipping_chk_1` CHECK ((`state` between 0 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `address` varchar(500) NOT NULL,
  `city` varchar(160) NOT NULL,
  `is_default` bit(1) NOT NULL,
  `phone` varchar(40) NOT NULL,
  `title` varchar(80) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_user` (`user_id`),
  CONSTRAINT `FKn2fisxyyu3l9wlch3ve2nocgp` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_approved` bit(1) DEFAULT NULL,
  `active` bit(1) NOT NULL,
  `address_reference` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `country_code` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_token_expiry` datetime(6) DEFAULT NULL,
  `email_verification_token` varchar(512) DEFAULT NULL,
  `email_verified` bit(1) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `full_address` varchar(1000) DEFAULT NULL,
  `id_number` varchar(255) DEFAULT NULL,
  `id_type` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `nit` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `password_reset_token` varchar(512) DEFAULT NULL,
  `password_reset_token_expiry` datetime(6) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `preferred_currency` varchar(255) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','BUYER','PRODUCER') NOT NULL,
  `totp_enabled` bit(1) NOT NULL,
  `totp_secret` varchar(512) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wishlist_user_product` (`user_id`,`product_id`),
  KEY `FKl7ao98u2bm8nijc1rv4jobcrx` (`product_id`),
  CONSTRAINT `FK330pyw2el06fn5g28ypyljt16` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKl7ao98u2bm8nijc1rv4jobcrx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
