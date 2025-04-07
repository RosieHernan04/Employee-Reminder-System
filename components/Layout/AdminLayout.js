import AdminSidebar from './AdminSidebar';
import Header from './Header';

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ 
        flex: 1,
        marginLeft: "350px", // Match sidebar width
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}>
        <div style={{
          padding: "1rem 2rem",
          backgroundColor: "white",
        }}>
          <Header />
        </div>
        <main style={{
          padding: "2rem",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}