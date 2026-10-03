package com.agromarket.infrastructure.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.agromarket.infrastructure.config.properties.AppProperties;
import com.agromarket.infrastructure.config.properties.JwtProperties;

/**
 * Comprobaciones de arranque sobre los secretos de la aplicación.
 *
 * <p>No bloquean el arranque en desarrollo: con un {@code JWT_SECRET} de ejemplo
 * se puede trabajar en local. En producción ({@code SPRING_PROFILES_ACTIVE=prod})
 * sí cortan, porque arrancar con una clave de firma conocida equivale a no
 * tener autenticación: cualquiera que lea el repositorio podría firmar un
 * token con {@code role=ADMIN}.
 */
@Component
public class SecretosStartupValidator {

    private static final String PERFIL_PRODUCCION = "prod";

    private final JwtProperties jwtProperties;
    private final Environment environment;

    /**
     * Valores que son públicos porque están en el repositorio. Si alguno
     * llega a producción tal cual, la protección que aporta es nula.
     */
    private static final String CLAVE_ID_POR_DEFECTO =
            "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY";

    private static final String[] CONTRASENAS_CONOCIDAS = {
        "agromarket", "password", "root", "123456", "admin", "",
    };

    public SecretosStartupValidator(
            JwtProperties jwtProperties,
            Environment environment) {
        this.jwtProperties = jwtProperties;
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void verificar() {
        boolean produccion = PERFIL_PRODUCCION.equalsIgnoreCase(
                environment.getProperty("spring.profiles.active", "dev"));

        List<String> fallos = new ArrayList<>();

        if (produccion) {
            // En producción no hay excepción: si la clave sirve para firmar
            // cualquier token, no se sirve de nada tener autenticación.
            try {
                jwtProperties.validar();
            } catch (IllegalStateException ex) {
                fallos.add(ex.getMessage());
            }
        } else {
            // En desarrollo se avisa, pero no se para: si se parara, nadie
            // podría levantar el proyecto sin generar las variables primero.
            try {
                jwtProperties.validar();
            } catch (IllegalStateException ex) {
                System.err.println();
                System.err.println("  [AVISO DE SEGURIDAD] " + ex.getMessage());
                System.err.println("  [AVISO DE SEGURIDAD] La aplicación arranca en "
                        + "desarrollo, pero con esta clave cualquier persona puede "
                        + "firmar un token con role=ADMIN.");
                System.err.println("  [AVISO DE SEGURIDAD] Antes de publicar en "
                        + "producción, define JWT_SECRET en el entorno.");
                System.err.println();
            }
        }

        fallos.addAll(revisarCredencialesBd());
        fallos.addAll(revisarCifradoIds());

        revisarCorreoSoporte();

        if (!fallos.isEmpty() && produccion) {
            throw new IllegalStateException(
                    "Arranque abortado por secretos inseguros:\n  - "
                            + String.join("\n  - ", fallos));
        }
    }

    /**
     * La contraseña de la base de datos tenía "agromarket" como valor por
     * defecto en el perfil de producción: con ella, cualquiera que llegase al
     * puerto de MySQL entraba con todos los privilegios.
     *
     * <p>Solo se aborta si la base NO es local. Contra un MySQL de la red
     * (producción) una contraseña conocida es un agujero; contra el contenedor
     * de desarrollo es solo una comodidad, y rechazarla impediría levantar el
     * proyecto. El aviso sale siempre.
     */
    private List<String> revisarCredencialesBd() {
        List<String> fallos = new ArrayList<>();

        String password = environment.getProperty("spring.datasource.password");
        String usuario = environment.getProperty("spring.datasource.username");
        String url = environment.getProperty("spring.datasource.url", "");

        boolean baseLocal = esBaseLocal(url);

        if (password == null || password.isBlank()) {
            fallos.add("SPRING_DATASOURCE_PASSWORD vacía: la base de datos "
                    + "quedaría abierta o inaccesible.");
            return fallos;
        }

        for (String conocida : CONTRASENAS_CONOCIDAS) {
            if (password.equalsIgnoreCase(conocida)) {
                String msg = "SPRING_DATASOURCE_PASSWORD tiene un valor por "
                        + "defecto que está en el repositorio (usuario=" + usuario
                        + "). Cualquiera con acceso a la base entra con todos "
                        + "los privilegios.";
                if (baseLocal) {
                    System.err.println();
                    System.err.println("  [AVISO DE SEGURIDAD] " + msg);
                    System.err.println("  [AVISO DE SEGURIDAD] Se permite porque "
                            + "la base es local. Antes de publicar, cambia "
                            + "MYSQL_PASSWORD y recrea el volumen.");
                    System.err.println();
                } else {
                    fallos.add(msg);
                }
                break;
            }
        }

        if ("root".equalsIgnoreCase(usuario)) {
            fallos.add("SPRING_DATASOURCE_USERNAME es root: la aplicación "
                    + "no debería conectarse con el administrador de MySQL.");
        }
        return fallos;
    }

    /** true si la URL de la base apunta a la máquina o a un contenedor local. */
    private boolean esBaseLocal(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String minusculas = url.toLowerCase();
        return minusculas.contains("localhost")
                || minusculas.contains("127.0.0.1")
                || minusculas.contains("//mysql:")
                || minusculas.contains("mysql:3306");
    }

    /**
     * Avisa cuando no hay buzón de soporte.
     *
     * <p>AVISA, no corta el arranque, y a propósito en los dos perfiles. Con
     * {@code APP_SUPPORT_EMAIL} vacía, un cliente que envía un reporte ve "enviado"
     * y el reporte se guarda de verdad en Mongo, pero <em>nadie se entera</em>: el
     * mensaje se queda en la colección hasta que alguien mire. El fallo es
     * invisible salvo que se mire el log, que es justo lo que no va a pasar.
     *
     * <p>Por eso no corta: si abortara el arranque, tampoco se podrían recibir
     * los reportes que ya estaban funcionando por otra vía, y se perdería
     * información que sí se está guardando. Y no se inventa un buzón: un correo
     * de relleno haría que el reporte pareciera atendido cuando se ha perdido.
     */
    private void revisarCorreoSoporte() {
        String correo = environment.getProperty("app.support.email");

        if (correo != null && !correo.isBlank()) {
            return;
        }

        System.err.println();
        System.err.println("  ============================================================");
        System.err.println("  [AVISO] APP_SUPPORT_EMAIL NO ESTA DEFINIDA");
        System.err.println("  ============================================================");
        System.err.println("  Los reportes de \"Reportar un problema\" SE GUARDAN en");
        System.err.println("  Mongo, pero NADIE recibe el aviso. El cliente ve \"enviado\"");
        System.err.println("  y el mensaje se queda en la coleccion support_reports.");
        System.err.println();
        System.err.println("  Defina APP_SUPPORT_EMAIL con el buzon que debe recibirlos.");
        System.err.println("  Sin correo, los reportes se pueden recuperar a mano:");
        System.err.println("    mongosh --eval 'db.support_reports.find().sort({_id:-1}).limit(20)'");
        System.err.println("  ============================================================");
        System.err.println();
    }

    /**
     * La clave con la que se cifran los ids tenía un valor por defecto en el
     * repositorio. Con ella se pueden descifrar todos los identificadores.
     */
    private List<String> revisarCifradoIds() {
        List<String> fallos = new ArrayList<>();
        String clave = environment.getProperty("app.security.id-encryption-key");
        if (clave == null || clave.isBlank() || clave.equals(CLAVE_ID_POR_DEFECTO)) {
            fallos.add("APP_SECURITY_ID_ENCRYPTION_KEY vacía o con el valor por "
                    + "defecto del repositorio: los ids cifrados son descifrables. "
                    + "Genera una con: openssl rand -base64 32");
        }
        return fallos;
    }
}