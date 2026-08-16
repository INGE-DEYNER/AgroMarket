package com.agromarket.application.adapters.persistence.mongodb.adapters.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.admin.AdminDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.admin.AdminMongoRepository;
import com.agromarket.domain.models.admin.Admin;
import com.agromarket.domain.ports.out.admin.AdminPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminMongoAdapter implements AdminPort {

    private final AdminMongoRepository repository;

    @Override
    public Admin save(Admin admin) {
        return repository.save(AdminDocument.fromDomain(admin))
                .toDomain();
    }

    @Override
    public Optional<Admin> findById(Long id) {
        return repository.findById(id.toString())
                .map(AdminDocument::toDomain);
    }

    @Override
    public Optional<Admin> findByUserId(Long userId) {
        return repository.findByUserId(userId)
                .map(AdminDocument::toDomain);
    }

    @Override
    public List<Admin> findActive() {
        return repository.findByActiveTrue()
                .stream()
                .map(AdminDocument::toDomain)
                .toList();
    }
}
