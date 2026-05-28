// site-info.js: fetch /api/public/site-info and populate elements with data-site attributes
import api from "./api.js";

async function loadSiteInfo() {
  try {
    const info =
      (await api.getSiteInfo?.()) ||
      (await fetch("/api/public/site-info").then((r) =>
        r.ok ? r.json() : null,
      ));
    if (!info) return;
    document.querySelectorAll("[data-site]").forEach((el) => {
      const key = el.getAttribute("data-site");
      if (key && info[key]) {
        el.textContent = info[key];
        el.style.display = "";
      }
    });
  } catch (e) {
    // silent fallback
    console.debug("site-info load failed", e);
  }
}

document.addEventListener("DOMContentLoaded", loadSiteInfo);
