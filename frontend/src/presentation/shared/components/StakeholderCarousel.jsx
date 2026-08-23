import React from "react";
import "./stakeholder-carousel.css";

const STAKEHOLDERS = [
  {
    id: "asafrut",
    name: "ASAFRUT",
    description: "Organización promotora de AgroMarket",
    image: "/by/asafrut.jpg",
    type: "organization",
  },
  {
    id: "sic",
    name: "SIC",
    description: "Entidad relacionada con el proyecto",
    image: "/stakeholders/sic.svg",
    type: "organization",
  },
  {
    id: "developer",
    name: "Deyner Chaverra",
    description: "Desarrollador de AgroMarket",
    image: "/by/Deyner.png",
    type: "developer",
    prefix: "Desarrollado por",
  },
];

function StakeholderCard({ stakeholder }) {
  return (
    <article
      className={`stakeholder-card stakeholder-card--${stakeholder.type}`}
      tabIndex={0}
      aria-label={`${stakeholder.name}. ${stakeholder.description}`}
    >
      <div className="stakeholder-card__image-wrapper">
        <img
          className="stakeholder-card__image"
          src={stakeholder.image}
          alt={stakeholder.name}
          loading="lazy"
          draggable="false"
        />
      </div>

      <div className="stakeholder-card__content">
        {stakeholder.prefix && (
          <span className="stakeholder-card__prefix">{stakeholder.prefix}</span>
        )}

        <h3 className="stakeholder-card__name">{stakeholder.name}</h3>

        <p className="stakeholder-card__description">
          {stakeholder.description}
        </p>
      </div>
    </article>
  );
}

function StakeholderGroup({ ariaHidden = false }) {
  return (
    <div className="stakeholder-carousel__group" aria-hidden={ariaHidden}>
      {STAKEHOLDERS.map((stakeholder) => (
        <div
          className="stakeholder-carousel__item"
          key={`${ariaHidden ? "clone" : "original"}-${stakeholder.id}`}
        >
          <StakeholderCard stakeholder={stakeholder} />
        </div>
      ))}
    </div>
  );
}

export default function StakeholderCarousel() {
  return (
    <section
      className="stakeholder-section"
      aria-labelledby="stakeholder-title"
    >
      <div className="stakeholder-section__header">
        <div className="stakeholder-section__heading">
          <span className="stakeholder-section__eyebrow">
            ECOSISTEMA AGROMARKET
          </span>

          <h2 id="stakeholder-title">Aliados y responsables del proyecto</h2>
        </div>

        <p className="stakeholder-section__description">
          Espacios destinados a ASAFRUT, entidades relacionadas, aliados
          institucionales y responsables del desarrollo de la plataforma.
        </p>
      </div>

      <div className="stakeholder-carousel">
        <div className="stakeholder-carousel__viewport">
          <div className="stakeholder-carousel__track">
            {/* GRUPO ORIGINAL */}
            <StakeholderGroup />

            {/* GRUPO CLONADO PARA EL LOOP INFINITO */}
            <StakeholderGroup ariaHidden />
          </div>
        </div>
      </div>
    </section>
  );
}
