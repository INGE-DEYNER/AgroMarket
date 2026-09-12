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
  return true;
}
export default function useAutoTranslateAll({ enabled = true } = {}) {
  const { i18n } = useTranslation();
  const queueRef = useRef([]);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const lang = normalizeLang(i18n.resolvedLanguage || i18n.language);

    if (lang === "es") {
      document.querySelectorAll(`[${ATTR_ORIGINAL}]`).forEach((el) => {
        const original = el.getAttribute(ATTR_ORIGINAL);
        if (original != null && el.textContent !== original) {
          el.textContent = original;
        }
        el.setAttribute(ATTR_LANG, "es");
      });
      queueRef.current = [];
      return undefined;
    }

    const pump = async () => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        while (queueRef.current.length > 0) {
          const node = queueRef.current.shift();
          if (!node?.parentElement) continue;
          const el = node.parentElement;
          if (SKIP_TAGS.has(el.tagName)) continue;
          const original = el.getAttribute(ATTR_ORIGINAL) ?? node.textContent;
          if (!isTranslatableText(original)) continue;
          if (el.getAttribute(ATTR_LANG) === lang) continue;
          if (el.getAttribute(ATTR_PENDING) === lang) continue;
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
        }
      }
      void pump();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      queueRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.resolvedLanguage, i18n.language, enabled]);

  return null;
}
