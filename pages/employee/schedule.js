import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase"; // Correct import for firebase
import Layout from "../../components/Layout/layout";


export default function Schedule() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("monthly");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <Layout>
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          My Schedule
        </h1>
      </header>

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
        {/* Calendar Section */}
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
            Calendar View
          </h2>
          <div className="calendar">
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                color: "#4CAF50",
                textAlign: "center",
              }}
            >
              Displaying {view} view of the calendar...
            </p>
          </div>
        </section>

        {/* Upcoming Tasks Section */}
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
            Upcoming Tasks
          </h2>
          <ul className="list-group">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <li
                  key={task.id}
                  className="list-group-item"
                  style={{
                    border: "none",
                    padding: "10px 0",
                    borderBottom: "1px solid #ddd",
                    fontFamily: "'Poppins', sans-serif",
                    color: "#555",
                  }}
                >
                  <strong>{task.title}</strong>
                  <br />
                  <small>
                    {task.date} at {task.time} - {task.priority} Priority
                  </small>
                </li>
              ))
            ) : (
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "#888",
                  textAlign: "center",
                }}
              >
                No upcoming tasks
              </p>
            )}
          </ul>
        </section>

        {/* Add Task Section */}
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
            Add Task
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newTask = {
                id: Date.now(),
                title: e.target.title.value,
                date: e.target.date.value,
                time: e.target.time.value,
                priority: e.target.priority.value,
              };
              addTask(newTask);
              e.target.reset();
            }}
          >
            <div className="mb-3">
              <label
                htmlFor="title"
                className="form-label"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "bold",
                  color: "#4CAF50",
                }}
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                required
                style={{
                  border: "1px solid #4CAF50",
                  borderRadius: "5px",
                  padding: "10px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="date"
                className="form-label"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "bold",
                  color: "#4CAF50",
                }}
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                required
                style={{
                  border: "1px solid #4CAF50",
                  borderRadius: "5px",
                  padding: "10px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="time"
                className="form-label"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "bold",
                  color: "#4CAF50",
                }}
              >
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                className="form-control"
                required
                style={{
                  border: "1px solid #4CAF50",
                  borderRadius: "5px",
                  padding: "10px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="priority"
                className="form-label"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "bold",
                  color: "#4CAF50",
                }}
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                style={{
                  border: "1px solid #4CAF50",
                  borderRadius: "5px",
                  padding: "10px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn"
              style={{
                backgroundColor: "#4CAF50",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "5px",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Add Task
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
}
