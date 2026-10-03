import { useTranslation } from "react-i18next";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useTheme } from "@/app/contexts/ThemeContext.js";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import Icon from "@/presentation/shared/components/Icon";
import { useNavigate } from "react-router-dom";

/**
 * Vista previa del tema oscuro.
 *
 * El panel "dark-demo" es una MAQUETA VISUAL de componentes (tarjeta, tabla,
 * botones) para comparar ambos temas. NO simula cifras de negocio: los datos
 * de identidad son los reales de la sesión y los contadores salen del carrito.
 */
export default function ModoOscuro() {
  const { t } = useTranslation();
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { carrito } = useCart();
  const navigate = useNavigate();

  const nombreCompleto =
    [user?.nombre, user?.apellido].filter(Boolean).join(" ").trim() ||
    t("perfil.usuarioInvitado", "Invitado");

  const iniciales =
    `${user?.nombre?.charAt(0) || "A"}${user?.apellido?.charAt(0) || ""}`.toUpperCase();

  const itemsCarrito = Array.isArray(carrito)
    ? carrito.reduce((total, item) => total + (item?.cantidad || 0), 0)
    : 0;

  const irA = (ruta) => () => navigate(ruta);
  const tecla = (ruta) => (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(ruta);
    }
  };

  return (
    <SpecialSystemShell activeKey="modo-oscuro">
      <div className="special-heading">
        <div>
          <h1>{t("special.darkMode", "Modo oscuro")}</h1>
          <p>
            {t(
              "special.darkModeSub",
              "Configura la apariencia de la experiencia de AgroMarket.",
            )}
          </p>
        </div>

        <button
          type="button"
          className="special-primary-action"
          onClick={toggleTheme}
          aria-pressed={darkMode}
        >
          <Icon name={darkMode ? "sun" : "moon"} size={16} />
          {darkMode
            ? t("special.useLightMode", "Usar modo claro")
            : t("special.useDarkMode", "Usar modo oscuro")}
        </button>
      </div>

      <section className={`dark-demo${darkMode ? " darkMode" : ""}`}>
        <div className="dark-demo-top">
          <strong>AgroMarket</strong>
          <span>{t("catalog.searchPlaceholder", "Buscar productos…")}</span>
          <b>ES</b>
          <b>COP</b>
          <b>Urabá, Colombia</b>
          <b>
            <Icon name="bell" size={14} />
            {t("nav.notifications", "Notificaciones")}
          </b>
          <b>
            <Icon name="cart" size={14} />
            {t("nav.cart", "Carrito")} · {itemsCarrito}
          </b>
        </div>

        <div className="dark-demo-body">
          <aside>
            <strong>AgroMarket</strong>
            {[
              { label: t("nav.home", "Inicio"), icon: "home", to: "/home" },
              { label: t("nav.myAccount", "Mi cuenta"), icon: "user", to: "/perfil" },
              { label: t("nav.orders", "Pedidos"), icon: "package", to: "/pedidos" },
              { label: t("nav.messages", "Mensajes"), icon: "message", to: "/mensajeria" },
              {
                label: t("nav.notifications", "Notificaciones"),
                icon: "bell",
                to: "/especial/notificaciones",
              },
              {
                label: t("special.addresses", "Direcciones"),
                icon: "mapPin",
                to: "/especial/direcciones",
              },
              {
                label: t("special.savedPayments", "Pagos guardados"),
                icon: "card",
                to: "/especial/pagos-guardados",
              },
              { label: t("special.wishlist", "Lista de deseos"), icon: "heart", to: "/especial/deseos" },
              {
                label: t("special.settings", "Configuración"),
                icon: "settings",
                to: "/perfil",
              },
            ].map((item, index) => (
              <div
                className={index === 1 ? "active" : ""}
                key={item.label}
                role="button"
                tabIndex={0}
                onClick={irA(item.to)}
                onKeyDown={tecla(item.to)}
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </div>
            ))}
            <div role="button" tabIndex={0} onClick={irA("/home")} onKeyDown={tecla("/home")}>
              <Icon name="logout" size={15} />
              {t("nav.logout", "Cerrar sesión")}
            </div>
          </aside>

          <main>
            <div className="dark-profile">
              <div className="dark-avatar">{iniciales}</div>
              <div>
                <h2>{nombreCompleto}</h2>
                <p>
                  {user?.correo ||
                    user?.email ||
                    t("perfil.sinCorreo", "Sin correo registrado")}
                </p>
                {user?.telefono && <p>{user.telefono}</p>}
                <small>
                  {t(
                    "special.previewNotice",
                    "Vista previa del tema · no son cifras de negocio",
                  )}
                </small>
              </div>
              <button type="button" onClick={irA("/perfil")}>
                <Icon name="edit" size={14} />
                {t("perfil.editProfile", "Editar perfil")}
              </button>
            </div>

            <div className="dark-metrics">
              <article>
                <span>{t("nav.orders", "Pedidos")}</span>
                <b>—</b>
                <small role="button" tabIndex={0} onClick={irA("/pedidos")} onKeyDown={tecla("/pedidos")}>
                  {t("special.viewOrders", "Ver pedidos")}
                </small>
              </article>
              <article>
                <span>{t("special.onTheWay", "En camino")}</span>
                <b>—</b>
                <small role="button" tabIndex={0} onClick={irA("/envios")} onKeyDown={tecla("/envios")}>
                  {t("special.viewShipments", "Ver envíos")}
                </small>
              </article>
              <article>
                <span>{t("special.wishlist", "Lista de deseos")}</span>
                <b>—</b>
                <small role="button" tabIndex={0} onClick={irA("/especial/deseos")} onKeyDown={tecla("/especial/deseos")}>
                  {t("special.viewList", "Ver lista")}
                </small>
              </article>
            </div>

            <h3>{t("special.previewComponents", "Elementos del tema")}</h3>

            <div className="dark-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t("special.previewElement", "Elemento")}</th>
                    <th>{t("special.previewType", "Tipo")}</th>
                    <th>{t("special.previewState", "Estado")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t("special.previewCard", "Tarjeta de producto")}</td>
                    <td>{t("special.previewSurface", "Superficie")}</td>
                    <td>
                      <span className="special-badge safe">
                        <Icon name="check" size={14} />
                        {t("special.previewOk", "Correcto")}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("special.previewTable", "Tabla de datos")}</td>
                    <td>{t("special.previewSurface", "Superficie")}</td>
                    <td>
                      <span className="special-badge">
                        <Icon name="info" size={14} />
                        {t("special.previewInfo", "Informativo")}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("special.previewAlert", "Mensaje de error")}</td>
                    <td>{t("special.previewSurface", "Superficie")}</td>
                    <td>
                      <span className="special-badge warning">
                        <Icon name="alert" size={14} />
                        {t("special.previewDanger", "Atención")}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </section>
    </SpecialSystemShell>
  );
}
