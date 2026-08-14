package com.agromarket.infrastructure.persistence.sql.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.user.enums.Role;
import com.agromarket.infrastructure.persistence.sql.entities.UserEntity;

/**
 * Repositorio JPA para la entidad UserEntity.
 * Proporciona métodos de consulta para la persistencia de usuarios en la base de datos.
 * 
 * <p>Extiende JpaRepository para heredar métodos CRUD básicos y añade consultas personalizadas
 * específicas para el dominio de usuarios de AgroMarket.</p>
 * 
 * @author AgroMarket Team
 */
public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {
    
    /**
     * Busca un usuario por su correo electrónico.
     * 
     * @param email correo electrónico del usuario
     * @return Optional con el usuario si existe
     */
    Optional<UserEntity> findByEmail(String email);
    
    /**
     * Verifica si existe un usuario con el correo electrónico dado.
     * 
     * @param email correo electrónico a verificar
     * @return true si existe, false de lo contrario
     */
    boolean existsByEmail(String email);
    
    /**
     * Verifica si existe un usuario con el teléfono dado.
     * 
     * @param phone número de teléfono a verificar
     * @return true si existe, false de lo contrario
     */
    boolean existsByPhone(String phone);
    
    /**
     * Busca un usuario por su ID de Google.
     * 
     * @param googleId ID de Google del usuario
     * @return Optional con el usuario si existe
     */
    Optional<UserEntity> findByGoogleId(String googleId);
    
    /**
     * Busca usuarios por rol y estado de aprobación.
     * 
     * @param role rol del usuario
     * @return lista de usuarios que cumplen los criterios
     */
    List<UserEntity> findByRoleAndAccountApprovedFalse(Role role);
    
    /**
     * Busca un usuario por su token de verificación de email.
     * 
     * @param token token de verificación
     * @return Optional con el usuario si existe
     */
    Optional<UserEntity> findByEmailVerificationToken(String token);
    
    /**
     * Busca un usuario por su token de verificación de teléfono.
     * 
     * @param token token de verificación
     * @return Optional con el usuario si existe
     */
    Optional<UserEntity> findByPhoneVerificationToken(String token);
    
    /**
     * Busca un usuario por su número de teléfono.
     * 
     * @param phone número de teléfono
     * @return Optional con el usuario si existe
     */
    Optional<UserEntity> findByPhone(String phone);
    
    /**
     * Busca usuarios por estado de cuenta.
     * 
     * @param accountStatus estado de la cuenta
     * @return lista de usuarios con el estado dado
     */
    List<UserEntity> findByAccountStatus(String accountStatus);
    
    /**
     * Busca un usuario por su token de recuperación de contraseña.
     * 
     * @param token token de recuperación
     * @return Optional con el usuario si existe
     */
    Optional<UserEntity> findByPasswordResetToken(String token);
    
    /**
     * Busca todos los productores (usuarios con rol PRODUCER).
     * 
     * @return lista de todos los productores
     */
    @Query("SELECT u FROM UserEntity u WHERE u.role = 'PRODUCER'")
    List<UserEntity> findAllProducers();
    
    /**
     * Cuenta el número total de productores.
     * 
     * @return número de productores
     */
    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.role = 'PRODUCER'")
    long countProducers();
    
    /**
     * Obtiene el hash de la contraseña de un usuario por su ID.
     * 
     * @param id ID del usuario
     * @return Optional con el hash de la contraseña
     */
    @Query("SELECT u.password FROM UserEntity u WHERE u.id = :id")
    Optional<String> findPasswordHashById(@Param("id") Long id);
    
    /**
     * Busca usuarios por nombre o correo electrónico (búsqueda paginada).
     * 
     * @param search término de búsqueda
     * @param pageable información de paginación
     * @return página de resultados
     */
    @Query("SELECT u FROM UserEntity u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<UserEntity> searchUsers(@Param("search") String search, Pageable pageable);
    
    /**
     * Actualiza el rol de un usuario de forma nativa.
     * 
     * @param id ID del usuario
     * @param role nuevo rol
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = "UPDATE usuarios SET rol = :role WHERE id = :id", nativeQuery = true)
    void updateUserRoleNatively(@Param("id") Long id, @Param("role") String role);
    
    /**
     * Actualiza el estado de aprobación de un usuario de forma nativa.
     * 
     * @param id ID del usuario
     * @param approved estado de aprobación
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = "UPDATE usuarios SET cuenta_aprobada = :approved WHERE id = :id", nativeQuery = true)
    void updateUserApprovalNatively(@Param("id") Long id, @Param("approved") boolean approved);
}
