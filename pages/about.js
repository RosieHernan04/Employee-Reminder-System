import Link from 'next/link';

export default function About() {
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
              <Link href="/about" className="nav-link text-success fw-bold" style={{ borderBottom: '2px solid #4CAF50' }}>
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
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 152, 0, 0.1) 50%, rgba(33, 150, 243, 0.1) 100%)',
          padding: '80px 20px',
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div
                style={{
                  background: 'rgba(76, 175, 80, 0.2)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {/* --- New ADECMPC About Section --- */}
                <h1 className="text-success mb-4">About ADECMPC</h1>
                <p className="lead mb-4">
                  Analog Devices Employees and Community Multipurpose Cooperative (ADECMPC) is a Hall of Fame awardee for being recognized as the Outstanding Large-Scale Cooperative in Cavite for four consecutive years. We are also one of the most diversified and multi-awarded cooperatives in the Province of Cavite and the City of General Trias. Our operations span multiple industries, including financial services, retail, and various community-driven enterprises. With our established reputation and vast network, we offer a dynamic and professional learning environment where interns can apply their academic knowledge to real-world business settings.
                </p>

                <h2 className="text-success mt-5 mb-3" style={{ fontWeight: 700 }}>History and Milestones of ADECMPC</h2>
                <div className="mb-4">
                  <h4 className="text-success mb-2" style={{ fontWeight: 600 }}>Foundation and Early Years</h4>
                  <ul>
                    <li><strong>September 1986:</strong> The Analog Devices Employees Credit Cooperative (ADECC) was founded to assist regular employees of Analog Devices Philippines, Inc. (ADPI) in enhancing their livelihood. The cooperative aimed to provide financial services that would cater to the needs of its members.</li>
                    <li><strong>Founding Members:</strong> The founding Board of Directors comprised individuals who were pivotal in shaping the cooperative's mission, including Ms. Aysa Redondo (Chairman), Susan Capuli, Shirley Hulipas, Ane Ortilla, Oscar Salomon, Rudy Rillera, Louie David, Fredie Albania, Cora Toledo, Nancy Refe, and Dino Del Rosario. Their combined efforts established a strong foundation for the cooperative.</li>
                    <li><strong>Initial Funding:</strong> ADPI supported ADECC by extending a cash credit of ₱100,000.00 as seed capital, interest-free, to facilitate the cooperative’s early operations. This funding was crucial in helping the cooperative start lending to its members.</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-success mb-2" style={{ fontWeight: 600 }}>Growth and Development</h4>
                  <ul>
                    <li><strong>1986-1996:</strong> In its early years, ADECC focused on educating its members about savings and responsible borrowing. Members pledged ten shares (equivalent to ₱200.00) upon joining, and contributions were collected via salary deductions.</li>
                    <li><strong>Emergency and Short-Term Loans:</strong> ADECC began lending money to its members through Emergency and Short-Term loans. The positive reception led to the introduction of Provident and Productive Loans, enabling members to borrow larger sums for various purposes, including starting businesses, purchasing homes, and financing vehicle down payments.</li>
                    <li><strong>1988:</strong> ADECC declared and paid its first dividend and patronage refund, demonstrating its financial stability and commitment to rewarding its members.</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-success mb-2" style={{ fontWeight: 600 }}>Formal Recognition and Expansion</h4>
                  <ul>
                    <li><strong>December 11, 1996:</strong> ADECC was formally registered with the Cooperative Development Authority (CDA), which granted it legal personality. This registration enhanced the cooperative's credibility and stability, allowing it to operate more confidently in the community.</li>
                    <li><strong>Board of Directors at Registration:</strong> During the registration process, the Board of Directors included Cesar Moll (Chairman), Pete Agno (Vice-Chairman), and other notable members like Jimmy Muncal, Lucito David, Josefina Bernabe, Novea Aldea, Teresita Uy, Romeo Gracilla, Neo Manganiman, and Rosalinda Lim.</li>
                    <li><strong>November 12, 2009:</strong> The cooperative was registered under Republic Act No. 9520, also known as the Cooperative Code of 2008, with Registration No. 9520-16002410, further solidifying its status.</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-success mb-2" style={{ fontWeight: 600 }}>Transition to Multipurpose Cooperative</h4>
                  <ul>
                    <li><strong>July 18, 2011:</strong> After 15 years of operation, ADECC transitioned into a multipurpose cooperative. This transformation was initiated by a committed Board of Directors, including Jesus Gadugdug (Chairperson), Enero Policarpio (Vice-Chairperson), and other key members like Agnes Salcedo, Jane Aguila, Girlie Aquino, Jericho Tonelada, Anita Hernandez, Jelma Bermal, Froilan Beratio, Joel Repani, and Donabel Cabrera.</li>
                    <li><strong>General Assembly Approval:</strong> The conversion to a multipurpose cooperative was approved by the General Assembly, allowing ADECMPC to explore new business avenues and provide a broader range of services to its members.</li>
                    <li><strong>Rebranding:</strong> Following the successful transition, the cooperative officially adopted the name ANALOG DEVICES EMPLOYEES MULTIPURPOSE COOPERATIVE (ADEMC) to reflect its expanded capabilities.</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-success mb-2" style={{ fontWeight: 600 }}>Recent Developments</h4>
                  <ul>
                    <li><strong>2022:</strong> The cooperative further evolved to embrace a wider community engagement focus, rebranding as ANALOG DEVICES EMPLOYEES AND COMMUNITY MULTIPURPOSE COOPERATIVE (ADECMPC). This change signifies its commitment to not only serve its members but also the surrounding community, enhancing its role in local development.</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-success mb-2" style={{ fontWeight: 600 }}>Significant Milestones</h4>
                  <ul>
                    <li><strong>1986:</strong> Establishment of ADECC to support employees' financial needs.</li>
                    <li><strong>1988:</strong> Declaration of the first dividend and patronage refund.</li>
                    <li><strong>1996:</strong> Formal registration with the CDA, gaining legal personality.</li>
                    <li><strong>2009:</strong> Registration under the Cooperative Code of 2008.</li>
                    <li><strong>2011:</strong> Transition to multipurpose cooperative status, rebranding to ADEMC.</li>
                    <li><strong>2022:</strong> Rebranding to ADECMPC to reflect community involvement and service expansion.</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-success mb-2" style={{ fontWeight: 600 }}>Core Values</h4>
                  <ul>
                    <li><strong>A</strong> - Accountability</li>
                    <li><strong>D</strong> - Democracy</li>
                    <li><strong>E</strong> - Empowerment</li>
                    <li><strong>C</strong> - Community</li>
                    <li><strong>M</strong> - Mutual Support</li>
                    <li><strong>P</strong> - Planet Stewardship</li>
                    <li><strong>C</strong> - Culture</li>
                  </ul>
                </div>
                {/* --- End ADECMPC About Section --- */}
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