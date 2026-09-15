import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useTheme } from "@/app/contexts/ThemeContext.js";
import { useNavigate } from "react-router-dom";

export default function ModoOscuro() {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <SpecialSystemShell activeKey="modo-oscuro">
      <div className="special-heading">
        <div>
          <h1>Modo oscuro</h1>
          <p>Configura la apariencia de la experiencia de AgroMarket.</p>
        </div>

        <button
          type="button"
          className="special-primary-action"
          onClick={toggleTheme}
          aria-pressed={darkMode}
        >
          {darkMode ? "Usar modo claro" : "Usar modo oscuro"}
        </button>
      </div>

      <section className={`dark-demo${darkMode ? " darkMode" : ""}`}>
        <div className="dark-demo-top">
          <strong>AgroMarket</strong>
          <span>{t("catalog.searchPlaceholder", "Buscar productos…")}</span>
          <b>ES</b>
          <b>COP</b>
          <b>Urabá, Colombia</b>
          <b>Notificaciones</b>
          <b>Carrito · 3</b>
        </div>

        <div className="dark-demo-body">
          <aside>
            <strong>AgroMarket</strong>
            {[
              "Inicio",
              "Mi cuenta",
              "Pedidos",
              "Mensajes",
              "Notificaciones",
              "Direcciones",
              "Pagos guardados",
              "Configuración",
              "Cerrar sesión",
            ].map((item, index) => (
              <div className={index === 1 ? "active" : ""} key={item}>
                {item}
              </div>
            ))}
          </aside>

          <main>
            <div className="dark-profile">
              <div className="dark-avatar">JP</div>
              <div>
                <h2>Juan Pérez</h2>
                <p>juanperez@email.com</p>
                <p>+57 300 123 4567</p>
                <small>Miembro desde Abril 2024</small>
              </div>
              <button type="button" onClick={()=>navigate("/perfil")}>Editar perfil</button>
            </div>

            <div className="dark-metrics">
              <article>
                <span>Pedidos</span>
                <b>24</b>
                <small>Ver pedidos</small>
              </article>
              <article>
                <span>En camino</span>
                <b>2</b>
                <small>Ver envíos</small>
              </article>
              <article>
                <span>Favoritos</span>
                <b>12</b>
                <small>Ver lista</small>
              </article>
            </div>

            <h3>Últimos pedidos</h3>

            <div className="dark-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#AM-000123</td>
                    <td>24 May 2024</td>
                    <td>$29.700 COP</td>
                    <td>En camino</td>
                    <td>Ver</td>
                  </tr>
                  <tr>
                    <td>#AM-000122</td>
                    <td>22 May 2024</td>
                    <td>$42.000 COP</td>
                    <td>Entregado</td>
                    <td>Ver</td>
                  </tr>
                  <tr>
                    <td>#AM-000120</td>
                    <td>18 May 2024</td>
                    <td>$18.000 COP</td>
                    <td>Cancelado</td>
                    <td>Ver</td>
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
