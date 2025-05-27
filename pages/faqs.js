import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

export default function FAQs() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is ADECMPC?",
      answer: "ADECMPC (Analog Devices Employees and Community Multipurpose Cooperative) is a multi-awarded cooperative in Cavite and General Trias, serving members for over 39 years. We provide financial services, loans, and community-driven solutions to help you achieve your dreams."
    },
    {
      question: "How can ADECMPC help me achieve my dreams?",
      answer: "Whether you want to buy a house, a car, a big TV, or need funds for your plans, ADECMPC offers a range of loans and financial services tailored to your modern needs. Our mission is to help you grow your tomorrow, today."
    },
    {
      question: "What types of loans does ADECMPC offer?",
      answer: (
        <span>
          <strong>Car Loans:</strong> Loan up to ₱2,000,000.00, payable from 24 to 60 months, with an interest rate of only 0.36%.<br />
          <strong>Housing Loans:</strong> Loan up to ₱1,000,000.00 with low interest rates to help you own your dream home.<br />
          <strong>Personal Loans:</strong> For purchases like appliances, gadgets, or other needs.<br />
          <strong>Long-Term Loans:</strong> For bigger plans and a brighter future, with low interest rates.
        </span>
      )
    },
    {
      question: "How long has ADECMPC been operating?",
      answer: "ADECMPC has been helping members turn their dreams into reality for over 39 years. With decades of experience, we know how to make things happen."
    },
    {
      question: "How many members does ADECMPC have?",
      answer: "ADECMPC has over 3,500 members who enjoy exclusive benefits and perks."
    },
    {
      question: "How do I become a member of ADECMPC?",
      answer: (
        <span>
          Sign up and become a member today to enjoy all the benefits and perks that only ADECMPC members receive.<br />
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSckTQPSnD3GitG3bQnMp5P_F7jLkCcjwP1pV21NAP9elVjgxQ/viewform" target="_blank" rel="noopener noreferrer">
            Click here to access the membership application form.
          </a>
        </span>
      )
    },
    {
      question: "Why should I trust ADECMPC?",
      answer: "With more than 39 years of experience and a Hall of Fame award for Outstanding Large-Scale Cooperative in Cavite, ADECMPC is a trusted partner in helping you achieve your goals."
    },
    {
      question: "What makes ADECMPC different from other cooperatives?",
      answer: "ADECMPC is recognized for its diversified services, multi-awarded excellence, and commitment to both employees and the community. We offer a dynamic, professional environment and personalized support for every member."
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
              <Image
                src="/487083768_557976863971305_3421396436649360911_n.jpg"
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