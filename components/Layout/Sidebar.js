import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "../../dataconnect/context/UserContext";
import Image from "next/image";

export default function Sidebar() {
  const router = useRouter();
  const { user } = useUser();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/employee/dashboard",
      icon: "bi bi-speedometer2",
    },
    {
      name: "My Tasks",
      path: "/employee/my-tasks",
      icon: "bi bi-list-task",
    },
    {
      name: "Meetings",
      path: "/employee/meetings",
      icon: "bi bi-calendar-check",
    },
    {
      name: "Profile Settings",
      path: "/employee/settings",
      icon: "bi bi-person-circle",
    },
  ];

  return (
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo and Header */}
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
          Employee Portal
        </p>
      </div>

      {/* User Info */}
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
              <i className="bi bi-person-circle" style={{ fontSize: "1.8rem" }}></i>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h6
              className="mb-0"
              style={{
                fontWeight: "600",
                fontSize: "1.1rem",
                color: "#ffc107",
                lineHeight: "1.2",
              }}
            >
              {user?.fullName || "Employee"}
            </h6>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flexGrow: 1 }}>
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
                router.pathname === item.path ? "rgba(255,255,255,0.1)" : "transparent",
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
                transform: `scaleX(${hoveredItem === item.path ? 1 : 0})`,
                transformOrigin: "left",
                transition: "transform 0.3s ease",
              }}
            />
            <i className={`${item.icon} me-2`}></i>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div style={{ marginTop: "auto" }}>
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
  );
}
