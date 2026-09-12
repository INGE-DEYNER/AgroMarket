package com.agromarket.application.adapters.api.controllers.admin;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.admin.PromoteToAdminRequest;
import com.agromarket.application.adapters.api.response.admin.AdminProductoResponse;
import com.agromarket.application.adapters.api.response.admin.AdminResponse;
import com.agromarket.application.adapters.api.response.admin.AdminUsuarioResponse;
import com.agromarket.application.usecases.admin.AdminDashboardUseCase;
import com.agromarket.domain.models.admin.Admin;
import com.agromarket.domain.models.enums.admin.AdminAction;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.ports.in.admin.AdminPort;
import com.agromarket.domain.ports.in.product.ProductPort;
import com.agromarket.domain.ports.in.product.ProductResult;
import com.agromarket.domain.ports.in.user.UserPort;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
public class AdminController {

        private final AdminPort adminPort;
        private final UserPort userPort;
        private final ProductPort productPort;
        private final AdminDashboardUseCase adminDashboardUseCase;
        private final com.agromarket.infrastructure.pdf.AdminReportPdfGenerator adminReportPdfGenerator;

        // =========================================================
        // DASHBOARD / PANEL DE ADMINISTRACIÓN
        // =========================================================
        // CAUSA RAÍZ del panel Admin vacío: el frontend llama a
        // /admin/dashboard, /admin/usuarios-pendientes, /admin/usuarios,
        // /admin/productos y /admin/aprobar-usuario|rechazar-usuario, pero
        // este controlador solo exponía operaciones sobre la entidad Admin.
        // El filtro ApiPathAliasFilter reescribe /api/v1/admin ->
        // /api/v1/admins, así que los endpoints de abajo responden a las
        // rutas que el frontend ya consume.

        @GetMapping("/dashboard")
        public ResponseEntity<?> dashboard() {

                return ResponseEntity.ok(adminDashboardUseCase.construir());
        }

        /**
         * GET /api/v1/admins/reportes/pdf (alias frontend: /admin/reportes/pdf)
         *
         * CAUSA RAÍZ del botón "Generar Reporte Mensual" roto: el frontend
         * pedía /admin/reportes/pdf y el endpoint no existía (404 Not Found).
         * Ahora genera un PDF real con los datos del dashboard: totales,
         * estados de pedidos, top productores e ingresos por mes.
         */
        @GetMapping("/reportes/pdf")
        public ResponseEntity<byte[]> reportePdf() {

                byte[] pdf = adminReportPdfGenerator
                                .generar(adminDashboardUseCase.construir());

                String filename = "reporte-agromarket-"
                                + java.time.YearMonth.now() + ".pdf";

                return ResponseEntity.ok()
                                .header("Content-Disposition",
                                                "attachment; filename=\"" + filename + "\"")
                                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                                .body(pdf);
        }

        @GetMapping("/usuarios-pendientes")
        public ResponseEntity<List<AdminUsuarioResponse>> usuariosPendientes() {

                return ResponseEntity.ok(
                                userPort.getPendientesAprobacion().stream()
                                                .map(AdminUsuarioResponse::from)
                                                .toList());
        }

        @PostMapping("/aprobar-usuario/{userId}")
        public ResponseEntity<AdminUsuarioResponse> aprobarUsuario(
                        @PathVariable Long userId) {

                return ResponseEntity.ok(
                                AdminUsuarioResponse.from(
                                                userPort.aprobarUsuario(userId)));
        }

        @PostMapping("/rechazar-usuario/{userId}")
        public ResponseEntity<AdminUsuarioResponse> rechazarUsuario(
                        @PathVariable Long userId) {

                return ResponseEntity.ok(
                                AdminUsuarioResponse.from(
                                                userPort.rechazarUsuario(userId)));
        }

        @PutMapping("/productores/{idEncriptado}/verificar")
        public ResponseEntity<AdminUsuarioResponse> verificarProductor(
                        @PathVariable Long idEncriptado) {

                return ResponseEntity.ok(
                                AdminUsuarioResponse.from(
                                                userPort.toggleVerificadoProductor(idEncriptado)));
        }

