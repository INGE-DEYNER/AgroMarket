package com.agromarket.application.service.impl;

import com.agromarket.application.service.CuponDescuentoService;
import com.agromarket.domain.model.TipoCupon;
import com.agromarket.infrastructure.persistence.entity.CuponDescuento;
import com.agromarket.infrastructure.persistence.repository.CuponDescuentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CuponDescuentoServiceImpl implements CuponDescuentoService {

    private final CuponDescuentoRepository repository;

    @Override
    @Transactional
    public CuponDescuento generarCuponPrimerEnvio(Long usuarioId) {
        String random4 = String.format("%04d", new Random().nextInt(10000));
        String codigo = "PRIMER-" + usuarioId + "-" + random4;

        CuponDescuento cupon = CuponDescuento.builder()
                .codigo(codigo)
                .tipo(TipoCupon.ENVIO_GRATIS)
                .valor(BigDecimal.ZERO)
                .montoMinimo(new BigDecimal("150000"))
                .usuarioId(usuarioId)
                .usado(false)
                .fechaExpiracion(LocalDateTime.now().plusDays(90))
                .build();

        return repository.save(cupon);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> validarCupon(String codigo, BigDecimal totalPedido) {
        Optional<CuponDescuento> opt = repository.findByCodigo(codigo);
        Map<String, Object> res = new HashMap<>();

        if (opt.isEmpty()) {
            res.put("valido", false);
            res.put("mensaje", "El cupón no existe");
            return res;
        }

        CuponDescuento cupon = opt.get();
        if (cupon.isUsado()) {
            res.put("valido", false);
            res.put("mensaje", "El cupón ya ha sido usado");
            return res;
        }

        if (cupon.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            res.put("valido", false);
            res.put("mensaje", "El cupón ha expirado");
            return res;
        }

        if (totalPedido.compareTo(cupon.getMontoMinimo()) < 0) {
            res.put("valido", false);
            res.put("mensaje", "El monto mínimo para usar este cupón es " + cupon.getMontoMinimo() + " COP");
            return res;
        }

        res.put("valido", true);
        res.put("tipo", cupon.getTipo().name());
        res.put("valor", cupon.getValor());
        res.put("mensaje", "Cupón válido");
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CuponDescuento> obtenerCuponesUsuario(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId);
    }
}
