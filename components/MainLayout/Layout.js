import React from "react";
import Sidebar from "../Layout/Sidebar";
import AdminSidebar from "../Layout/AdminSidebar";
import { useUser } from "../../dataconnect/context/UserContext";

export default function Layout({ children }) {
  const { user } = useUser();

  return (
    <>
      <style jsx global>{`
        ::selection {
          background: rgba(255, 193, 7, 0.4);
          border-radius: 20px;
        }
        ::-moz-selection {
          background: rgba(255, 193, 7, 0.4);
          border-radius: 20px;
        }

        body {
          background-color: #f8f9fa; /* light gray */
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

      <div className="container-fluid p-0">
        <div className="row g-0 vh-100">
          <div className="col-12 col-md-3 col-lg-2 d-none d-md-block bg-primary text-white position-fixed h-100 overflow-auto">
            {user?.role === "admin" ? <AdminSidebar /> : <Sidebar />}
          </div>

          <div className="col-12 offset-md-3 offset-lg-2 main-content bg-light min-vh-100 p-3">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
