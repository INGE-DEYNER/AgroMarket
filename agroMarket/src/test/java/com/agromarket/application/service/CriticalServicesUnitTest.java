package com.agromarket.application.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import com.agromarket.application.dto.CrearPedidoRequest;
import com.agromarket.application.dto.PagoIniciadoDTO;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.mapper.PedidoMapper;
import com.agromarket.application.service.impl.PasarelaPagoStub;
import com.agromarket.domain.exception.StockInsuficienteException;
import com.agromarket.domain.model.EstadoPedido;
import com.agromarket.domain.model.TipoFruta;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.PagoEntity;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;
import com.agromarket.infrastructure.persistence.entity.ProductoEntity;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.infrastructure.persistence.entity.RfqEntity;
import com.agromarket.infrastructure.persistence.entity.RfqOfertaEntity;
import com.agromarket.infrastructure.persistence.repository.EnvioJpaRepository;
import com.agromarket.infrastructure.persistence.repository.PagoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.PedidoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository;
import com.agromarket.infrastructure.persistence.repository.RfqJpaRepository;
import com.agromarket.infrastructure.persistence.repository.RfqOfertaJpaRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.agromarket.infrastructure.scheduler.DescuentoAutomaticoJob;
import com.github.benmanes.caffeine.cache.Cache;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

@ExtendWith(MockitoExtension.class)
public class CriticalServicesUnitTest {

    @Mock private PedidoJpaRepository pedidoJpaRepository;
    @Mock private ProductoJpaRepository productoJpaRepository;
    @Mock private UsuarioJpaRepository usuarioJpaRepository;
    @Mock private EnvioJpaRepository envioJpaRepository;
    @Mock private PedidoMapper pedidoMapper;
    @Mock private Cache<Long, Object> pedidosCache;

    @InjectMocks
    private PedidoServiceImpl pedidoService;

    // RfqServiceImpl Mocks
    @Mock private RfqJpaRepository rfqJpaRepository;
    @Mock private RfqOfertaJpaRepository rfqOfertaJpaRepository;
    private RfqServiceImpl rfqService;

    // DescuentoAutomaticoJob Mocks
    private DescuentoAutomaticoJob descuentoAutomaticoJob;

    // PasarelaPagoStub Mocks
    @Mock private PagoJpaRepository pagoJpaRepository;
    private PasarelaPagoStub pasarelaPagoStub;

    @BeforeEach
    void setUp() {
        rfqService = new RfqServiceImpl(rfqJpaRepository, rfqOfertaJpaRepository, usuarioJpaRepository, productoJpaRepository, pedidoJpaRepository);
        descuentoAutomaticoJob = new DescuentoAutomaticoJob(productoJpaRepository);
        pasarelaPagoStub = new PasarelaPagoStub(pagoJpaRepository);
    }

    // --- PedidoServiceImpl.crear Tests ---

