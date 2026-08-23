import { useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import heroImg from "@/assets/producers-hero.png";
import fincaImg from "@/assets/finca-el-paraiso.png";
import antonioImg from "@/assets/agro-antonio.png";
import cacaoImg from "@/assets/cacao-el-tesoro.png";
import camposImg from "@/assets/campos-de-uraba.png";
import mapPinIcon from "@/assets/icon-map-pin.svg";
import handHeartIcon from "@/assets/icon-hand-heart.svg";
import "@/presentation/styles/public-views.css";

const PRODUCERS = [
  {
    name: "Finca El Paraíso",
    place: "Apartadó",
    family: "Familia Humberto & Hijos",
    rating: 5.0,
    reviews: 24,
    img: fincaImg,
  },
  {
    name: "AgroUrabá Antonio",
    place: "Turbo",
    family: "Don Antonio y Productores",
    rating: 4.9,
    reviews: 41,
    img: antonioImg,
  },
  {
    name: "Cacao El Tesoro",
    place: "Carepa",
    family: "Asociación Semillas de Paz",
    rating: 4.8,
    reviews: 18,
    img: cacaoImg,
  },
  {
    name: "Campos de Urabá",
    place: "Chigorodó",
    family: "Finca Tradicional La Fe",
    rating: 5.0,
    reviews: 32,
    img: camposImg,
  },
];

const MUNICIPIOS = ["Apartadó", "Turbo", "Carepa", "Chigorodó"];

export default function Productores() {
  const [query, setQuery] = useState("");
  const [municipio, setMunicipio] = useState("");

  const filtered = PRODUCERS.filter((p) => {
    const matchQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.family.toLowerCase().includes(query.toLowerCase());
    const matchPlace = !municipio || p.place === municipio;
    return matchQuery && matchPlace;
  });

  return (
    <PublicLayout>
      <div className="pr-page">
        {/* Hero con imagen de campo (frame: hero-section) */}
        <section
          className="pr-hero"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <div className="pr-hero-overlay">
            <span className="pr-hero-badge">
              👨‍🌾 Nuestras manos trabajadoras
            </span>
            <h1>Conoce a nuestros productores</h1>
            <p>
              Conectamos hogares con las familias campesinas que cultivan y
              cosechan cada fruta, verdura y café con orgullo y dedicación en
              las regiones de Urabá.
            </p>
          </div>
        </section>

        {/* Directorio (frame: directory-container) */}
        <section className="pr-directory">
          <div className="pr-toolbar">
            <div className="pr-toolbar-info">
              <h2>Nuestros Productores</h2>
              <p>Encuentra y conoce a las personas detrás de tu alimentación</p>
            </div>
            <div className="pr-toolbar-controls">
              <input
                type="search"
                className="pr-search"
                placeholder="Buscar por nombre o municipio..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar productor"
              />
              <select
                className="pr-select"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                aria-label="Filtrar por municipio"
              >
                <option value="">Todos los Municipios</option>
                {MUNICIPIOS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pr-grid">
            {filtered.map((p) => (
              <article className="pr-card" key={p.name}>
                <img className="pr-card-img" src={p.img} alt={p.name} />
                <div className="pr-card-body">
                  <div className="pr-card-head">
                    <h3>{p.name}</h3>
                    <span className="pr-place">
                      <img src={mapPinIcon} alt="" width="12" height="12" />
                      {p.place}
                    </span>
                  </div>
                  <p className="pr-family">{p.family}</p>
                  <hr className="pr-divider" />
                  <div className="pr-rating-row">
                    <span className="pr-stars" aria-hidden="true">
                      ★★★★★
                    </span>
                    <span className="pr-score">{p.rating.toFixed(1)}</span>
                    <span className="pr-reviews">{p.reviews} Reseñas</span>
                  </div>
                  <Link
                    className="pr-btn"
                    to={`/catalogo?productor=${encodeURIComponent(p.name)}`}
                  >
                    Ver perfil del Productor
                  </Link>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="pr-empty">
                No se encontraron productores con esos criterios.
              </p>
            )}
          </div>
        </section>

        {/* CTA para productores (frame: farmer-cta) */}
        <section className="pr-cta">
          <div className="pr-cta-left">
            <span className="pr-cta-icon">
              <img src={handHeartIcon} alt="" width="28" height="28" />
            </span>
            <div>
              <h2>¿Eres productor agrícola colombiano?</h2>
              <p>
                Únete a AgroMarket, elimina intermediarios injustos y empieza a
                vender tus cosechas al precio real que merece tu esfuerzo.
              </p>
            </div>
          </div>
          <Link className="pr-cta-btn" to="/registro?rol=PRODUCTOR">
            Quiero ser parte de la red
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
}
