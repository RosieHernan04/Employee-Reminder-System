import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminSidebar() {
  const router = useRouter();
  const isActive = (path) => router.pathname === path;

  return (
    <aside
      style={{
        width: "350px",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(to bottom, #1a472a, #2d8659)",
        minHeight: "100vh",
        padding: "1.5rem",
        color: "white",
        position: "fixed",
        left: 0,
        top: 0,
        overflowY: "auto",
      }}
    >
      <div className="mb-4 text-center">
        <img
          src="/487083768_557976863971305_3421396436649360911_n.jpg"
          alt="ADECMPC Logo"
          style={{ width: "150px", marginBottom: "10px", borderRadius: "50%" }}
        />
        <h2 className="text-warning" style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
          ADECMPC
        </h2>
      </div>

      <nav>
        <ul className="list-unstyled">
          <li className="mb-3">
            <Link
              href="/admin/dashboard"
              className={`d-flex align-items-center p-3 rounded text-decoration-none ${
                isActive("/admin/dashboard") ? "bg-success" : ""
              }`}
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: isActive("/admin/dashboard") ? "rgba(40, 167, 69, 0.8)" : "rgba(0, 0, 0, 0.2)",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <i className="bi bi-house me-2"></i> Dashboard
            </Link>
          </li>
          <li className="mb-3">
            <Link
              href="/admin/usermanagement"
              className={`d-flex align-items-center p-3 rounded text-decoration-none ${
                isActive("/admin/usermanagement") ? "bg-success" : ""
              }`}
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: isActive("/admin/usermanagement") ? "rgba(40, 167, 69, 0.8)" : "rgba(0, 0, 0, 0.2)",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <i className="bi bi-people me-2"></i> Users Management
            </Link>
          </li>
          <li className="mb-3">
            <Link
              href="/admin/reports"
              className={`d-flex align-items-center p-3 rounded text-decoration-none ${
                isActive("/admin/reports") ? "bg-success" : ""
              }`}
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: isActive("/admin/reports") ? "rgba(40, 167, 69, 0.8)" : "rgba(0, 0, 0, 0.2)",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <i className="bi bi-graph-up me-2"></i> Reports
            </Link>
          </li>
          <li className="mb-3">
            <Link
              href="/admin/settings"
              className={`d-flex align-items-center p-3 rounded text-decoration-none ${
                isActive("/admin/settings") ? "bg-success" : ""
              }`}
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: isActive("/admin/settings") ? "rgba(40, 167, 69, 0.8)" : "rgba(0, 0, 0, 0.2)",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <i className="bi bi-gear me-2"></i> Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