        @GetMapping("/usuarios")
        public ResponseEntity<Map<String, Object>> usuarios(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size,
                        @RequestParam(required = false) String search) {

                List<AdminUsuarioResponse> filtrados = userPort.getAll().stream()
                                .map(AdminUsuarioResponse::from)
                                .filter(u -> coincideConBusqueda(
                                                u.nombre(), u.apellido(), u.email(),
                                                search))
                                .toList();

                return ResponseEntity.ok(paginar(filtrados, page, size));
        }

        @GetMapping("/productos")
        public ResponseEntity<Map<String, Object>> productos(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "15") int size,
                        @RequestParam(required = false) String search) {

                List<AdminProductoResponse> filtrados = productPort
                                .getAllActiveProducts().stream()
                                                .map(ProductResult::getProduct)
                                                .filter(java.util.Objects::nonNull)
                                                .map(this::toProductoResponse)
                                                .filter(p -> coincideConBusqueda(
                                                                p.nombre(), null,
                                                                p.productor(), search))
                                                .toList();

                return ResponseEntity.ok(paginar(filtrados, page, size));
        }

        private AdminProductoResponse toProductoResponse(Product product) {

                String nombreProductor = null;

                if (product.getProducer() != null) {
                        String nombre = product.getProducer().getFirstName() == null
                                        ? ""
                                        : product.getProducer().getFirstName().trim();
                        String apellido = product.getProducer().getLastName() == null
                                        ? ""
                                        : product.getProducer().getLastName().trim();

                        nombreProductor = (nombre + " " + apellido).trim();
                }

                return new AdminProductoResponse(
                                product.getId(),
                                product.getName(),
                                nombreProductor,
                                product.getPrice(),
                                product.getAvailableQuantity());
        }

        private boolean coincideConBusqueda(
                        String nombre, String apellido, String email,
                        String search) {

                if (search == null || search.isBlank()) {
                        return true;
                }

                String aguja = search.toLowerCase(Locale.ROOT).trim();

                String nombreCompleto = ((nombre == null ? "" : nombre) + " "
                                + (apellido == null ? "" : apellido)).trim();

                return nombreCompleto.toLowerCase(Locale.ROOT).contains(aguja)
                                || (email != null
                                                && email.toLowerCase(Locale.ROOT)
                                                                .contains(aguja));
        }

        private Map<String, Object> paginar(
                        List<?> elementos, int page, int size) {

                int totalElements = elementos.size();
                int totalPages = size > 0
                                ? (int) Math.ceil((double) totalElements / size)
                                : 1;

                int fromIndex = Math.min(Math.max(page, 0) * size, totalElements);
                int toIndex = Math.min(fromIndex + Math.max(size, 0), totalElements);

                List<?> contenido = fromIndex <= toIndex
                                ? new ArrayList<>(elementos.subList(fromIndex, toIndex))
                                : List.of();

                Map<String, Object> respuesta = new LinkedHashMap<>();

                respuesta.put("content", contenido);
                respuesta.put("page", page);
                respuesta.put("size", size);
                respuesta.put("totalElements", totalElements);
                respuesta.put("totalPages", totalPages);

                return respuesta;
        }

        @PostMapping("/promote")
        public ResponseEntity<AdminResponse> promoteToAdmin(
                        @Valid @RequestBody PromoteToAdminRequest request) {

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(toResponse(
                                                adminPort.promoteToAdmin(request.userId())));
        }

        @GetMapping("/user/{userId}")
        public ResponseEntity<AdminResponse> getByUserId(
                        @PathVariable Long userId) {

                return ResponseEntity.ok(
                                toResponse(adminPort.getAdminByUserId(userId)));
        }

        @GetMapping("/active")
        public ResponseEntity<List<AdminResponse>> getActiveAdmins() {

                return ResponseEntity.ok(
                                adminPort.getActiveAdmins()
                                                .stream()
                                                .map(this::toResponse)
                                                .toList());
        }

        @PatchMapping("/{adminId}/deactivate")
        public ResponseEntity<AdminResponse> deactivate(
                        @PathVariable Long adminId) {

                return ResponseEntity.ok(
                                toResponse(adminPort.deactivateAdmin(adminId)));
        }

        @GetMapping("/can-perform")
        public ResponseEntity<Boolean> canPerform(
                        @RequestParam Long userId,
                        @RequestParam AdminAction action) {

                return ResponseEntity.ok(
                                adminPort.canPerform(userId, action));
        }

        private AdminResponse toResponse(Admin admin) {
                return AdminResponse.fromDomain(admin);
        }
}
