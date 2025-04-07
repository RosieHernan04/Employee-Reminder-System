import Link from 'next/link'; // Import Link from Next.js

export default function Home() {
  return (
    <div>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-light"
        style={{
          backgroundColor: "#FFEB3B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        {/* Left Section: Logo and Buttons */}
        <div className="d-flex align-items-center">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img
              src="/487083768_557976863971305_3421396436649360911_n.jpg"
              alt="ADECMPC Logo"
              style={{ height: "50px", marginRight: "10px" }}
            />
            <span className="text-success fw-bold">ADECMPC</span>
          </a>
          <div className="ms-3">
            <Link href="/login">
              <button
                className="btn"
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  marginRight: "10px",
                  fontWeight: "bold",
                  padding: "5px 15px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
                }}
              >
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <button
                className="btn"
                style={{
                  backgroundColor: "#FF9800",
                  color: "white",
                  fontWeight: "bold",
                  padding: "5px 15px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
                }}
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>

        {/* Center Section: Navigation Links */}
        <div>
          <ul className="navbar-nav d-flex flex-row justify-content-center">
            <li className="nav-item mx-2">
              <a className="nav-link text-success fw-bold" href="#">
                Home
              </a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link text-success fw-bold" href="#">
                About
              </a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link text-success fw-bold" href="#">
                Contact
              </a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link text-success fw-bold" href="#">
                FAQs
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="text-center text-white d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: "url('/482008061_1237868935006656_7744321024729750789_n.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "50vh",
          position: "relative",
        }}
      >
        {/* Background Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black overlay
            zIndex: 1,
          }}
        ></div>
        <div style={{ zIndex: 2 }}>
          <h1
            className="fw-bold"
            style={{
              textShadow: "2px 2px 6px rgba(0, 0, 0, 0.9)", // Stronger shadow for visibility
              fontSize: "2.5rem",
            }}
          >
            Your Trusted Cooperative Partnership
          </h1>
          <p
            className="lead"
            style={{
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.8)", // Subtle shadow for subtitle
              fontSize: "1.2rem",
            }}
          >
            Together we help those in need
          </p>
        </div>
      </div>

      {/* Vision and Mission Section */}
      <div
        className="container d-flex flex-column align-items-center justify-content-center"
        style={{
          marginTop: "-100px", // Slight overlap with the background
          position: "relative", // Ensure Vision and Mission are positioned relative to the container
          zIndex: 3, // Bring Vision and Mission in front of the shadow
        }}
      >
        <div className="row w-100">
          {/* Vision */}
          <div className="col-md-6 d-flex justify-content-end pe-2">
            <div
              className="card shadow-lg d-flex flex-column"
              style={{
                backgroundColor: "#4CAF50", // Filled green background
                borderRadius: "15px",
                padding: "0", // Remove padding to align content properly
                textAlign: "center",
                width: "100%",
                maxWidth: "400px", // Minimized container size
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                overflow: "hidden", // Ensures the image fills the container
              }}
            >
              {/* Text Section */}
              <div
                style={{
                  flex: "1", // Take up half of the container
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center", // Center the text vertically
                  padding: "20px",
                }}
              >
                <h5
                  className="fw-bold"
                  style={{
                    fontSize: "1.8rem",
                    color: "#FFFFFF", // White text for Vision title
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Vision
                </h5>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "#FFFFFF", // White text for Vision description
                    lineHeight: "1.8",
                    margin: "0", // Remove extra margin
                  }}
                >
                  To be a multi-billionaire cooperative.
                </p>
              </div>
              {/* Image Section */}
              <div
                style={{
                  flex: "1", // Take up half of the container
                  height: "200px", // Fixed height for consistency
                }}
              >
                <img
                  src="/billion-sign-or-stamp-on-white-background-vector-illustration-T7GC7B.jpg"
                  alt="Vision"
                  className="img-fluid"
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover", // Ensure the image covers the entire space
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="col-md-6 d-flex justify-content-start ps-2">
            <div
              className="card shadow-lg d-flex flex-column"
              style={{
                backgroundColor: "#FF9800", // Filled orange background
                borderRadius: "15px",
                padding: "0", // Remove padding to align content properly
                textAlign: "center",
                width: "100%",
                maxWidth: "400px", // Minimized container size
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                overflow: "hidden", // Ensures the image fills the container
              }}
            >
              {/* Text Section */}
              <div
                style={{
                  flex: "1", // Take up half of the container
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center", // Center the text vertically
                  padding: "20px",
                }}
              >
                <h5
                  className="fw-bold"
                  style={{
                    fontSize: "1.8rem",
                    color: "#FFFFFF", // White text for Mission title
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Mission
                </h5>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "#FFFFFF", // White text for Mission description
                    lineHeight: "1.8",
                    margin: "0", // Remove extra margin
                  }}
                >
                  We are committed to providing high-quality services and sustainable solutions that uplift the lives of
                  our members, strengthen financial resources, and create meaningful impacts in the community.
                </p>
              </div>
              {/* Image Section */}
              <div
                style={{
                  flex: "1", // Take up half of the container
                  height: "200px", // Fixed height for consistency
                }}
              >
                <img
                  src="/helping-hand-icon-design-free-vector.jpg"
                  alt="Mission"
                  className="img-fluid"
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover", // Ensure the image covers the entire space
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}