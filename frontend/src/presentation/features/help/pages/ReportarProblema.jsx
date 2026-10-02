import { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/presentation/shared/components/Icon";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/public-views.css";

/*
 * Pagina "Reportar un problema".
 *
 * ANTES: el submit hacia e.preventDefault() y guardaba el reporte en
 * localStorage. El usuario veia "enviado con exito" y el mensaje se perdia:
 * se quedaba en su navegador y AgroMarket no se enteraba nunca. Era la peor
 * combinacion posible en un formulario de soporte, porque el que tenia un
 * problema se quedaba creyendo que habia avisado.
 *
 * AHORA: el reporte va a POST /api/v1/soporte/reportes, que lo guarda en Mongo
 * y avisa por correo al buzon de soporte. Si el backend no responde, se dice
 * que fallo y se ofrece la alternativa de WhatsApp, en vez de fingir exito.
 */
export default function ReportarProblema() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  // { text, field }. El error va pegado al campo que lo provoco, no arriba: un
  // mensaje generico obliga a buscar cual de los 4 campos es el culpable.
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ category: "general", subject: "", description: "", email: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);

    try {
      // Se llega aqui solo con 2xx: el backend devuelve 201 con el id.
      await api.post("/soporte/reportes", {
        category: form.category,
        subject: form.subject,
        description: form.description,
        email: form.email,
      });
      setSent(true);
    } catch (err) {
      // 429 es el limite por IP: el mensaje tecnico ayudaria menos que decir
      // que espere un minuto.
      if (err?.status === 429) {
        setError({
          field: "form",
          text: t("report.tooMany", "Has enviado varios reportes seguidos. Espera un minuto e inténtalo de nuevo."),
        });
      } else {
        setError({
          field: "form",
          text: t("report.sendError", "No pudimos enviar tu reporte. Revisa tu conexión o escríbenos por WhatsApp."),
        });
      }
    } finally {
      setSending(false);
    }
  };

  const openAssistant = () => {
    document.querySelector(".chatbot-trigger")?.click();
    document.querySelector(".chatbot-window")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const campoError = (campo) => (error && error.field === campo ? error.text : null);

  return <PublicLayout><div className="page-wrap report-page">
    <nav className="breadcrumb" aria-label={t("report.breadcrumb", "Breadcrumb")}><span>{t("nav.home")}</span><span>›</span><strong>{t("report.title")}</strong></nav>
    <section className="report-card">
      <div className="report-card-head">
        <div className="report-heading"><span className="report-icon">!</span><div><h1>{t("report.title")}</h1><p>{t("report.subtitle")}</p></div></div>
      </div>
      {sent ? <div className="report-success"><span className="report-success-badge"><Icon name="check" size={26} /></span><h2>{t("report.successTitle")}</h2><p>{t("report.successText")}</p><button type="button" onClick={() => { setSent(false); setForm({ category: "general", subject: "", description: "", email: "" }); }}>{t("report.newReport")}</button></div> : <form className="report-form" onSubmit={submit} noValidate>
        <label>{t("report.category")}<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="general">{t("report.categories.general")}</option><option value="account">{t("report.categories.account")}</option><option value="purchase">{t("report.categories.purchase")}</option><option value="payment">{t("report.categories.payment")}</option><option value="shipping">{t("report.categories.shipping")}</option><option value="product">{t("report.categories.product")}</option><option value="technical">{t("report.categories.technical")}</option></select></label>
        <label>{t("report.subject")}<input required maxLength={120} aria-invalid={!!campoError("subject")} aria-describedby={campoError("subject") ? "report-err-subject" : undefined} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t("report.subjectPlaceholder")} />{campoError("subject") && <small className="report-field-error" id="report-err-subject" role="alert">{campoError("subject")}</small>}</label>
        <label>{t("report.description")}<textarea required minLength={10} maxLength={1500} rows={7} aria-invalid={!!campoError("description")} aria-describedby={campoError("description") ? "report-err-description" : undefined} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("report.descriptionPlaceholder")} />{campoError("description") && <small className="report-field-error" id="report-err-description" role="alert">{campoError("description")}</small>}</label>
        <label>{t("report.email")}<input type="email" aria-invalid={!!campoError("email")} aria-describedby={campoError("email") ? "report-err-email" : "report-email-hint"} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t("report.emailPlaceholder")} /><small className="report-field-hint" id="report-email-hint">{t("report.emailHint", "Opcional. Si lo dejas, te respondemos por correo.")}</small>{campoError("email") && <small className="report-field-error" id="report-err-email" role="alert">{campoError("email")}</small>}</label>

        {campoError("form") && <p className="report-form-error" role="alert">{campoError("form")}</p>}

        <button className="report-submit" type="submit" disabled={sending}>
          {sending ? t("report.sending", "Enviando…") : t("report.submit")}
        </button>
      </form>}
    </section>
    <section className="report-help"><h2>{t("report.helpTitle")}</h2><p>{t("report.helpText")}</p><button type="button" onClick={openAssistant}>{t("report.openAssistant")}</button></section>
  </div></PublicLayout>;
}
