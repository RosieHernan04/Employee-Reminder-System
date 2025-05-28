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
          padding: 10px;
          font-size: 1.1em;
        }
        ::-moz-selection {
          background: rgba(255, 193, 7, 0.4);
          border-radius: 20px;
          padding: 10px;
          font-size: 1.1em;
        }
      `}</style>
      <div className="d-flex vh-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {user?.role === "admin" ? <AdminSidebar /> : <Sidebar />}
        <main style={{ marginLeft: "350px", width: "calc(100% - 350px)" }} className="bg-light">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}