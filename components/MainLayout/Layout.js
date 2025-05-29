// components/MainLayout/Layout.js

import React, { useState } from "react";
import Sidebar from "../Layout/Sidebar";
import AdminSidebar from "../Layout/AdminSidebar";
import { useUser } from "../../dataconnect/context/UserContext";

export default function Layout({ children }) {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const SidebarComponent = user?.role === "admin" ? AdminSidebar : Sidebar;

  return (
    <>
      <style jsx global>{`
        ::selection {
          background: rgba(255, 193, 7, 0.4);
          border-radius: 20px;
          padding: 10px;
          font-size: 1.1em;
        }
        ::-moz-selection {
          background: rgba(255, 193, 7, 0.4);
          border-radius: 20px;
          padding: 10px;
          font-size: 1.1em;
        }

        /* Mobile sidebar animation */
        @media (max-width: 768px) {
          .sidebar-offcanvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 250px;
            height: 100vh;
            z-index: 1050;
            background-color: #1a472a;
            transition: transform 0.3s ease;
            transform: translateX(-100%);
          }

          .sidebar-offcanvas.open {
            transform: translateX(0);
          }
        }
      `}</style>

      <div className="container-fluid">
        <div className="row min-vh-100">

          {/* Sidebar for Desktop */}
          <div className="d-none d-md-block col-md-3 col-lg-2 p-0">
            {SidebarComponent && <SidebarComponent />}
          </div>

          {/* Header & Toggle for Mobile */}
          <div className="d-md-none bg-success text-white p-2 d-flex justify-content-between align-items-center sticky-top">
            <span className="fw-bold">ADECMPC</span>
            <button
              className="btn btn-light"
              onClick={toggleSidebar}
            >
              ☰
            </button>
          </div>

          {/* Sidebar for Mobile (Offcanvas style) */}
          <div className="d-md-none">
            <div className={`sidebar-offcanvas ${sidebarOpen ? "open" : ""}`}>
              {SidebarComponent && <SidebarComponent />}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-12 col-md-9 col-lg-10 bg-light p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
