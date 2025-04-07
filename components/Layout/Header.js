import { useRouter } from "next/router";
import { useUser } from "../../dataconnect/context/UserContext";

export default function Header() {
  const router = useRouter();
  const { user } = useUser();

  const handleLogout = () => {
    console.log("User logged out");
    localStorage.removeItem("user"); // Clear user data
    router.push("/login"); // Redirect to login
  };

  return (
    <header
      className="d-flex justify-content-between align-items-center mb-4 px-3"
      style={{
        borderBottom: "1px solid #ddd",
        paddingBottom: "10px",
      }}
    >
      {/* User Info & Role */}
      <div className="d-flex align-items-center">
        <i className="bi bi-person-circle text-success fs-3 me-2"></i>
        <div>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "bold",
              color: "#4CAF50",
            }}
          >
            {user?.name || "Guest"}
          </span>
          <br />
          <small className="text-muted">
            {user?.role === "admin" ? "Admin Dashboard" : "Employee Dashboard"}
          </small>
        </div>
      </div>

      {/* Logout Button */}
      <button
        className="btn btn-outline-danger"
        onClick={handleLogout}
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "bold",
        }}
      >
        Log Out
      </button>
    </header>
  );
}
