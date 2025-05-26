import Link from 'next/link';

export default function Contact() {
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
        {/* Left Section: Logo and Brand */}
        <div className="d-flex align-items-center">
          <Link href="/" className="navbar-brand d-flex align-items-center">
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
              <img
                src="/487083768_557976863971305_3421396436649360911_n.jpg"
                alt="ADECMPC Logo"
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover"
                }}
              />
            </div>
            <span className="text-success fw-bold">ADECMPC</span>
          </Link>
        </div>

        {/* Center Section: Navigation Links */}
        <div>
          <ul className="navbar-nav d-flex flex-row justify-content-center">
            <li className="nav-item mx-2">
              <Link href="/" className="nav-link text-success fw-bold">
                Home
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link href="/about" className="nav-link text-success fw-bold">
                About
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link href="/contact" className="nav-link text-success fw-bold" style={{ borderBottom: '2px solid #4CAF50' }}>
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

        {/* Right Section: Auth Buttons */}
        <div>
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
        </div>
      </nav>

      {/* Main Content */}
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(33, 150, 243, 0.1) 50%, rgba(76, 175, 80, 0.1) 100%)',
          padding: '80px 20px',
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div
                style={{
                  background: 'rgba(255, 152, 0, 0.2)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <h1 className="text-success mb-4">Contact Us</h1>
                <div className="row">
                  <div className="col-12">
                    <div className="contact-info">
                      <div className="mb-4">
                        <h4 className="text-success">Address</h4>
                        <p className="fs-5">Blk L5B Governor's Hills Biclatan General Trias City, Cavite</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-success">Email</h4>
                        <p className="fs-5">ademc1986@yahoo.com</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-success">Phone</h4>
                        <p className="fs-5">046-886-4446</p>
                      </div>
                      <div>
                        <h4 className="text-success">Office Hours</h4>
                        <p className="fs-5">
                          Monday - Friday: 8:00 AM - 5:00 PM<br />
                          Saturday: Closed<br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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

        .form-control {
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          padding: 10px 15px;
        }

        .form-control:focus {
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
          border-color: #4CAF50;
        }
      `}</style>
    </div>
  );
} 