    @Test
    void testCrearPedido_StockSuficiente() {
        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setProductoId(1L);
        request.setCantidad(5);

        CompradorEntity comprador = new CompradorEntity();
        comprador.setId(2L);

        ProductorEntity productor = new ProductorEntity();
        productor.setId(3L);

        ProductoEntity producto = ProductoEntity.builder()
                .id(1L)
                .productor(productor)
                .cantidadDisponible(10)
                .precio(BigDecimal.TEN)
                .build();

        when(usuarioJpaRepository.findById(2L)).thenReturn(Optional.of(comprador));
        when(productoJpaRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(pedidoJpaRepository.save(any(PedidoEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(pedidoMapper.toResponse(any(PedidoEntity.class))).thenReturn(new PedidoResponse());

        PedidoResponse response = pedidoService.crear(request, 2L);

        assertNotNull(response);
        assertEquals(5, producto.getCantidadDisponible());
        verify(productoJpaRepository).save(producto);
    }

    @Test
    void testCrearPedido_StockInsuficiente() {
        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setProductoId(1L);
        request.setCantidad(15);

        CompradorEntity comprador = new CompradorEntity();
        comprador.setId(2L);

        ProductoEntity producto = ProductoEntity.builder()
                .id(1L)
                .cantidadDisponible(10)
                .build();

        when(usuarioJpaRepository.findById(2L)).thenReturn(Optional.of(comprador));
        when(productoJpaRepository.findById(1L)).thenReturn(Optional.of(producto));

        assertThrows(StockInsuficienteException.class, () -> pedidoService.crear(request, 2L));
    }

    @Test
    void testCrearPedido_OptimisticLockException() {
        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setProductoId(1L);
        request.setCantidad(5);

        CompradorEntity comprador = new CompradorEntity();
        comprador.setId(2L);

        ProductoEntity producto = ProductoEntity.builder()
                .id(1L)
                .cantidadDisponible(10)
                .precio(BigDecimal.TEN)
                .build();

        when(usuarioJpaRepository.findById(2L)).thenReturn(Optional.of(comprador));
        when(productoJpaRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoJpaRepository.save(any(ProductoEntity.class)))
                .thenThrow(new ObjectOptimisticLockingFailureException(ProductoEntity.class, 1L));

        StockInsuficienteException ex = assertThrows(StockInsuficienteException.class, () -> pedidoService.crear(request, 2L));
        assertEquals("Producto agotado, intente de nuevo", ex.getMessage());
    }

    // --- RfqServiceImpl.aceptarOferta Tests ---

    @Test
    void testAceptarOferta_ProductoExistente() {
        CompradorEntity comprador = new CompradorEntity();
        comprador.setId(1L);

        ProductorEntity productor = new ProductorEntity();
        productor.setId(2L);

        RfqEntity rfq = RfqEntity.builder()
                .id(10L)
                .comprador(comprador)
                .tipoFruta(TipoFruta.BANANO)
                .cantidadRequerida(100.0)
                .activo(true)
                .build();

        RfqOfertaEntity oferta = RfqOfertaEntity.builder()
                .id(20L)
                .rfq(rfq)
                .productor(productor)
                .precioPropuesto(BigDecimal.TEN)
                .build();

        ProductoEntity productoExistente = ProductoEntity.builder()
                .id(30L)
                .productor(productor)
                .tipoFruta(TipoFruta.BANANO)
                .build();

        when(rfqOfertaJpaRepository.findById(20L)).thenReturn(Optional.of(oferta));
        when(productoJpaRepository.findByProductorIdAndTipoFruta(2L, TipoFruta.BANANO))
                .thenReturn(Optional.of(productoExistente));

        rfqService.aceptarOferta(20L, 1L);

        verify(pedidoJpaRepository).save(argThat(pedido -> 
            pedido.getProducto().getId().equals(30L) &&
            pedido.getCantidad() == 100
        ));
    }

    @Test
    void testAceptarOferta_ProductoNuevo() {
        CompradorEntity comprador = new CompradorEntity();
        comprador.setId(1L);

        ProductorEntity productor = new ProductorEntity();
        productor.setId(2L);

        RfqEntity rfq = RfqEntity.builder()
                .id(10L)
                .comprador(comprador)
                .tipoFruta(TipoFruta.BANANO)
                .cantidadRequerida(100.0)
                .activo(true)
                .build();

        RfqOfertaEntity oferta = RfqOfertaEntity.builder()
                .id(20L)
                .rfq(rfq)
                .productor(productor)
                .precioPropuesto(BigDecimal.TEN)
                .build();

        when(rfqOfertaJpaRepository.findById(20L)).thenReturn(Optional.of(oferta));
        when(productoJpaRepository.findByProductorIdAndTipoFruta(2L, TipoFruta.BANANO))
                .thenReturn(Optional.empty());
        when(productoJpaRepository.save(any(ProductoEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        rfqService.aceptarOferta(20L, 1L);

        verify(productoJpaRepository).save(argThat(p -> 
            p.getNombre().equals("Contrato RFQ - BANANO") &&
            p.getTipoFruta() == TipoFruta.BANANO &&
            p.getPrecio().equals(BigDecimal.TEN)
        ));
    }

    // --- DescuentoAutomaticoJob Tests ---

    @Test
    void testExpirarPromociones() {
        ProductoEntity p1 = ProductoEntity.builder().id(1L).enPromocion(true).build();
        ProductoEntity p2 = ProductoEntity.builder().id(2L).enPromocion(true).build();

        when(productoJpaRepository.findByEnPromocionTrueAndFechaFinPromocionBefore(any(LocalDateTime.class)))
                .thenReturn(java.util.List.of(p1, p2));

        descuentoAutomaticoJob.expirarPromociones();

        assertFalse(p1.isEnPromocion());
        assertNull(p1.getPrecioPromocion());
        assertNull(p1.getFechaFinPromocion());

        assertFalse(p2.isEnPromocion());
        assertNull(p2.getPrecioPromocion());
        assertNull(p2.getFechaFinPromocion());

        verify(productoJpaRepository, times(2)).save(any(ProductoEntity.class));
    }

    // --- PasarelaPagoStub Tests ---

    @Test
    void testPasarelaPagoStub_IniciarPago() {
        PedidoEntity pedido = PedidoEntity.builder().id(1L).total(BigDecimal.TEN).build();
        when(pagoJpaRepository.findByPedidoId(1L)).thenReturn(Optional.empty());

        PagoIniciadoDTO response = pasarelaPagoStub.iniciarPago(pedido);

        assertNotNull(response);
        assertTrue(response.getReferencia().startsWith("STUB-"));
        assertTrue(response.getRedirectUrl().contains(response.getReferencia()));
        verify(pagoJpaRepository).save(argThat(p -> p.getEstado() == com.agromarket.domain.model.EstadoPago.EN_PROCESO));
    }
}
