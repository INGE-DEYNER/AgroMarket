import { useMemo } from "react";
import {
  PAISES,
  departamentosDe,
  ciudadesDe,
  banderaDe,
} from "@/application/support/geoCatalog";
import BuscadorMunicipio from "@/presentation/shared/components/BuscadorMunicipio";

/**
 * Selector de residencia en cascada: pais -> departamento -> ciudad.
 *
 * Usa el banco de datos geografico (`geoCatalog.js`), por lo que las
 * ciudades que aparecen dependen del pais elegido. Cuando cambia el pais se
 * reinician departamento y ciudad para no dejar una combinacion imposible
 * (p. ej. un municipio colombiano con pais = España).
 *
 * Props:
 *   - pais, departamento, ciudad: valores controlados.
 *   - onPais, onDepartamento, onCiudad: callbacks de cambio.
 *   - className, inputClass: estilos heredados del formulario anfitrión.
 *   - conPais: si es false oculta el primer select (útil cuando el pais ya
 *     se eligió en otro sitio, p. ej. junto al teléfono).
 */
export default function SelectorResidencia({
  pais,
  departamento,
  ciudad,
  onPais,
  onDepartamento,
  onCiudad,
  className = "",
  inputClass = "form-input",
  labelPais = "País",
  labelDepartamento = "Departamento",
  labelCiudad = "Ciudad / Municipio",
  conPais = true,
  requerido = false,
}) {
  const departamentos = useMemo(
    () => departamentosDe(pais),
    [pais],
  );

  const ciudades = useMemo(
    () => (departamento ? ciudadesDe(pais, departamento) : []),
    [pais, departamento],
  );

  return (
    <div className={className}>
      {conPais && (
        <div className="form-group">
          <label className="form-label" htmlFor="residencia-pais">
            {labelPais}
          </label>
          <select
            id="residencia-pais"
            className={inputClass}
            value={pais || ""}
            onChange={(e) => onPais(e.target.value)}
          >
            <option value="">Selecciona un país</option>
            {PAISES.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.bandera} {p.nombre} ({p.codigo})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="residencia-departamento">
          {labelDepartamento}
        </label>
        <select
          id="residencia-departamento"
          className={inputClass}
          value={departamento || ""}
          onChange={(e) => onDepartamento(e.target.value)}
          disabled={!pais}
        >
          <option value="">
            {pais ? "Selecciona un departamento" : "Elige primero el país"}
          </option>
          {departamentos.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        {/*
          Buscador y no <select>: el catálogo del DANE trae 1.122 municipios y
          un desplegable nativo obligaría a recorrer una lista interminable
          para llegar, por ejemplo, a "Zarzal". Además el buscador obliga a
          elegir de la lista, con lo que ya no se puede guardar "Medellín"
          como ciudad de Chocó.
        */}
        <BuscadorMunicipio
          id="residencia-ciudad"
          className={inputClass}
          opciones={ciudades}
          valor={ciudad || ""}
          onChange={(nombre) => onCiudad(nombre)}
          disabled={!departamento}
          required={requerido}
          placeholder={
            departamento
              ? "Escribe el municipio…"
              : "Elige primero el departamento"
          }
          mensajeSinDatos={
            departamento
              ? `No encontramos "${ciudad || ""}" en ${departamento}`
              : "Elige primero el departamento"
          }
        />
      </div>
    </div>
  );
}

/** Bandera del país seleccionado, para mostrarla junto al resumen. */
export function banderaPais(codigoPais) {
  return banderaDe(codigoPais);
}
