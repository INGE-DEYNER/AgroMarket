import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import heroImg from "@/assets/producers-hero.png";
import handHeartIcon from "@/assets/icon-hand-heart.svg";
import mapPinIcon from "@/assets/icon-map-pin.svg";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/public-views.css";
import Icon from "@/presentation/shared/components/Icon";

function extractArray(response) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export default function Productores() {
  const [query, setQuery] = useState("");
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/usuarios?rol=PRODUCTOR&size=50")
      .then((res) => {
        if (!active) return;
        setProducers(extractArray(res));
      })
      .catch((err) => {
        console.error("Error cargando productores:", err);
        setProducers([]);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = producers.filter((p) => {
    const name = `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
    const company = p.companyName ?? "";
    const matchQuery =
      !query ||
      name.toLowerCase().includes(query.toLowerCase()) ||
      company.toLowerCase().includes(query.toLowerCase());
    return matchQuery;
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
              <Icon name="users" size={24} className="inline mr-2" /> Nuestras manos trabajadoras
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
                placeholder="Buscar por nombre o empresa..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar productor"
              />
            </div>
          </div>

          {loading ? (
            <div className="hm-loading">Cargando productores...</div>
          ) : (
            <div className="pr-grid">
              {filtered.map((p) => {
                const name = `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Productor";
                const rating = p.averageRating ?? 0;
                return (
                  <article className="pr-card" key={p.id ?? p.domainId}>
                    <div
                      className="pr-card-img"
                      style={{
                        background: "var(--card-bg, #1e1e1e)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "3.5rem",
                        minHeight: 120,
                      }}
                    >
                      <Icon name="user" size={48} className="mx-auto text-green-600" />
                    </div>
                    <div className="pr-card-body">
                      <div className="pr-card-head">
                        <h3>{p.companyName || name}</h3>
                        {p.location && (
                          <span className="pr-place">
                            <img src={mapPinIcon} alt="" width="12" height="12" />
                            {p.location}
                          </span>
                        )}
                      </div>
                      {p.companyName && <p className="pr-family">{name}</p>}
                      <hr className="pr-divider" />
                      <div className="pr-rating-row">
                        {rating > 0 ? (
                          <>
                            <span className="pr-stars" aria-hidden="true"><span className="flex justify-center text-yellow-500"><Icon name="star" size={16}/><Icon name="star" size={16}/><Icon name="star" size={16}/><Icon name="star" size={16}/><Icon name="star" size={16}/></span></span>
                            <span className="pr-score">{rating.toFixed(1)}</span>
                          </>
                        ) : (
                          <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
                            Sin calificaciones aún
                          </span>
                        )}
                      </div>
                      <Link
                        className="pr-btn"
                        to={`/catalogo?productor=${encodeURIComponent(name)}`}
                      >
                        Ver productos
                      </Link>
                    </div>
                  </article>
                );
              })}
              {filtered.length === 0 && !loading && (
                <p className="pr-empty">
                  {query
                    ? "No se encontraron productores con esos criterios."
                    : "Aún no hay productores registrados en la plataforma."}
                </p>
              )}
            </div>
          )}
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
