package com.agromarket.application.usecases.admin;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.exceptions.admin.AdminNotFoundException;
import com.agromarket.domain.models.admin.Admin;
import com.agromarket.domain.models.enums.admin.AdminAction;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.admin.AdminPort;
import com.agromarket.domain.services.admin.AdminService;
import com.agromarket.domain.ports.out.user.UserPort;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUseCase implements AdminPort {

    private final com.agromarket.domain.ports.out.admin.AdminPort adminPersistencePort;
    private final UserPort userPort;
    private final AdminService adminService;

    @Override
    @Transactional(readOnly = true)
    public Admin getAdminByUserId(Long userId) {
        return adminPersistencePort.findByUserId(userId)
                .orElseThrow(() -> new AdminNotFoundException(
                        "No existe un administrador para el usuario con id "
                                + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canPerform(
            Long userId,
            AdminAction action) {

        Admin admin = getAdminByUserId(userId);

        return adminService.canPerform(admin, action);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Admin> getActiveAdmins() {
        return adminPersistencePort.findActive();
    }

    @Override
    @Transactional
    public Admin promoteToAdmin(Long userId) {
        User user = userPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el usuario con id " + userId));

        if (!adminService.isAuthorizedAdmin(user)) {
            throw new IllegalArgumentException(
                    "El usuario no está autorizado para ser administrador");
        }

        return adminPersistencePort.findByUserId(userId)
                .map(existing -> {
                    if (existing.isActive()) {
                        return existing;
                    }

                    existing.setActive(true);
                    return adminPersistencePort.save(existing);
                })
                .orElseGet(() -> {
                    Admin admin = Admin.builder()
                            .user(user)
                            .active(true)
                            .createdAt(LocalDateTime.now())
                            .build();

                    return adminPersistencePort.save(admin);
                });
    }

    @Override
    @Transactional
    public Admin deactivateAdmin(Long adminId) {
        Admin admin = adminPersistencePort.findById(adminId)
                .orElseThrow(() -> new AdminNotFoundException(
                        "No existe el administrador con id " + adminId));

        if (!admin.isActive()) {
            return admin;
        }

        admin.setActive(false);
        return adminPersistencePort.save(admin);
    }
}
