// site-info.js: fetch /api/public/site-info and populate elements with data-site attributes
import api from "./api.js";

async function loadSiteInfo() {
  try {
    const info =
      (await api.getSiteInfo?.()) ||
      (await fetch("/api/public/site-info").then((r) =>
        r.ok ? r.json() : null,
      ));
    if (!info) {
      window.__siteInfo = {};
      return;
    }
    window.__siteInfo = info;
    window.getSite = (key) => window.__siteInfo?.[key] || null;
    document.querySelectorAll("[data-site]").forEach((el) => {
      const key = el.getAttribute("data-site");
      if (key && info[key]) {
        el.textContent = info[key];
        el.style.display = "";
      }
    });
  } catch (e) {
    window.__siteInfo = {};
    window.getSite = () => null;
    console.debug("site-info load failed", e);
  }
}

document.addEventListener("DOMContentLoaded", loadSiteInfo);

export default { loadSiteInfo };
