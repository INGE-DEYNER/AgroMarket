const DEFAULT_SITE_INFO = {
  siteName: "AgroMarket",
  siteRegion: "Urabá",
  siteTagline: "Plataforma de comercio agrícola",
  supportEmail: "soporte@agromarket.local",
};

function loadSiteInfo() {
  const info = { ...DEFAULT_SITE_INFO };

  document.querySelectorAll("[data-site]").forEach((el) => {
    const key = el.dataset.site;
    const currentValue = el.textContent?.trim();
    if (key && currentValue) {
      info[key] = currentValue;
    }
  });

  globalThis.__siteInfo = info;
  globalThis.getSite = (key) => globalThis.__siteInfo?.[key] || null;

  document.querySelectorAll("[data-site]").forEach((el) => {
    const key = el.dataset.site;
    if (key && info[key]) {
      el.textContent = info[key];
      el.style.display = "";
    }
  });
}

document.addEventListener("DOMContentLoaded", loadSiteInfo);

export default { loadSiteInfo, DEFAULT_SITE_INFO };
