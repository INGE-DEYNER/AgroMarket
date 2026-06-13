package com.agromarket.application.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.agromarket.application.dto.RfqRequest;
import com.agromarket.application.dto.RfqOfertaRequest;
import com.agromarket.application.dto.RfqResponse;
import com.agromarket.application.dto.RfqOfertaResponse;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.model.EstadoPedido;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;
import com.agromarket.infrastructure.persistence.entity.ProductoEntity;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.infrastructure.persistence.entity.RfqEntity;
import com.agromarket.infrastructure.persistence.entity.RfqOfertaEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.PedidoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.RfqJpaRepository;
import com.agromarket.infrastructure.persistence.repository.RfqOfertaJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings({"null", "unused"})
public class RfqServiceImpl implements RfqService {
    private final RfqJpaRepository rfqJpaRepository;
    private final RfqOfertaJpaRepository rfqOfertaJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final ProductoJpaRepository productoJpaRepository;
    private final PedidoJpaRepository pedidoJpaRepository;

    @Override
    @Transactional
    public RfqResponse crear(RfqRequest request, Long compradorId) {
        UsuarioEntity comprador = usuarioJpaRepository.findById(compradorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Comprador no encontrado"));

        RfqEntity rfq = RfqEntity.builder()
                .comprador(comprador)
                .tipoFruta(request.getTipoFruta())
                .cantidadRequerida(request.getCantidadRequerida())
                .descripcion(request.getDescripcion())
                .fechaLimite(request.getFechaLimite())
                .activo(true)
                .build();

        return toResponse(rfqJpaRepository.save(rfq));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RfqResponse> getActivas() {
        return rfqJpaRepository.findByActivoTrue().stream()
                .filter(rfq -> rfq.getFechaLimite().isAfter(LocalDateTime.now()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RfqOfertaResponse ofertar(Long rfqId, RfqOfertaRequest request, Long productorId) {
        RfqEntity rfq = rfqJpaRepository.findById(rfqId)
                .orElseThrow(() -> new RecursoNoEncontradoException("RFQ no encontrada"));

        if (!rfq.isActivo() || rfq.getFechaLimite().isBefore(LocalDateTime.now())) {
            throw new CredencialesInvalidasException("La RFQ ya no está activa para cotizaciones");
        }

        UsuarioEntity productor = usuarioJpaRepository.findById(productorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Productor no encontrado"));

        if (rfqOfertaJpaRepository.existsByRfqIdAndProductorId(rfqId, productorId)) {
            throw new CredencialesInvalidasException("Ya has enviado una oferta para esta licitación");
        }

        RfqOfertaEntity oferta = RfqOfertaEntity.builder()
                .rfq(rfq)
                .productor(productor)
                .precioPropuesto(request.getPrecioPropuesto())
                .comentarios(request.getComentarios())
                .aceptada(false)
                .build();

        return toResponse(rfqOfertaJpaRepository.save(oferta));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RfqResponse> getMisSolicitudes(Long compradorId) {
        return rfqJpaRepository.findByCompradorId(compradorId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void aceptarOferta(Long ofertaId, Long compradorId) {
        RfqOfertaEntity oferta = rfqOfertaJpaRepository.findById(ofertaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Oferta no encontrada"));

        RfqEntity rfq = oferta.getRfq();
        if (!rfq.getComprador().getId().equals(compradorId)) {
            throw new CredencialesInvalidasException("No estás autorizado para aceptar ofertas en esta solicitud");
        }

        if (!rfq.isActivo()) {
            throw new CredencialesInvalidasException("La licitación ya no está activa");
        }

        // Marcar oferta como aceptada y cerrar licitación
        oferta.setAceptada(true);
        rfq.setActivo(false);
        rfqOfertaJpaRepository.save(oferta);
        rfqJpaRepository.save(rfq);

        // Generar pedido automático
        UsuarioEntity comprador = rfq.getComprador();
        UsuarioEntity productor = oferta.getProductor();

        // Buscar producto de este productor o crear uno temporal
        ProductoEntity producto = productoJpaRepository.findAll().stream()
                .filter(p -> p.getProductor() != null && p.getProductor().getId().equals(productor.getId()) && p.getTipoFruta() == rfq.getTipoFruta())
                .findFirst()
                .orElse(null);

        if (producto == null) {
            producto = ProductoEntity.builder()
                    .nombre("Contrato RFQ - " + rfq.getTipoFruta())
                    .descripcion("Generado automáticamente al aceptar oferta en licitación #" + rfq.getId())
                    .precio(oferta.getPrecioPropuesto())
                    .cantidadDisponible(rfq.getCantidadRequerida().intValue())
                    .tipoFruta(rfq.getTipoFruta())
                    .productor((ProductorEntity) productor)
                    .activo(false) // Oculto del catálogo general
                    .build();
            producto = productoJpaRepository.save(producto);
        }

        BigDecimal total = oferta.getPrecioPropuesto().multiply(BigDecimal.valueOf(rfq.getCantidadRequerida()));

        PedidoEntity pedido = PedidoEntity.builder()
                .comprador((CompradorEntity) comprador)
                .producto(producto)
                .cantidad(rfq.getCantidadRequerida().intValue())
                .precioUnitario(oferta.getPrecioPropuesto())
                .total(total)
                .estado(EstadoPedido.PENDIENTE)
                .build();

        pedidoJpaRepository.save(pedido);
    }

    private RfqResponse toResponse(RfqEntity entity) {
        if (entity == null) return null;
        List<RfqOfertaResponse> ofertaResponses = entity.getOfertas() != null 
                ? entity.getOfertas().stream().map(this::toResponse).collect(Collectors.toList())
                : List.of();

        return RfqResponse.builder()
                .id(entity.getId())
                .compradorId(entity.getComprador().getId())
                .compradorNombre(entity.getComprador().getNombre())
                .tipoFruta(entity.getTipoFruta())
                .cantidadRequerida(entity.getCantidadRequerida())
                .descripcion(entity.getDescripcion())
                .fechaLimite(entity.getFechaLimite())
                .activo(entity.isActivo())
                .fechaCreacion(entity.getFechaCreacion())
                .ofertas(ofertaResponses)
                .build();
    }

    private RfqOfertaResponse toResponse(RfqOfertaEntity entity) {
        if (entity == null) return null;
        return RfqOfertaResponse.builder()
                .id(entity.getId())
                .rfqId(entity.getRfq().getId())
                .productorId(entity.getProductor().getId())
                .productorNombre(entity.getProductor().getNombre())
                .precioPropuesto(entity.getPrecioPropuesto())
                .comentarios(entity.getComentarios())
                .aceptada(entity.isAceptada())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }
}
