import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout/layout";
import { useUser } from "../../dataconnect/context/UserContext";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();

  // Redirect if the user is not an employee
  useEffect(() => {
    if (!user || user.role !== "employee") {
      router.push("/login");
    }
  }, [user]);

  if (!user || user.role !== "employee") {
    return null; // Prevent rendering until redirect
  }

  return (
    <Layout>
      <div>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "1.5rem",
          }}
        >
          Dashboard
        </h1>

        {/* Main Content */}
        <div
          className="d-flex flex-wrap justify-content-between"
          style={{
            gap: "20px",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Upcoming Meetings Section */}
          <section
            style={{
              flex: "1 1 300px",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "20px",
              }}
            >
              Upcoming Meetings
            </h2>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                color: "#4CAF50",
                textAlign: "center",
                fontSize: "2rem",
              }}
            >
              2
            </p>
          </section>

          {/* Tasks for Today Section */}
          <section
            style={{
              flex: "1 1 300px",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "20px",
              }}
            >
              Tasks for Today
            </h2>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                color: "#4CAF50",
                textAlign: "center",
                fontSize: "2rem",
              }}
            >
              5
            </p>
          </section>

          {/* Recent Meeting Notifications Section */}
          <section
            style={{
              flex: "1 1 300px",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "20px",
              }}
            >
              Recent Meeting Notifications
            </h2>
            <ul className="list-group">
              <li
                className="list-group-item"
                style={{
                  border: "none",
                  padding: "10px 0",
                  borderBottom: "1px solid #ddd",
                  fontFamily: "'Poppins', sans-serif",
                  color: "#555",
                }}
              >
                April 24, 2024 - Project Kickoff
              </li>
              <li
                className="list-group-item"
                style={{
                  border: "none",
                  padding: "10px 0",
                  borderBottom: "1px solid #ddd",
                  fontFamily: "'Poppins', sans-serif",
                  color: "#555",
                }}
              >
                April 25, 2024 - Client Presentation
              </li>
              <li
                className="list-group-item"
                style={{
                  border: "none",
                  padding: "10px 0",
                  borderBottom: "1px solid #ddd",
                  fontFamily: "'Poppins', sans-serif",
                  color: "#555",
                }}
              >
                April 26, 2024 - Team Sync
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}