import { useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import AdminLayout from '../../components/layout/AdminLayout';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#0066cc',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#bfbfbf',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    padding: 5,
  },
});

// PDF Document Component
const ReportDocument = ({ data, reportType, dateRange }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>ADECMPC Report</Text>
      
      <View style={styles.section}>
        <Text style={styles.title}>{reportType}</Text>
        <Text>Date Range: {dateRange}</Text>
        
        {/* Add your report content here based on the data */}
      </View>
    </Page>
  </Document>
);

export default function Reports() {
  const [reportType, setReportType] = useState('taskSummary');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [generatedReport, setGeneratedReport] = useState(null);

  const generateReport = async () => {
    // Example data - replace with actual API calls
    const reportData = {
      taskSummary: {
        totalTasks: 150,
        completedTasks: 120,
        pendingTasks: 30,
        // Add more metrics
      },
      // Add more report types
    };

    setGeneratedReport(reportData);
  };

  return (
    <AdminLayout>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Reports</h1>
          <button className="btn btn-success">
            <i className="bi bi-download me-2"></i>Export Reports
          </button>
        </div>

        {/* Report Type Selection */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <select className="form-select">
                  <option value="">Select Report Type</option>
                  <option value="user">User Activity Report</option>
                  <option value="task">Task Completion Report</option>
                  <option value="performance">Performance Report</option>
                </select>
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  placeholder="Start Date"
                />
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  placeholder="End Date"
                />
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary w-100">
                  <i className="bi bi-search me-2"></i>Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="row g-4">
          {/* User Activity Report */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">User Activity Report</h5>
                <button className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-download"></i>
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Activity Type</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Logins</td>
                        <td>150</td>
                        <td>45%</td>
                      </tr>
                      <tr>
                        <td>Task Updates</td>
                        <td>89</td>
                        <td>27%</td>
                      </tr>
                      <tr>
                        <td>Comments</td>
                        <td>67</td>
                        <td>20%</td>
                      </tr>
                      <tr>
                        <td>File Uploads</td>
                        <td>25</td>
                        <td>8%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Task Completion Report */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Task Completion Report</h5>
                <button className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-download"></i>
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Count</th>
                        <th>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Completed</td>
                        <td>110</td>
                        <td>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: "75%" }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>In Progress</td>
                        <td>25</td>
                        <td>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className="progress-bar bg-warning"
                              style={{ width: "15%" }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>Pending</td>
                        <td>12</td>
                        <td>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className="progress-bar bg-danger"
                              style={{ width: "10%" }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="col-md-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Performance Metrics</h5>
                <button className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-download"></i>
                </button>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center">
                      <h6 className="text-muted mb-2">Average Response Time</h6>
                      <h3 className="mb-0">2.5 hrs</h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center">
                      <h6 className="text-muted mb-2">Task Completion Rate</h6>
                      <h3 className="mb-0">85%</h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center">
                      <h6 className="text-muted mb-2">User Satisfaction</h6>
                      <h3 className="mb-0">4.5/5</h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center">
                      <h6 className="text-muted mb-2">Active Users</h6>
                      <h3 className="mb-0">89%</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
