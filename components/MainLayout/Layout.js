import React, { useState } from "react";
import Sidebar from "../Layout/Sidebar";
import AdminSidebar from "../Layout/AdminSidebar";
import { useUser } from "../../dataconnect/context/UserContext";

export default function Layout({ children }) {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine which sidebar to use
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
        /* Responsive layout styles */
        .main-layout {
          display: flex;
          height: 100vh;
          font-family: 'Poppins', sans-serif;
        }
        .sidebar-container {
          width: 350px;
          transition: transform 0.3s ease;
        }
        .main-content {
          margin-left: 350px;
          width: calc(100% - 350px);
          background: #f8f9fa;
          min-height: 100vh;
          transition: margin-left 0.3s ease, width 0.3s ease;
        }
        .sidebar-toggle {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 1100;
          background: #ffc107;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 1.5em;
          cursor: pointer;
        }
        @media (max-width: 991px) {
          .main-layout {
            flex-direction: column;
          }
          .sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 1050;
            background: #fff;
            box-shadow: 2px 0 8px rgba(0,0,0,0.08);
            transform: translateX(-100%);
          }
          .sidebar-container.open {
            transform: translateX(0);
          }
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          .sidebar-toggle {
            display: block;
          }
        }
      `}</style>
      <button
        className="sidebar-toggle"
        aria-label="Toggle sidebar"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        &#9776;
      </button>
      <div className="main-layout">
        <div className={`sidebar-container${sidebarOpen ? " open" : ""}`}>
          <SidebarComponent />
        </div>
        <main
          className="main-content"
          onClick={() => {
            // Close sidebar when clicking main content on mobile
            if (sidebarOpen) setSidebarOpen(false);
          }}
        >
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}