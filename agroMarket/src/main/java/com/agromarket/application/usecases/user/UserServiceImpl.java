package com.agromarket.application.usecases.user;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.dto.request.user.UpdateProfileRequest;
import com.agromarket.application.dto.response.user.UserResponse;
import com.agromarket.application.mappers.UserMapper;
import com.agromarket.domain.user.exceptions.ResourceNotFoundException;
import com.agromarket.domain.user.model.User;
import com.agromarket.domain.user.ports.in.UserService;
import com.agromarket.domain.user.ports.out.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de usuarios que orquesta las operaciones de negocio
 * relacionadas con la gestión de usuarios.
 * 
 * <p>Este servicio actúa como intermediario entre los controladores REST y el dominio,
 * manejando la lógica de aplicación y delegando las operaciones de persistencia a los
 * adaptadores correspondientes.</p>
 * 
 * @author AgroMarket Team
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return userMapper.toResponse(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return userMapper.toResponse(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        List<User> users = userRepository.findAll();
        return userMapper.toResponseList(users);
    }
    
    @Override
    @Transactional
    public UserResponse update(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        
        userMapper.updateUserFromRequest(request, user);
        User updatedUser = userRepository.save(user);
        
        return userMapper.toResponse(updatedUser);
    }
    
    @Override
    @Transactional
    public UserResponse updateProfile(Long id, UpdateProfileRequest request) {
        return update(id, request);
    }
    
    @Override
    @Transactional
    public void changePassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        
        user.setPassword(newPassword);
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void enable(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        
        user.setActive(true);
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void disable(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        
        user.setActive(false);
        userRepository.save(user);
    }
}
