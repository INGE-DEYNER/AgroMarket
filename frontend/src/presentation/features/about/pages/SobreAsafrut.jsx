import PublicLayout from "@/presentation/shared/components/PublicLayout";
import StakeholderCarousel from "@/presentation/shared/components/StakeholderCarousel";
import aboutImg from "@/assets/asafrut-about.png";
import "@/presentation/styles/public-views.css";

const PILARES = [
  {
    title: "Representación Genuina",
    text: "Damos voz y visibilidad digital a más de 300 campesinos en el Urabá antioqueño.",
  },
  {
    title: "Sostenibilidad Ambiental",
    text: "Promovemos prácticas agrícolas libres de químicos dañinos, respetando la riqueza del suelo.",
  },
  {
    title: "Excelencia y Calidad",
    text: "Capacitamos a los productores para garantizar que la frescura y presentación del alimento cumpla estándares altos.",
  },
  {
    title: "Justicia Comercial",
    text: "Establecemos comisiones nulas para que el productor sea el verdadero dueño de su margen comercial.",
  },
];

export default function SobreAsafrut() {
  return (
    <PublicLayout>
      <div className="sa-page">
        {/* Migas de pan (frame: breadcrumb) */}
        <nav className="sa-breadcrumb" aria-label="Migas de pan">
          <span>Inicio</span>
          <span aria-hidden="true">›</span>
          <strong>Sobre Asafrut</strong>
        </nav>

        {/* Introducción (frame: intro row) */}
        <section className="sa-intro">
          <div className="sa-intro-texts">
            <h1>Sobre Asafrut y la Asociación Campesina</h1>
            <p>
              Asafrut nació en el corazón de Urabá como una alianza de familias
              cultivadoras que buscaban proteger la agricultura familiar.
            </p>
            <p>
              Somos una organización sin fines de lucro enfocada en empoderar
              tecnológicamente, logísticamente y económicamente a los pequeños
              productores. A través de AgroMarket, abrimos una ventana digital
              directa para que el fruto del trabajo diario viaje sin rodeos
              hasta tu alacena en todo el territorio nacional.
            </p>
          </div>
          <img
            className="sa-intro-img"
            src={aboutImg}
            alt="Asociación campesina Asafrut"
            loading="lazy"
          />
        </section>

        {/* Misión y Visión (frame: mission-vision) */}
        <section className="sa-mission-vision">
          <article className="sa-card-lg">
            <h2>Nuestra Misión</h2>
            <p>
              Impulsar el desarrollo sostenible de la comunidad campesina en
              Urabá, facilitando el acceso equitativo al comercio justo,
              garantizando la conservación ecológica del territorio y proveyendo
              frescura óptima a los hogares colombianos.
            </p>
          </article>
          <article className="sa-card-lg">
            <h2>Nuestra Visión</h2>
            <p>
              Para el 2030, ser el modelo asociativo agrícola y de comercio
              electrónico directo referente en Colombia, beneficiando a más de
              5,000 familias productoras y liderando la transición hacia un
              consumo consciente y local a gran escala.
            </p>
          </article>
        </section>

        {/* Pilares (frame: grid) */}
        <section className="sa-pillars">
          <header className="sa-pillars-head">
            <h2>Nuestros Pilares de Calidad</h2>
            <p>
              Valores que guían nuestra labor diaria de sol a sol en el campo
            </p>
          </header>
          <div className="sa-pillars-grid">
            {PILARES.map((p) => (
              <article className="sa-card-sm" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Ecosistema AgroMarket — Aliados y responsables del proyecto.
            Sección movida desde el Footer compartido (info institucional). */}
        <div id="ecosistema">
          <StakeholderCarousel />
        </div>
      </div>
    </PublicLayout>
  );
}
