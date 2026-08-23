import { useEffect } from "react";
import Navbar from "@/presentation/shared/components/Navbar";
import { useLocation } from "react-router-dom";

export default function PublicLayout({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="public-shell">
      <Navbar />
      <main className="public-main">{children}</main>
    </div>
  );
}
