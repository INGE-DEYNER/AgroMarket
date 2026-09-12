import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { translateText } from "@/infrastructure/translation/translationApi";
import {
  getCachedTranslation,
  setCachedTranslation,
} from "@/infrastructure/translation/translationCache";

const ATTR_ORIGINAL = "data-agromarket-original";
const ATTR_LANG = "data-agromarket-lang";
const ATTR_PENDING = "data-agromarket-pending";

const TEXT_ATTRIBUTES = ["placeholder", "aria-label", "title"];

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "INPUT", "TEXTAREA",
  "SELECT", "OPTION", "CODE", "PRE",
]);

function normalizeLang(lng) {
  return String(lng || "es").split("-")[0].toLowerCase();
}

function isTranslatableText(text) {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(trimmed)) return false;
  if (/^(https?:\/\/|www\.|#|\/|\+57|\+)/i.test(trimmed)) return false;
  if (/^[$€£¥R]|COP|USD|EUR|^\d[\d\s.,-]*$/.test(trimmed) && trimmed.length < 25) {
    return false;
  }
  // Excluir textos que son solo código, ids o valores técnicos
  if (/^[a-z0-9_.-]+$/i.test(trimmed) && trimmed.length < 40) return false;
  if (/^\{?\{\{.*\}\}?\}$/.test(trimmed)) return false;
  return true;
}

// Palabras clave por idioma objetivo para detectar texto que YA está en ese idioma
const TARGET_HINTS = {
  en: /\b(the|and|you|your|order|cart|product|add|buy|search|total|subtotal|shipping|checkout|category|price|payment|address|name|phone|email|continue|back|save|delete|success|error|loading|welcome|home|shop|menu|account|profile)\b/i,
  pt: /\b(o|a|os|as|você|seu|sua|pedido|carrinho|produto|adicionar|comprar|buscar|total|frete|endereço|nome|telefone|email|continuar|voltar|salvar|excluir|sucesso|erro|carregando|bem-vindo|início|loja|conta|perfil)\b/i,
  fr: /\b(le|la|les|vous|votre|commande|panier|produit|ajouter|acheter|rechercher|total|livraison|adresse|nom|téléphone|email|continuer|retour|enregistrer|supprimer|succès|erreur|chargement|bienvenue|accueil|boutique|compte|profil)\b/i,
  de: /\b(der|die|das|sie|ihre|ihr|bestellung|warenkorb|produkt|hinzufügen|kaufen|suchen|gesamt|versand|adresse|name|telefon|e-mail|weiter|zurück|speichern|löschen|erfolg|fehler|laden|willkommen|startseite|laden|konto|profil)\b/i,
  zh: /[\u4e00-\u9fff]/,
  ar: /[\u0600-\u06FF]/,
};

function looksLikeTargetLanguage(text, lang) {
  const hints = TARGET_HINTS[lang];
  if (!hints) return false;
  return hints.test(text);
}
export default function useAutoTranslateAll({ enabled = true } = {}) {
  const { i18n } = useTranslation();
  const queueRef = useRef([]);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const lang = normalizeLang(i18n.resolvedLanguage || i18n.language);

    if (lang === "es") {
      // Restaurar textos originales al volver a español
      document.querySelectorAll(`[${ATTR_ORIGINAL}]`).forEach((el) => {
        const original = el.getAttribute(ATTR_ORIGINAL);
        if (original != null && el.textContent !== original) {
          el.textContent = original;
        }
        el.setAttribute(ATTR_LANG, "es");
      });
      // Restaurar atributos traducidos
      document.querySelectorAll(`[data-agromarket-attr]`).forEach((el) => {
        const attrsJson = el.getAttribute("data-agromarket-attr");
        if (!attrsJson) return;
        try {
          const attrs = JSON.parse(attrsJson);
          TEXT_ATTRIBUTES.forEach((attr) => {
            if (attrs[attr]) el.setAttribute(attr, attrs[attr]);
          });
        } catch {
          /* ignore */
        }
        el.removeAttribute("data-agromarket-attr");
      });
      queueRef.current = [];
      return undefined;
    }

    const pump = async () => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        while (queueRef.current.length > 0) {
          const job = queueRef.current.shift();
          if (job?.type === "attr") {
            await processAttr(job);
            continue;
          }
          const node = job;
          if (!node?.parentElement) continue;
          const el = node.parentElement;
          if (SKIP_TAGS.has(el.tagName)) continue;
          const original = el.getAttribute(ATTR_ORIGINAL) ?? node.textContent;
          if (!isTranslatableText(original)) continue;
          if (el.getAttribute(ATTR_LANG) === lang) continue;
          if (el.getAttribute(ATTR_PENDING) === lang) continue;
          // Si el texto ya está en el idioma destino, marcarlo y no re-traducir
          if (looksLikeTargetLanguage(original, lang)) {
            if (!el.hasAttribute(ATTR_ORIGINAL)) {
              el.setAttribute(ATTR_ORIGINAL, original);
            }
            el.setAttribute(ATTR_LANG, lang);
            continue;
          }
          if (!el.hasAttribute(ATTR_ORIGINAL)) {
            el.setAttribute(ATTR_ORIGINAL, original);
          }
          const cached = getCachedTranslation(original, "es", lang);
          if (cached) {
            el.textContent = cached;
            el.setAttribute(ATTR_LANG, lang);
            continue;
          }
          el.setAttribute(ATTR_PENDING, lang);
          try {
            const translated = await translateText(original, "es", lang);
            if (translated && translated !== original) {
              setCachedTranslation(original, "es", lang, translated);
              const currentLang = normalizeLang(
                i18n.resolvedLanguage || i18n.language,
              );
              if (currentLang === lang && node.isConnected) {
                el.textContent = translated;
                el.setAttribute(ATTR_LANG, lang);
              }
            } else {
              el.setAttribute(ATTR_LANG, lang);
            }
          } catch {
            el.setAttribute(ATTR_LANG, lang);
          } finally {
            el.removeAttribute(ATTR_PENDING);
          }
          await new Promise((r) => setTimeout(r, 0));
        }
      } finally {
        busyRef.current = false;
      }
    };

    async function processAttr(job) {
      const { el, attr, original } = job;
      if (!el?.isConnected) return;
      if (el.getAttribute(attr) !== original) return;
      if (!isTranslatableText(original)) return;
      if (el.dataset.agromarketAttrLang === `${lang}:${attr}`) return;
      // No re-traducir si ya está en el idioma destino
      if (looksLikeTargetLanguage(original, lang)) {
        el.dataset.agromarketAttrLang = `${lang}:${attr}`;
        return;
      }
      const cached = getCachedTranslation(original, "es", lang);
      if (cached) {
        el.setAttribute(attr, cached);
        el.dataset.agromarketAttrLang = `${lang}:${attr}`;
        return;
      }
      try {
        const translated = await translateText(original, "es", lang);
        if (translated && translated !== original) {
          setCachedTranslation(original, "es", lang, translated);
          const currentLang = normalizeLang(
            i18n.resolvedLanguage || i18n.language,
          );
          if (currentLang === lang && el.isConnected && el.getAttribute(attr) === original) {
            el.setAttribute(attr, translated);
            el.dataset.agromarketAttrLang = `${lang}:${attr}`;
          }
        }
      } catch {
        /* ignore */
      }
    }
