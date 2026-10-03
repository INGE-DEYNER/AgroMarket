import { useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * Buscador de municipios (o ciudades) con lista desplegable.
 *
 * Sustituye al `<select>` de ciudad porque hay 1.122 municipios: un desplegable
 * nativo con Bogotá o con el Valle es inmanejable, sobre todo en móvil, y
 * obligaría a desplazarse por una lista interminable para llegar a "Zarzal".
 *
 * Es un `combobox` según el patrón ARIA: el input filtra, la lista propone y el
 * usuario confirma con Enter, Escape o clic. Un `<input>` libre no sirve,
 * porque permite escribir "Medellín" y guardarlo como ciudad de Chocó.
 *
 * Props:
 *   - opciones: [{ n, c, a, o }] — n = nombre, c = código, a/o = coords.
 *   - valor: nombre seleccionado (string) o null.
 *   - onChange(nombre, opcion): al confirmar. Recibe la opción completa para
 *     que quien llama pueda usar las coordenadas sin volver a buscarla.
 *   - etiqueta, placeholder, id, className, disabled, required.
 */
export default function BuscadorMunicipio({
  opciones = [],
  cargarOpciones,
  valor,
  onChange,
  etiqueta,
  placeholder = "Escribe para buscar…",
  id: idProp,
  className = "form-input",
  disabled = false,
  required = false,
  maxResultados = 60,
  mensajeSinDatos = "No encontramos ese municipio",
}) {
  const id = useId();
  const inputId = idProp || id;
  const listaId = inputId + "-lista";

  const [texto, setTexto] = useState(valor || "");
  const [abierto, setAbierto] = useState(false);
  const [resaltado, setResaltado] = useState(-1);
  const [cargadas, setCargadas] = useState(opciones);
  const [cargando, setCargando] = useState(false);
  const cajaRef = useRef(null);

  /*
   * Carga diferida del catálogo.
   *
   * Si el padre pasa `cargarOpciones`, el catálogo de 1.122 municipios se pide
   * en el momento de abrir el campo, no al cargar la página. Hasta entonces la
   * lista está vacía y se muestra un aviso de carga: es preferible a un salto
   * visual de 71 KB descargados en segundo plano.
   *
   * Se cachea por departamento: al volver al mismo no se vuelve a pedir, y el
   * import dinámico queda cacheado por el navegador para el resto de la sesión.
   */
  useEffect(() => {
    if (!cargarOpciones) {
      setCargadas(opciones);
      return undefined;
    }
    let vigente = true;
    if (opciones && opciones.length) {
      setCargadas(opciones);
      return undefined;
    }
    setCargando(true);
    Promise.resolve(cargarOpciones())
      .then((lista) => {
        if (vigente) setCargadas(Array.isArray(lista) ? lista : []);
      })
      .catch(() => {
        if (vigente) setCargadas([]);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargarOpciones]);

  // Cuando el valor cambia desde fuera (carga del perfil, cambio de
  // departamento) el input refleja el nombre, no lo que el usuario tecleó.
  useEffect(() => {
    setTexto(valor || "");
  }, [valor]);

  // Cierra la lista al pulsar fuera. Sin esto la lista queda flotando sobre
  // el resto del formulario.
  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => {
      if (cajaRef.current && !cajaRef.current.contains(e.target)) {
        setAbierto(false);
        setResaltado(-1);
      }
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  // El filtro ignora tildes y mayúsculas: "medellin" encuentra "Medellín".
  const filtrados = useMemo(() => {
    const plegar = (s) =>
      s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const q = plegar(texto).trim();
    // Con el texto vacío se listan los primeros, no todos: 1.122 filas en el
    // DOM es lento de pintar y de recorrer con el teclado.
    if (!q) return cargadas.slice(0, maxResultados);
    return cargadas
      .filter((o) => plegar(o.n).includes(q))
      .slice(0, maxResultados);
  }, [cargadas, texto, maxResultados]);

  const elegir = (opcion) => {
    setTexto(opcion.n);
    setAbierto(false);
    setResaltado(-1);
    onChange(opcion.n, opcion);
  };

  const alTeclado = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!abierto) setAbierto(true);
      setResaltado((r) => Math.min(r + 1, filtrados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResaltado((r) => Math.max(r - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Enter solo confirma si hay algo resaltado; si no, deja enviar el
      // formulario en vez de elegir la primera coincidencia a ciegas.
      if (abierto && resaltado >= 0 && filtrados[resaltado]) {
        elegir(filtrados[resaltado]);
      }
    } else if (e.key === "Escape") {
      setAbierto(false);
      setResaltado(-1);
      // Restaura el valor confirmado: el usuario puede haber escrito algo y
      // luego arrepentirse.
      setTexto(valor || "");
    }
  };


  return (
    <div className="form-group" ref={cajaRef}>
      {etiqueta && (
        <label className="form-label" htmlFor={inputId}>
          {etiqueta}
        </label>
      )}

      <div className="buscador-municipio">
        <input
          id={inputId}
          type="text"
          className={className}
          value={texto}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={listaId}
          aria-autocomplete="list"
          aria-activedescendant={
            resaltado >= 0 && filtrados[resaltado]
              ? listaId + "-" + resaltado
              : undefined
          }
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setResaltado(-1);
            // Escribir es cambiar: si el texto ya no coincide con el valor
            // confirmado, la selección anterior deja de ser válida.
            if (e.target.value !== valor) onChange("", null);
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={alTeclado}
        />

        {abierto && (
          <ul className="buscador-municipio__lista" id={listaId} role="listbox">
            {cargando && (
              <li className="buscador-municipio__vacio">Cargando municipios…</li>
            )}
            {!cargando && filtrados.length === 0 && (
              <li className="buscador-municipio__vacio">
                {mensajeSinDatos}
              </li>
            )}
            {abierto && !cargando && filtrados.map((o, i) => (
              <li
                key={o.c || o.n}
                id={listaId + "-" + i}
                role="option"
                aria-selected={i === resaltado}
                className={
                  i === resaltado
                    ? "buscador-municipio__opcion buscador-municipio__opcion--activa"
                    : "buscador-municipio__opcion"
                }
                onMouseEnter={() => setResaltado(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(o)}
              >
                {o.n}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/*
        Campo oculto con el valor confirmado. El input de texto no sirve para
        enviar el dato: si el usuario escribe "Medell" y no elige nada de la
        lista, el texto está incompleto. Este es el que va en el payload.
      */}
      <input type="hidden" name="municipio" value={valor || ""} />
    </div>
  );
}
