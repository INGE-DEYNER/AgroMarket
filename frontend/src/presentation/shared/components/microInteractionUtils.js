export function animateToCart(sourceElement, targetSelector = ".buyer-cart-button, .cart-button, [data-cart-target]") {
  if (typeof window === "undefined" || !sourceElement) return;
  const target = document.querySelector(targetSelector);
  if (!target) return;
  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const dot = document.createElement("span");
  dot.className = "am-cart-flight";
  dot.setAttribute("aria-hidden", "true");
  dot.textContent = "✓";
  dot.style.left = `${sourceRect.left + sourceRect.width / 2}px`;
  dot.style.top = `${sourceRect.top + sourceRect.height / 2}px`;
  dot.style.setProperty("--am-flight-x", `${targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2)}px`);
  dot.style.setProperty("--am-flight-y", `${targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2)}px`);
  document.body.appendChild(dot);
  window.setTimeout(() => dot.remove(), 600);
}
