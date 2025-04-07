import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="d-flex vh-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Sidebar />
      <main style={{ marginLeft: "350px", width: "calc(100% - 350px)" }} className="bg-light">
        <div className="p-4">
          <Header />
          {children}
        </div>
      </main>
    </div>
  );
}