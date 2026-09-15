import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import { useDivisa } from "@/app/hooks/useDivisa";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/CartDrawer.css";

export default function CartDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const { formatearPrecio } = useDivisa();
  // Divisa global reactiva: todo el carrito refleja idioma + divisa al instante.
  const formatPrice = (v) => formatearPrecio(v);
  const { cart, removeFromCart, updateQuantity, total, count } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();

  /*
   * Costo de envío provisto por el backend (GET /envios/config).
   * Mismo valor que el backend aplicará al crear el pedido, de modo
   * que el total mostrado aquí coincida con el del checkout y el pago.
   */
  const [costoEnvio, setCostoEnvio] = useState(15000);

  useEffect(() => {
    let mounted = true;

    api
      .get("/envios/config")
      .then((res) => {
        const data = res?.data || res;
        const valor = Number(data?.costoEnvio);
        if (mounted && Number.isFinite(valor) && valor >= 0) {
          setCostoEnvio(valor);
        }
      })
      .catch(() => {
        // Sin sesión o sin conexión: se conserva el valor por defecto.
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }

    if (!user) {
      localStorage.setItem("redirect_after_login", "/checkout");
      onClose();
      navigate("/login?message=inicia_sesion");
      return;
    }

    onClose();
    navigate("/checkout");
  };

  /*
   * IMPORTANTE:
   * Cuando el carrito está cerrado NO EXISTE ningún overlay
   * ni ningún drawer en el DOM.
   *
   * Esto elimina definitivamente el problema de la pantalla
   * oscura/desenfocada del Home.
   *
   * FIX REGRESIÓN "el carrito no se muestra":
   * El drawer se renderiza ahora vía PORTAL directamente en
   * document.body. Antes vivía dentro del <header> sticky del
   * navbar, cuyas reglas (backdrop-filter en .navbar-header.scrolled,
   * z-index, múltiples bloques duplicados de .cart-drawer en
   * styles.css) podían convertirlo en el "containing block" del
   * position:fixed y dejar el drawer fuera de pantalla o por debajo
   * del propio navbar. Con el portal + el CSS de alta especificidad
   * de CartDrawer.css el drawer siempre es visible sin importar la
   * página ni el estado del scroll.
   */
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="cart-drawer-root">
      <div
        className="cart-drawer-overlay open"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="cart-drawer open"
        role="dialog"
        aria-modal="true"
        aria-label={t("catalog.cartAria", "Carrito de compras")}
      >
        <div className="cart-header">
          <div className="cart-header-title">
            {t("catalog.cartTitle", "Mi carrito")}

            <span className="cart-items-count">
              ({count} {t("catalog.cartItems", "items")})
            </span>
          </div>

          <button
            type="button"
            className="cart-close"
            onClick={onClose}
            aria-label={t("catalog.closeCart", "Cerrar carrito")}
          >
            ✕
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg
                viewBox="0 0 24 24"
                width="80"
                height="80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="cart-empty-svg"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />

                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />

                <path strokeLinecap="round" d="M12 9h4M14 7v4" />
              </svg>

              <div className="cart-empty-text">
                {t("catalog.emptyCart", "Tu carrito está vacío")}
              </div>

              <button
                type="button"
                className="btn-keep-shopping-empty"
                onClick={onClose}
              >
                {t("catalog.startShopping", "Comenzar a comprar")}
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const isWholesale =
                item.cantidadMinimaMayorista &&
                item.precioMayorista &&
                item.qty >= item.cantidadMinimaMayorista;

              let unitPrice = Number(item.precio);
              let isPromotion = false;

              if (isWholesale) {
                unitPrice = Number(item.precioMayorista);
              } else if (item.enPromocion && item.precioPromocion) {
                unitPrice = Number(item.precioPromocion);
                isPromotion = true;
              }

              return (
                <div key={item.id} className="cart-item-row">
                  <img
                    src={
                      item.imagenUrl ||
                      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120"
                    }
                    alt={item.nombre}
                    className="cart-item-thumb"
                  />

                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.nombre}</div>

                    <div className="cart-item-price">
                      {isWholesale ? (
                        <>
                          <span className="price-old">
                            {formatPrice(item.precio)}{t("catalog.perKg", "/kg")}
                          </span>

                          <span className="price-wholesale">
                            {formatPrice(unitPrice)}{t("catalog.perKg", "/kg")}
                          </span>
                        </>
                      ) : isPromotion ? (
                        <>
                          <span className="price-old">
                            {formatPrice(item.precio)}{t("catalog.perKg", "/kg")}
                          </span>

                          <span className="price-promo">
                            {formatPrice(unitPrice)}{t("catalog.perKg", "/kg")}
                          </span>
                        </>
                      ) : (
                        <span>{formatPrice(unitPrice)}{t("catalog.perKg", "/kg")}</span>
                      )}
                    </div>

                    <div className="cart-qty-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        aria-label={t("catalog.decreaseQty", "Disminuir cantidad")}
                      >
                        −
                      </button>

                      <span className="qty-val">{item.qty}</span>

                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        aria-label={t("catalog.increaseQty", "Aumentar cantidad")}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cart-item-del"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={t("catalog.removeItem", "Eliminar {{name}}", { name: item.nombre })}
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span>{t("catalog.subtotal", "Subtotal")}</span>

              <span className="cart-footer-price">{formatPrice(total)}</span>
            </div>

            <div className="cart-subtotal-row">
              <span>{t("catalog.shippingEst", "Envío estimado")}</span>

              <span className="cart-footer-price">
                {formatPrice(costoEnvio)}
              </span>
            </div>

            <div className="cart-total-row">
              <span>{t("catalog.total", "TOTAL")}</span>

              <span className="cart-footer-price-total">
                {formatPrice(total + costoEnvio)}
              </span>
            </div>

            <button
              type="button"
              className="btn-checkout"
              onClick={handleCheckout}
            >
              {t("catalog.checkoutBtn", "Proceder al pago →")}
            </button>

            <button
              type="button"
              className="btn-keep-shopping"
              onClick={onClose}
            >
              {t("catalog.keepShopping", "Seguir comprando")}
            </button>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
