import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar() {
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
              href="/dashboard"
              className={`d-flex align-items-center p-3 rounded text-decoration-none ${
                isActive("/dashboard") ? "bg-success" : ""
              }`}
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: isActive("/dashboard") ? "rgba(40, 167, 69, 0.8)" : "rgba(0, 0, 0, 0.2)",
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
              href="/tasks"
              className={`d-flex align-items-center p-3 rounded text-decoration-none ${
                isActive("/tasks") ? "bg-success" : ""
              }`}
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: isActive("/tasks") ? "rgba(40, 167, 69, 0.8)" : "rgba(0, 0, 0, 0.2)",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <i className="bi bi-list-check me-2"></i> My Tasks
            </Link>
          </li>
          <li className="mb-3">
            <Link
              href="/meetings"
              className={`d-flex align-items-center p-3 rounded text-decoration-none ${
                isActive("/meetings") ? "bg-success" : ""
              }`}
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: isActive("/meetings") ? "rgba(40, 167, 69, 0.8)" : "rgba(0, 0, 0, 0.2)",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <i className="bi bi-calendar-event me-2"></i> Meetings
            </Link>
          </li>
          <li className="mb-3">
            <Link
              href="/documents"
              className={`d-flex align-items-center p-3 rounded text-decoration-none ${
                isActive("/documents") ? "bg-success" : ""
              }`}
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: isActive("/documents") ? "rgba(40, 167, 69, 0.8)" : "rgba(0, 0, 0, 0.2)",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <i className="bi bi-file-earmark-text me-2"></i> Documents
            </Link>
          </li>
          <li className="mb-3">
            <Link
              href="/profile"
              className={`d-flex align-items-center p-3 rounded text-decoration-none ${
                isActive("/profile") ? "bg-success" : ""
              }`}
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: isActive("/profile") ? "rgba(40, 167, 69, 0.8)" : "rgba(0, 0, 0, 0.2)",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <i className="bi bi-person me-2"></i> My Profile
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