const collect = (root = document.body) => {
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let node = walker.nextNode();
      while (node) {
        const parent = node.parentElement;
        if (parent && !SKIP_TAGS.has(parent.tagName) && node.textContent && node.textContent.trim().length >= 2) {
          nodes.push(node);
        }
        node = walker.nextNode();
      }
      queueRef.current.push(...nodes);

      // Traducir atributos placeholder / aria-label / title
      if (root.nodeType === Node.ELEMENT_NODE || root.nodeType === Node.DOCUMENT_NODE) {
        document.querySelectorAll("[placeholder], [aria-label], [title]").forEach((el) => {
          const tracked = {};
          try {
            const saved = el.getAttribute("data-agromarket-attr");
            if (saved) Object.assign(tracked, JSON.parse(saved));
          } catch { /* ignore */ }
          TEXT_ATTRIBUTES.forEach((attr) => {
            const value = el.getAttribute(attr);
            if (!value || !isTranslatableText(value)) return;
            tracked[attr] = value;
            queueRef.current.push({ type: "attr", el, attr, original: value });
          });
          if (Object.keys(tracked).length > 0) {
            el.setAttribute("data-agromarket-attr", JSON.stringify(tracked));
          }
        });
      }

      void pump();
    };

    collect(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE) {
              queueRef.current.push(n);
            } else if (n.nodeType === Node.ELEMENT_NODE) {
              collect(n);
            }
          });
        } else if (m.type === "characterData" && m.target) {
          queueRef.current.push(m.target);
        } else if (m.type === "attributes" && m.target?.nodeType === Node.ELEMENT_NODE) {
          collect(m.target);
        }
      }
      void pump();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title"],
    });

    return () => {
      observer.disconnect();
      queueRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.resolvedLanguage, i18n.language, enabled]);

  return null;
}