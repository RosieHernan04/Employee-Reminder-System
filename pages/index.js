import Link from 'next/link';
import Image from 'next/image';


export default function Home() {
  return (
    <div>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-light"
        style={{
          background: 'rgba(255, 235, 59, 0.25)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        {/* Left Section: Logo and Buttons */}
        <div className="d-flex align-items-center">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <div style={{
              height: "50px",
              width: "50px",
              marginRight: "10px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent"
            }}>
              <Image
                src="/ADECMPCLOGO.png"
                alt="ADECMPC Logo"
                width={100}
                height={100}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover"
                }}
              />
            </div>
            <span className="text-success fw-bold">ADECMPC</span>
          </a>
          <div className="ms-3">
            <Link href="/login">
              <button
                className="btn"
                style={{
                  background: 'rgba(76, 175, 80, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: "#1a472a",
                  marginRight: "10px",
                  fontWeight: "bold",
                  padding: "5px 15px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <button
                className="btn"
                style={{
                  background: 'rgba(255, 152, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: "#e65100",
                  fontWeight: "bold",
                  padding: "5px 15px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
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
              <Link href="/" className="nav-link text-success fw-bold" style={{ borderBottom: '2px solid #4CAF50' }}>
                Home
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link href="/about" className="nav-link text-success fw-bold">
                About
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link href="/contact" className="nav-link text-success fw-bold">
                Contact
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link href="/faqs" className="nav-link text-success fw-bold">
                FAQs
              </Link>
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
            background: 'linear-gradient(135deg, rgba(45, 134, 89, 0.7) 0%, rgba(255, 140, 66, 0.7) 50%, rgba(141, 110, 99, 0.7) 100%)',
            backdropFilter: 'blur(3px)',
            zIndex: 1,
          }}
        ></div>
        <div style={{ zIndex: 2 }}>
          <h1
            className="fw-bold"
            style={{
              textShadow: "2px 2px 6px rgba(0, 0, 0, 0.9)",
              fontSize: "2.5rem",
            }}
          >
            Your Trusted Cooperative Partnership
          </h1>
          <p
            className="lead"
            style={{
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.8)",
              fontSize: "1.2rem",
            }}
          >
            Where Unity Creates Change
          </p>
        </div>
      </div>

      {/* Vision and Mission Section */}
      <div
        className="container d-flex flex-column align-items-center justify-content-center"
        style={{
          marginTop: "-100px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div className="row w-100">
          {/* Vision */}
          <div className="col-md-6 d-flex justify-content-end pe-2">
            <div
              className="card shadow-lg d-flex flex-column"
              style={{
                background: 'rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(20px)',
                borderRadius: "15px",
                padding: "0",
                textAlign: "center",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.2)",
                overflow: "hidden",
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Text Section */}
              <div
                style={{
                  flex: "1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "20px",
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95))',
                }}
              >
                <h5
                  className="fw-bold"
                  style={{
                    fontSize: "1.8rem",
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Vision
                </h5>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "#FFFFFF",
                    lineHeight: "1.8",
                    margin: "0",
                  }}
                >
                  To be a multi-billionaire cooperative.
                </p>
              </div>
              {/* Image Section */}
              <div
                style={{
                  flex: "1",
                  height: "150px",
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Image
                  src="/pngtree-money-bag-with-plant-growing-from-coins-png-image_14332250.png"
                  alt="Vision"
                  width={200}
                  height={200} // Adjust as needed
                  style={{
                    objectFit: "contain",
                    padding: "15px",
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
                background: 'rgba(255, 152, 0, 0.2)',
                backdropFilter: 'blur(20px)',
                borderRadius: "15px",
                padding: "0",
                textAlign: "center",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.2)",
                overflow: "hidden",
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Text Section */}
              <div
                style={{
                  flex: "1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "20px",
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.95), rgba(245, 124, 0, 0.95))',
                }}
              >
                <h5
                  className="fw-bold"
                  style={{
                    fontSize: "1.8rem",
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Mission
                </h5>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "#FFFFFF",
                    lineHeight: "1.8",
                    margin: "0",
                  }}
                >
                  We are committed to providing high-quality services and sustainable solutions that uplift the lives of
                  our members, strengthen financial resources, and create meaningful impacts in the community.
                </p>
              </div>
              {/* Mission Image Section */}
              <div
                style={{
                  flex: "1",
                  height: "150px",
                  background: 'transparent',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Image
                  src="/Picture2.png"
                  alt="Mission"
                  width={300} // Set based on your design
                  height={300}
                  style={{
                    objectFit: "contain",
                    padding: "15px",
                    mixBlendMode: "multiply",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .navbar-nav .nav-link {
          transition: color 0.3s ease;
        }
        
        .navbar-nav .nav-link:hover {
          color: #1a472a !important;
        }
        
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          background: rgba(255, 255, 255, 0.2) !important;
        }

        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0px 12px 40px rgba(0, 0, 0, 0.3) !important;
        }
      `}</style>
    </div>
  );
}