import { useEffect } from "react";
import i18n from "@/i18n/index";

function flatten(value, prefix = "", out = {}) {
  if (!value || typeof value !== "object") return out;
  Object.entries(value).forEach(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === "object" && !Array.isArray(item)) flatten(item, path, out);
    else if (typeof item === "string") out[path] = item;
  });
  return out;
}

function normalize(text) { return String(text || "").replace(/\s+/g, " ").trim(); }

export default function LegacyI18nBridge() {
  useEffect(() => {
    const original = new WeakMap();
    const translated = new WeakMap();
    let frame = 0;

    const buildMaps = () => {
      const es = flatten(i18n.getResourceBundle("es", "translation") || {});
      const current = flatten(i18n.getResourceBundle(i18n.resolvedLanguage || i18n.language || "es", "translation") || {});
      const map = new Map();
      Object.entries(es).forEach(([key, spanish]) => {
        const target = current[key];
        if (typeof target === "string" && target && target !== spanish) map.set(normalize(spanish), target);
      });
      return map;
    };

    const scan = () => {
      const map = buildMaps();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(parent.tagName)) continue;
        if (!original.has(node)) {
          const candidate = normalize(node.nodeValue);
          if (!map.has(candidate)) continue;
          original.set(node, node.nodeValue);
        }
        const base = normalize(original.get(node));
        const target = map.get(base);
        if (target) {
          const raw = original.get(node);
          const lead = raw.match(/^\s*/)?.[0] || "";
          const trail = raw.match(/\s*$/)?.[0] || "";
          const nextValue = `${lead}${target}${trail}`;
          if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
          translated.set(node, target);
        } else if (translated.has(node)) {
          const originalValue = original.get(node);
          if (node.nodeValue !== originalValue) node.nodeValue = originalValue;
          translated.delete(node);
        }
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    const onLanguage = () => schedule();
    i18n.on("languageChanged", onLanguage);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      i18n.off("languageChanged", onLanguage);
    };
  }, []);
  return null;
}
