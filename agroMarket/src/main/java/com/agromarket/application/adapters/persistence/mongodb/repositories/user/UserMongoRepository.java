package com.agromarket.application.adapters.persistence.mongodb.repositories.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.agromarket.application.adapters.persistence.mongodb.documents.user.UserDocument;

public interface UserMongoRepository extends MongoRepository<UserDocument, String> {

    Optional<UserDocument> findByDomainId(Long domainId);

    Optional<UserDocument> findByEmail(String email);

    List<UserDocument> findByRole(com.agromarket.domain.models.enums.user.Role role);

    boolean existsByEmail(String email);

    Optional<UserDocument> findByEmailVerificationToken(String token);

    Optional<UserDocument> findByPasswordResetToken(String token);
}
