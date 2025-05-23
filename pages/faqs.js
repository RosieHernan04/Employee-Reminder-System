import Link from 'next/link';
import { useState } from 'react';

export default function FAQs() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is ADECMPC?",
      answer: "ADECMPC (Agricultural Development and Economic Cooperative Multi-Purpose Cooperative) is a cooperative organization dedicated to providing financial services and sustainable solutions to its members."
    },
    {
      question: "How can I become a member?",
      answer: "To become a member, you need to submit an application form, provide valid ID, pay the membership fee, and attend an orientation session. Visit our office or contact us for more details."
    },
    {
      question: "What are the benefits of joining ADECMPC?",
      answer: "Members enjoy various benefits including access to loans, savings programs, dividends, training programs, and participation in cooperative activities and decision-making."
    },
    {
      question: "What types of loans do you offer?",
      answer: "We offer various types of loans including business loans, agricultural loans, personal loans, and emergency loans. Each type has specific terms and requirements."
    },
    {
      question: "How do I apply for a loan?",
      answer: "Loan application requires membership, completion of application forms, submission of required documents, and meeting our credit criteria. Contact our loan officers for detailed information."
    }
  ];

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
              <Link href="/contact" className="nav-link text-success fw-bold">
                Contact
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link href="/faqs" className="nav-link text-success fw-bold" style={{ borderBottom: '2px solid #4CAF50' }}>
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
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(76, 175, 80, 0.1) 50%, rgba(255, 152, 0, 0.1) 100%)',
          padding: '80px 20px',
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div
                style={{
                  background: 'rgba(33, 150, 243, 0.2)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <h1 className="text-success mb-4">Frequently Asked Questions</h1>
                <div className="accordion">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="mb-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        className="p-3"
                        style={{
                          cursor: 'pointer',
                          background: activeIndex === index ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                          borderBottom: activeIndex === index ? '1px solid rgba(76, 175, 80, 0.2)' : 'none',
                        }}
                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                      >
                        <h5 className="mb-0 d-flex justify-content-between align-items-center">
                          {faq.question}
                          <span style={{ transition: 'transform 0.3s ease' }}>
                            {activeIndex === index ? '−' : '+'}
                          </span>
                        </h5>
                      </div>
                      <div
                        style={{
                          maxHeight: activeIndex === index ? '500px' : '0',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <p className="p-3 mb-0">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
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
      `}</style>
    </div>
  );
} 