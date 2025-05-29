import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "../../dataconnect/context/UserContext";
import Image from "next/image";

export default function AdminSidebar({ onClose }) {
  const router = useRouter();
  const { user } = useUser();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    // Redirect to login page
    router.push("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "bi bi-speedometer2",
    },
    {
      name: "Task Management",
      path: "/admin/usermanagement",
      icon: "bi bi-list-check",
    },
    {
      name: "Meeting Management",
      path: "/admin/meetingmanagement",
      icon: "bi bi-calendar-check",
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: "bi bi-file-earmark-text",
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: "bi bi-gear",
    },
  ];

  return (
    <>
      <style jsx>{`
        .sidebar-close-btn {
          display: none;
          position: absolute;
          top: 16px;
          right: 16px;
          background: #ffc107;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 1.5em;
          color: #1a472a;
          cursor: pointer;
          z-index: 2100;
        }
        @media (max-width: 991px) {
          .sidebar-close-btn {
            display: block;
          }
        }
      `}</style>
      <div
        className="sidebar"
        style={{
          width: "350px",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          backgroundColor: "#1a472a",
          color: "white",
          padding: "20px",
          zIndex: 1000,
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        }}
      >
        <button
          className="sidebar-close-btn"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="text-center mb-4">
          <div className="mb-3">
            <Image
              src="/487083768_557976863971305_3421396436649360911_n.jpg"
              alt="ADECMPC Logo"
              width={100}
              height={100}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                objectFit: "cover",
              }}
            />
          </div>
          <h3 style={{ fontWeight: "bold", color: "#ffc107" }}>ADECMPC</h3>
          <p className="mb-0" style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            Admin Portal
          </p>
        </div>

        <div
          className="user-info mb-4 p-3"
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex align-items-center">
            <div className="me-3">
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-person-circle"
                  style={{ fontSize: "1.8rem" }}
                ></i>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="user-name">
                {user?.fullName || user?.name || "Admin"}
              </div>
              <div className="user-role">Admin Portal</div>
            </div>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: "block",
                padding: "12px 15px",
                color: "white",
                textDecoration: "none",
                marginBottom: "5px",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                backgroundColor:
                  router.pathname === item.path
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
              }}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "2px",
                  background: "white",
                  transform: `scaleX(${
                    hoveredItem === item.path ? 1 : 0
                  })`,
                  transformOrigin: "left",
                  transition: "transform 0.3s ease",
                }}
              />
              <i className={`${item.icon} me-2`}></i>
              {item.name}
            </Link>
          ))}
        </nav>

        <div
          className="mt-auto"
          style={{
            position: "absolute",
            bottom: "20px",
            width: "calc(100% - 40px)",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              borderRadius: "8px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
