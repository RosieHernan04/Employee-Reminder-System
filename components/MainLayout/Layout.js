import React, { useState } from "react";
import Sidebar from "../Layout/Sidebar";
import AdminSidebar from "../Layout/AdminSidebar";
import { useUser } from "../../dataconnect/context/UserContext";

export default function Layout({ children }) {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

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
        .main-layout {
          display: flex;
          min-height: 100vh;
          font-family: 'Poppins', sans-serif;
        }
        .sidebar {
          width: 350px;
          min-width: 250px;
          transition: transform 0.3s ease;
        }
        .main-content {
          flex: 1;
          background: #f8f9fa;
          padding: 2rem;
          transition: margin-left 0.3s ease;
        }
        @media (max-width: 991px) {
          .sidebar {
            position: fixed;
            z-index: 1000;
            height: 100vh;
            left: 0;
            top: 0;
            background: #fff;
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 1rem;
          }
          .sidebar-toggle {
            display: block;
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 1100;
            background: #ffc107;
            border: none;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            font-size: 1.2em;
            cursor: pointer;
          }
        }
        @media (min-width: 992px) {
          .sidebar-toggle {
            display: none;
          }
        }
      `}</style>
      <button className="sidebar-toggle" onClick={handleSidebarToggle}>
        ☰
      </button>
      <div className="main-layout">
        <div className={`sidebar${sidebarOpen ? " open" : ""}`}>
          {user?.role === "admin" ? <AdminSidebar /> : <Sidebar />}
        </div>
        <main
          className="main-content"
          style={{
            marginLeft: "350px",
            width: "calc(100% - 350px)",
          }}
          onClick={() => sidebarOpen && setSidebarOpen(false)}
        >
          <div>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}