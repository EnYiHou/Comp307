import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import "./PublicShell.css";

export default function PublicShell() {
  return (
    <div className="public-shell">
      <Header />
      <main className="public-shell_content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
