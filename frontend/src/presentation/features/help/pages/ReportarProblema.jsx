import { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/presentation/shared/components/Icon";
import PublicLayout from "@/presentation/shared/components/PublicLayout";
import "@/presentation/styles/public-views.css";

export default function ReportarProblema() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ category: "general", subject: "", description: "", email: "" });
  const submit = (e) => {
    e.preventDefault();
    const reports = JSON.parse(localStorage.getItem("agromarket-support-reports") || "[]");
    reports.push({ ...form, createdAt: new Date().toISOString(), id: crypto.randomUUID() });
    localStorage.setItem("agromarket-support-reports", JSON.stringify(reports));
    setSent(true);
  };
  const openAssistant = () => {
    document.querySelector(".chatbot-trigger")?.click();
    document.querySelector(".chatbot-window")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  return <PublicLayout><div className="page-wrap report-page">
    <nav className="breadcrumb" aria-label={t("report.breadcrumb", "Breadcrumb")}><span>{t("nav.home")}</span><span>›</span><strong>{t("report.title")}</strong></nav>
    <section className="report-card">
      <div className="report-card-head">
        <div className="report-heading"><span className="report-icon">!</span><div><h1>{t("report.title")}</h1><p>{t("report.subtitle")}</p></div></div>
      </div>
      {sent ? <div className="report-success"><span className="report-success-badge"><Icon name="check" size={26} /></span><h2>{t("report.successTitle")}</h2><p>{t("report.successText")}</p><button type="button" onClick={() => { setSent(false); setForm({ category: "general", subject: "", description: "", email: "" }); }}>{t("report.newReport")}</button></div> : <form className="report-form" onSubmit={submit}>
        <label>{t("report.category")}<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="general">{t("report.categories.general")}</option><option value="account">{t("report.categories.account")}</option><option value="purchase">{t("report.categories.purchase")}</option><option value="payment">{t("report.categories.payment")}</option><option value="shipping">{t("report.categories.shipping")}</option><option value="product">{t("report.categories.product")}</option><option value="technical">{t("report.categories.technical")}</option></select></label>
        <label>{t("report.subject")}<input required maxLength={120} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t("report.subjectPlaceholder")} /></label>
        <label>{t("report.description")}<textarea required minLength={10} maxLength={1500} rows={7} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("report.descriptionPlaceholder")} /></label>
        <label>{t("report.email")}<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t("report.emailPlaceholder")} /></label>
        <button className="report-submit" type="submit">{t("report.submit")}</button>
      </form>}
    </section>
    <section className="report-help"><h2>{t("report.helpTitle")}</h2><p>{t("report.helpText")}</p><button type="button" onClick={openAssistant}>{t("report.openAssistant")}</button></section>
  </div></PublicLayout>;
}
