package com.agromarket.application.service;

import java.util.List;
import java.util.Objects;

import com.agromarket.application.dto.CambiarContrasenaRequest;
import com.agromarket.application.dto.ActualizarUsuarioRequest;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.mapper.UsuarioMapper;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicyService passwordPolicyService;

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getById(Long id) {
        return usuarioMapper.toResponse(findUsuario(Objects.requireNonNull(id, "id")));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse getPerfil(Long id) {
        return getById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> getAll() {
        return usuarioMapper.toResponseList(usuarioJpaRepository.findAll());
    }

    @Override
    @Transactional
    public UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request) {
        UsuarioEntity usuario = findUsuario(Objects.requireNonNull(id, "id"));
        if (request.getNombre() != null) usuario.setNombre(request.getNombre().trim());
        if (request.getApellido() != null) usuario.setApellido(request.getApellido().trim());
        if (request.getTelefono() != null) usuario.setTelefono(request.getTelefono().trim());
        if (request.getCodigoPais() != null) usuario.setCodigoPais(request.getCodigoPais().trim());
        if (request.getUbicacion() != null) usuario.setUbicacion(request.getUbicacion().trim());
        if (request.getCedula() != null) usuario.setCedula(request.getCedula().trim());
        if (request.getFechaNacimiento() != null) usuario.setFechaNacimiento(request.getFechaNacimiento());
        if (request.getTipoDocumento() != null) usuario.setTipoDocumento(request.getTipoDocumento().trim());
        if (request.getNombreEmpresa() != null) usuario.setNombreEmpresa(request.getNombreEmpresa().trim());
        if (request.getNit() != null) usuario.setNit(request.getNit().trim());
        if (request.getFotoUrl() != null) {
            usuario.setFotoUrl(request.getFotoUrl().trim());
            usuario.setFoto(request.getFotoUrl().trim());
        }
        if (request.getDivisaPreferida() != null) usuario.setDivisaPreferida(request.getDivisaPreferida().trim());
        if (request.getDepartamento() != null) usuario.setDepartamento(request.getDepartamento().trim());
        if (request.getCiudad() != null) usuario.setCiudad(request.getCiudad().trim());
        if (request.getDireccionCompleta() != null) usuario.setDireccionCompleta(request.getDireccionCompleta().trim());
        if (request.getReferencia() != null) usuario.setReferencia(request.getReferencia().trim());
        if (request.getCodigoPostal() != null) usuario.setCodigoPostal(request.getCodigoPostal().trim());

        boolean complete = usuario.getCedula() != null && !usuario.getCedula().isBlank() && usuario.getFechaNacimiento() != null;
        usuario.setCuentaCompleta(complete);
        usuario.setActualizadoEn(java.time.LocalDateTime.now());

        return usuarioMapper.toResponse(usuarioJpaRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponse actualizarPerfil(Long id, ActualizarUsuarioRequest request) {
        return actualizar(id, request);
    }

    @Override
    @Transactional
    public void actualizarContrasena(Long id, CambiarContrasenaRequest request) {
        UsuarioEntity usuario = findUsuario(Objects.requireNonNull(id, "id"));
        if (!passwordEncoder.matches(request.getContrasenaActual(), usuario.getContrasena())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }
        passwordPolicyService.validarContrasenaNueva(usuario, request.getNuevaContrasena());
        usuario.setContrasena(passwordEncoder.encode(request.getNuevaContrasena()));
        UsuarioEntity guardado = usuarioJpaRepository.save(usuario);
        passwordPolicyService.registrarContrasenaEnHistorial(guardado);
    }

    @Override
    @Transactional
    public void habilitar(Long id) {
        UsuarioEntity usuario = findUsuario(Objects.requireNonNull(id, "id"));
        usuario.setActivo(true);
        usuarioJpaRepository.save(usuario);
    }

    @Override
    @Transactional
    public void deshabilitar(Long id) {
        UsuarioEntity usuario = findUsuario(Objects.requireNonNull(id, "id"));
        usuario.setActivo(false);
        usuarioJpaRepository.save(usuario);
    }

    private UsuarioEntity findUsuario(Long id) {
        return usuarioJpaRepository.findById(Objects.requireNonNull(id, "id"))
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }
}
