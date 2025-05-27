import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../dataconnect/firebase';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import Link from 'next/link';

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
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
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
  tableCellHeader: {
    flex: 1,
    padding: 5,
    fontWeight: 'bold',
  },
  statBox: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#999',
  },
});

// PDF Document Component
const ReportDocument = ({ data, reportType, dateRange }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>ADECMPC Report</Text>
      
      <View style={styles.section}>
        <Text style={styles.title}>{reportType}</Text>
        <Text style={styles.subtitle}>Date Range: {dateRange}</Text>
        
        {reportType === 'Task Summary Report' && (
          <>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Total Tasks</Text>
              <Text style={styles.statValue}>{data.total}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Completed Tasks</Text>
              <Text style={styles.statValue}>{data.completed}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Pending Tasks</Text>
              <Text style={styles.statValue}>{data.pending}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Overdue Tasks</Text>
              <Text style={styles.statValue}>{data.overdue}</Text>
            </View>
          </>
        )}
        
        {reportType === 'Meeting & Schedule Report' && (
          <>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Total Meetings</Text>
              <Text style={styles.statValue}>{data.total}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Upcoming Meetings</Text>
              <Text style={styles.statValue}>{data.upcoming}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Attendance Tracked</Text>
              <Text style={styles.statValue}>{data.attendance}</Text>
            </View>
            
            <Text style={styles.title}>Meeting Types</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellHeader}>Type</Text>
                <Text style={styles.tableCellHeader}>Count</Text>
              </View>
              {Object.entries(data.types || {}).map(([type, count], index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{type}</Text>
                  <Text style={styles.tableCell}>{count}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        
        {reportType === 'Admin Activity Report' && (
          <>
            <Text style={styles.subtitle}>Total Activities: {data.length}</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellHeader}>Date/Time</Text>
                <Text style={styles.tableCellHeader}>Admin</Text>
                <Text style={styles.tableCellHeader}>Action</Text>
                <Text style={styles.tableCellHeader}>Details</Text>
              </View>
              {data.map((log, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {log.timestamp ? format(log.timestamp, 'MMM d, yyyy h:mm a') : 'N/A'}
                  </Text>
                  <Text style={styles.tableCell}>{log.adminName || 'System'}</Text>
                  <Text style={styles.tableCell}>{log.actionType}</Text>
                  <Text style={styles.tableCell}>{log.details}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
      
      <Text style={styles.footer}>
        Generated on {format(new Date(), 'MMM d, yyyy h:mm a')}
      </Text>
    </Page>
  </Document>
);

export default function Reports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('task-summary');
  const [dateRange, setDateRange] = useState('week');
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });
  const [meetingStats, setMeetingStats] = useState({
    total: 0,
    upcoming: 0,
    attendance: 0,
    types: {}
  });
  const [adminLogs, setAdminLogs] = useState([]);
  const [showPdfDownload, setShowPdfDownload] = useState(false);
  const [adminActivity, setAdminActivity] = useState([]);

  // Fetch data based on active tab and date range
  useEffect(() => {
    setLoading(true);
    
    if (activeTab === 'task-summary') {
      fetchTaskSummary();
    } else if (activeTab === 'meeting-schedule') {
      fetchMeetingSchedule();
    } else if (activeTab === 'admin-logs') {
      fetchAdminActivity();
    }
    
    setLoading(false);
  }, [activeTab, dateRange]);

  // Get date range based on selected option
  const getDateRange = () => {
    const now = new Date();
    
    if (dateRange === 'week') {
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 }) // Sunday
      };
    } else if (dateRange === 'month') {
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    } else if (dateRange === 'quarter') {
      return {
        start: subMonths(now, 3),
        end: now
      };
    } else {
      return {
        start: subMonths(now, 12),
        end: now
      };
    }
  };

  // Get date range text for display
  const getDateRangeText = () => {
    if (dateRange === 'week') {
      return 'This Week';
    } else if (dateRange === 'month') {
      return 'This Month';
    } else if (dateRange === 'quarter') {
      return 'This Quarter';
    } else {
      return 'This Year';
    }
  };

  // Updated fetchTaskSummary function
  const fetchTaskSummary = async () => {
    try {
      const { start, end } = getDateRange();
      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(end);
      const now = new Date();

      const collections = ['employee_tasks', 'admin_tasks', 'tasks'];

      let total = 0;
      let completed = 0;
      let pending = 0;
      let overdue = 0;

      for (const col of collections) {
        const querySnapshot = await getDocs(query(
          collection(db, col),
          where('createdAt', '>=', startTimestamp),
          where('createdAt', '<=', endTimestamp)
        ));

        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          total++;

          if (data.status === 'completed') {
            completed++;
          } else if (data.status === 'pending') {
            pending++;
          }

          if (data.status !== 'completed' && data.deadline && data.deadline.toDate() < now) {
            overdue++;
          }
        });
      }

      setTaskStats({ total, completed, pending, overdue });
    } catch (error) {
      console.error('Error fetching task summary:', error);
    }
  };

  // Updated fetchMeetingSchedule function
  const fetchMeetingSchedule = async () => {
    try {
      const { start, end } = getDateRange();
      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(end);

      const meetingsSnapshot = await getDocs(query(
        collection(db, 'meetings'),
        where('start', '>=', startTimestamp),
        where('start', '<=', endTimestamp)
      ));

      const stats = {
        total: 0,
        upcoming: 0,
        attendance: 0,
        types: {}
      };

      meetingsSnapshot.forEach(doc => {
        const meeting = doc.data();
        const startDate = meeting.start?.toDate?.() || new Date();

        stats.total++;

        if (startDate >= new Date()) {
          stats.upcoming++;
        }

        if (meeting.attendance) {
          stats.attendance++;
        }

        const type = meeting.type || 'Unknown';
        stats.types[type] = (stats.types[type] || 0) + 1;
      });

      setMeetingStats(stats);
    } catch (error) {
      console.error('Error fetching meeting schedule:', error);
    }
  };

  // Updated fetchAdminActivity function
  const fetchAdminActivity = async () => {
    try {
      const { start, end } = getDateRange();
      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(end);

      const activityQuery = query(
        collection(db, 'admin_activity'),
        where('timestamp', '>=', startTimestamp),
        where('timestamp', '<=', endTimestamp),
        orderBy('timestamp', 'desc')
      );

      const activitySnapshot = await getDocs(activityQuery);
      const activityData = activitySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp?.toDate() || new Date(),
          adminName: data.adminName || 'System',
          actionType: data.action || 'Unknown',
          assignedBy: data.assignedBy || null,
          details: typeof data.details === 'object' ? JSON.stringify(data.details) : data.details || 'N/A',
        };
      });

      setAdminActivity(activityData);
    } catch (error) {
      console.error('Error fetching admin activity:', error);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(date, 'MMM d, yyyy h:mm a');
  };

  // Get report data based on active tab
  const getReportData = () => {
    if (activeTab === 'task-summary') {
      return taskStats;
    } else if (activeTab === 'meeting-schedule') {
      return meetingStats;
    } else if (activeTab === 'admin-logs') {
      return adminActivity;
    }
    return null;
  };

  // Get report title based on active tab
  const getReportTitle = () => {
    if (activeTab === 'task-summary') {
      return 'Task Summary Report';
    } else if (activeTab === 'meeting-schedule') {
      return 'Meeting & Schedule Report';
    } else if (activeTab === 'admin-logs') {
      return 'Admin Activity Report';
    }
    return '';
  };

  return (
    <Layout>
      <div className="container py-4">
        {/* Enhanced Title Styling */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="display-4 fw-bold text-primary mb-0">
            Reports & Analytics
            <div className="title-underline bg-primary mt-2"></div>
          </h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowPdfDownload(!showPdfDownload)}
          >
            <i className="bi bi-file-pdf me-2"></i>
            {showPdfDownload ? 'Hide PDF Download' : 'Download PDF'}
          </button>
        </div>

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Reports</li>
          </ol>
        </nav>

        {/* Date Range Selector */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Date Range</h5>
              <div className="btn-group">
                <button 
                  className={`btn ${dateRange === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setDateRange('week')}
                >
                  This Week
                </button>
                <button 
                  className={`btn ${dateRange === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setDateRange('month')}
                >
                  This Month
                </button>
                <button 
                  className={`btn ${dateRange === 'quarter' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setDateRange('quarter')}
                >
                  This Quarter
                </button>
                <button 
                  className={`btn ${dateRange === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setDateRange('year')}
                >
                  This Year
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'task-summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('task-summary')}
            >
              <i className="bi bi-list-check me-2"></i>
              Task Summary
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'meeting-schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('meeting-schedule')}
            >
              <i className="bi bi-calendar-check me-2"></i>
              Meeting & Schedule
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'admin-logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin-logs')}
            >
              <i className="bi bi-journal-text me-2"></i>
              Admin Logs
            </button>
          </li>
        </ul>

        {/* PDF Download Link */}
        {showPdfDownload && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="mb-3">Download Report as PDF</h5>
              <PDFDownloadLink
                document={
                  <ReportDocument 
                    data={getReportData()} 
                    reportType={getReportTitle()} 
                    dateRange={getDateRangeText()}
                  />
                }
                fileName={`${getReportTitle().toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                className="btn btn-success"
              >
                {({ blob, url, loading, error }) => 
                  loading ? 'Generating PDF...' : 'Download PDF'
                }
              </PDFDownloadLink>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading report data...</p>
              </div>
            ) : (
              <>
                {/* Task Summary Report */}
                {activeTab === 'task-summary' && (
                  <div className="task-summary-report">
                    <h4 className="mb-4">Task Summary Report</h4>
                    
                    {/* Task Statistics Cards */}
                    <div className="row g-4 mb-4">
                      <div className="col-md-3 col-sm-6">
                        <div className="card bg-primary text-white h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title">Total Tasks</h6>
                            <h2 className="display-4 mb-2">{taskStats.total}</h2>
                            <p className="text-white-50 mb-0 mt-auto">Created in selected period</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-6">
                        <div className="card bg-success text-white h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title">Completed Tasks</h6>
                            <h2 className="display-4 mb-2">{taskStats.completed}</h2>
                            <p className="text-white-50 mb-0 mt-auto">{Math.round((taskStats.completed / taskStats.total) * 100) || 0}% completion rate</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-6">
                        <div className="card bg-warning text-dark h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title">Pending Tasks</h6>
                            <h2 className="display-4 mb-2">{taskStats.pending}</h2>
                            <p className="text-dark-50 mb-0 mt-auto">{Math.round((taskStats.pending / taskStats.total) * 100) || 0}% pending rate</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-6">
                        <div className="card bg-danger text-white h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title">Overdue Tasks</h6>
                            <h2 className="display-4 mb-2">{taskStats.overdue}</h2>
                            <p className="text-white-50 mb-0 mt-auto">{Math.round((taskStats.overdue / taskStats.total) * 100) || 0}% overdue rate</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meeting & Schedule Report */}
                {activeTab === 'meeting-schedule' && (
                  <div className="meeting-schedule-report">
                    <h4 className="mb-4">Meeting & Schedule Report</h4>
                    
                    {/* Meeting Statistics Cards */}
                    <div className="row g-4 mb-4">
                      <div className="col-md-3 col-sm-6">
                        <div className="card bg-primary text-white h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title">Total Meetings</h6>
                            <h2 className="display-4 mb-2">{meetingStats.total}</h2>
                            <p className="text-white-50 mb-0 mt-auto">In selected period</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-6">
                        <div className="card bg-success text-white h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title">Upcoming Meetings</h6>
                            <h2 className="display-4 mb-2">{meetingStats.upcoming}</h2>
                            <p className="text-white-50 mb-0 mt-auto">Scheduled for future</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-6">
                        <div className="card bg-info text-white h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title">Attendance Tracked</h6>
                            <h2 className="display-4 mb-2">{meetingStats.attendance}</h2>
                            <p className="text-white-50 mb-0 mt-auto">With attendance records</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-6">
                        <div className="card bg-warning text-dark h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title">Meeting Types</h6>
                            <h2 className="display-4 mb-2">{Object.keys(meetingStats.types).length}</h2>
                            <p className="text-dark-50 mb-0 mt-auto">Different categories</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Meeting Types */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="card h-100">
                          <div className="card-header">
                            <h5 className="mb-0">Meeting Types</h5>
                          </div>
                          <div className="card-body">
                            {Object.keys(meetingStats.types).length > 0 ? (
                              <div className="table-responsive">
                                <table className="table table-hover">
                                  <thead>
                                    <tr>
                                      <th>Type</th>
                                      <th>Count</th>
                                      <th>Percentage</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(meetingStats.types).map(([type, count], index) => (
                                      <tr key={index}>
                                        <td>{type}</td>
                                        <td>{count}</td>
                                        <td>
                                          <div className="progress">
                                            <div 
                                              className="progress-bar bg-info" 
                                              role="progressbar" 
                                              style={{ width: `${(count / meetingStats.total) * 100}%` }}
                                              aria-valuenow={count} 
                                              aria-valuemin="0" 
                                              aria-valuemax={meetingStats.total}
                                            ></div>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-center text-muted">No meeting data available for the selected period.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Logs */}
                {activeTab === 'admin-logs' && (
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-4">Recent Admin Actions</h5>
                      {adminActivity.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-journal-text display-4 text-muted"></i>
                          <p className="mt-3 text-muted">No admin logs available.</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Timestamp</th>
                                <th>Admin</th>
                                <th>Action</th>
                                <th>Assigned By</th>
                                <th>Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminActivity.map((log) => (
                                <tr key={log.id}>
                                  <td>{formatDate(log.timestamp)}</td>
                                  <td>{log.adminName}</td>
                                  <td>
                                    <span className={`badge ${getActionBadgeClass(log.actionType)}`}>
                                      {log.actionType}
                                    </span>
                                  </td>
                                  <td>{log.assignedBy && typeof log.assignedBy === 'object' ? log.assignedBy.name : 'System'}</td>
                                  <td>{log.details}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .title-underline {
          height: 4px;
          width: 100px;
          border-radius: 2px;
          background: linear-gradient(90deg, #ffc107, #28a745, #8b4513, #dc3545);
        }
        
        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          padding: 0.75rem 1.25rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .nav-tabs .nav-link:hover {
          color: #2c3e50;
          background-color: transparent;
          border-bottom: 2px solid #dee2e6;
        }
        
        .nav-tabs .nav-link.active {
          color: #2c3e50;
          background-color: transparent;
          border-bottom: 2px solid #0d6efd;
        }
        
        .card {
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: none;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        .progress {
          height: 0.5rem;
          border-radius: 0.25rem;
        }
        
        .table th {
          font-weight: 600;
          border-top: none;
        }
        
        .badge {
          padding: 0.5em 0.75em;
          font-weight: 500;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .card {
          animation: fadeIn 0.5s ease-out;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .display-4 {
            font-size: 2rem;
          }
          
          .card-body {
            padding: 1rem;
          }
          
          .table-responsive {
            margin-bottom: 0;
          }
        }
        
        /* Fix for overlapping text in cards */
        .card-body {
          display: flex;
          flex-direction: column;
        }
        
        .card-title {
          margin-bottom: 0.5rem;
        }
        
        .text-break {
          word-break: break-word;
        }
        
        .text-nowrap {
          white-space: nowrap;
        }
      `}</style>
    </Layout>
  );
}

// Helper function to get badge class based on action type
function getActionBadgeClass(action) {
  switch (action) {
    case 'TASK_COMPLETED':
      return 'bg-success';
    case 'TASK_CREATED':
    case 'MEETING_CREATED':
    case 'USER_CREATED':
      return 'bg-primary';
    case 'TASK_UPDATED':
    case 'MEETING_UPDATED':
    case 'USER_UPDATED':
      return 'bg-info';
    case 'TASK_DELETED':
    case 'MEETING_DELETED':
    case 'USER_DELETED':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}
