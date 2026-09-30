package com.agromarket.domain.services.location;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * Catálogo de municipios de Colombia, cargado desde {@code municipios-co.txt}.
 *
 * <p>Se usa para dos cosas:
 * <ol>
 *   <li>Validar que el municipio declarado pertenezca al departamento declarado.
 *       El formulario del frontend ya lo hace, pero el frontend se puede
 *       saltar: basta con llamar a la API con los campos a mano.</li>
 *   <li>Obtener las coordenadas reales del municipio, en vez de creerle a las
 *       que envía el cliente. Con coordenadas manipuladas, un envío a Bogotá
 *       podría cobrarse como si fuera a Chigorodó.</li>
 * </ol>
 *
 * <p>El archivo lo genera {@code scripts/genera-municipios.cjs} desde los datos
 * del DANE, igual que el catálogo del frontend. Los dos lados deben salir de
 * la misma fuente: si el formulario ofrece un municipio que el backend no
 * conoce, el usuario ve un error que no puede resolver.
 */
@Component
public class MunicipioCatalogoService {

    private static final String RECURSO = "municipios-co.txt";

    /** clave normalizada "departamento|municipio" -> municipio. */
    private final Map<String, Municipio> porClave = new HashMap<>();

    /** número de municipios cargados, para diagnóstico al arrancar. */
    private int total;

    public record Municipio(String departamento, String codigo, String nombre,
                            double latitud, double longitud) {
    }

    @PostConstruct
    void cargar() {
        ClassPathResource recurso = new ClassPathResource(RECURSO);
        try (InputStream in = recurso.getInputStream();
             BufferedReader lector = new BufferedReader(
                     new InputStreamReader(in, StandardCharsets.UTF_8))) {

            String linea;
            while ((linea = lector.readLine()) != null) {
                if (linea.isBlank() || linea.startsWith("#")) {
                    continue;
                }
                String[] p = linea.split("\\|", -1);
                if (p.length < 5) {
                    continue;
                }
                try {
                    Municipio m = new Municipio(
                            p[0], p[1], p[2],
                            Double.parseDouble(p[3]), Double.parseDouble(p[4]));
                    porClave.put(clave(m.departamento(), m.nombre()), m);
                    total++;
                } catch (NumberFormatException ex) {
                    // Una línea corrupta no debe impedir que arranque la
                    // aplicación; simplemente ese municipio no quedará
                    // disponible y la validación lo rechazará.
                    System.err.println("[MunicipioCatalogo] línea ignorada: " + linea);
                }
            }
        } catch (IOException ex) {
            throw new IllegalStateException(
                    "No se pudo cargar el catálogo de municipios (" + RECURSO + ")", ex);
        }
    }

    /**
     * Normaliza un nombre para poder compararlo.
     *
     * <p>Quita tildes y pasa a minúsculas, porque el nombre puede venir de un
     * formulario escrito a mano o de un registro guardado por una versión
     * anterior del catálogo, que usaba "Bogota D.C." sin tilde. También
     * colapsa espacios, por el mismo motivo: "Bogotá  D.C." con doble espacio
     * es el mismo departamento.
     */
    private static String normalizar(String texto) {
        if (texto == null) {
            return "";
        }
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static String clave(String departamento, String municipio) {
        return normalizar(departamento) + "|" + normalizar(municipio);
    }

    /**
     * Busca un municipio validando ambos campos a la vez.
     *
     * @return el municipio, o {@code null} si no existe en el país o no
     *         pertenece a ese departamento.
     */
    public Municipio buscar(String departamento, String municipio) {
        if (departamento == null || municipio == null) {
            return null;
        }
        return porClave.get(clave(departamento, municipio));
    }

    /** ¿El municipio existe y pertenece a ese departamento? */
    public boolean perteneceAlDepartamento(String departamento, String municipio) {
        return buscar(departamento, municipio) != null;
    }

    /** ¿Existe el departamento en el catálogo? */
    public boolean existeDepartamento(String departamento) {
        if (departamento == null) {
            return false;
        }
        String objetivo = normalizar(departamento);
        return porClave.keySet().stream()
                .anyMatch(k -> k.startsWith(objetivo + "|"));
    }

    /** Número de municipios cargados. */
    public int total() {
        return total;
    }
}
