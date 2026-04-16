import React, { useState, useEffect } from 'react';
import { getLocalBookings, getCompanyBookings, getCompanies } from '../utils/storage';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, parseISO, isAfter, isSameDay, format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [reportType, setReportType] = useState('Month');
  const [bookingType, setBookingType] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('');
  
  const [bookings, setBookings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0 });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    const fetchCompanies = async () => {
      setCompanies(await getCompanies());
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    loadData();
  }, [reportType, bookingType, selectedCompany]);

  const loadData = async () => {
    const lData = await getLocalBookings();
    const cData = await getCompanyBookings();
    const local = lData.map(b => ({ ...b, type: 'Local' }));
    const company = cData.map(b => ({ ...b, type: 'Company' }));
    let all = [...local, ...company];

    const today = new Date();
    let startDate;
    switch (reportType) {
      case 'Day': startDate = startOfDay(today); break;
      case 'Week': startDate = startOfWeek(today, { weekStartsOn: 1 }); break;
      case 'Month': startDate = startOfMonth(today); break;
      case 'Year': startDate = startOfYear(today); break;
      default: startDate = startOfDay(today);
    }

    let filtered = all.filter(b => {
      const bDate = parseISO(b.date);
      return isSameDay(bDate, startDate) || isAfter(bDate, startDate);
    });

    if (bookingType === 'Local') {
      filtered = filtered.filter(b => b.type === 'Local');
    } else if (bookingType === 'Company') {
      filtered = filtered.filter(b => b.type === 'Company');
      if (selectedCompany) {
        filtered = filtered.filter(b => b.companyId === selectedCompany);
      }
    }

    filtered = filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    setBookings(filtered);

    let rev = 0;
    filtered.forEach(b => {
      if(b.paymentStatus === 'Paid' || b.paymentStatus === 'Full') {
        rev += parseFloat(b.fare) || 0;
      }
    });
    setStats({ totalBookings: filtered.length, totalRevenue: rev });
  };

  // Pagination Logic
  const totalRecords = bookings.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = bookings.slice(indexOfFirstRecord, indexOfLastRecord);

  // Reset to page 1 if report parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [reportType, bookingType, selectedCompany]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text('Sri Vignesh Transports', 14, 20);
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Operational Fleet Intelligence Report', 14, 28);
    
    let scopeText = 'All Bookings';
    if(bookingType === 'Local') scopeText = 'Local Bookings Only';
    if(bookingType === 'Company') scopeText = selectedCompany ? `Company Bookings (${selectedCompany})` : 'All Company Bookings';
    
    doc.setFontSize(10);
    doc.text(`Timeline: ${reportType} (${new Date().toLocaleDateString()})`, 14, 36);
    doc.text(`Segment: ${scopeText}`, 14, 42);
    doc.text(`Dispatches: ${stats.totalBookings} | Revenue Collected: Rs. ${stats.totalRevenue.toLocaleString()}`, 14, 48);

    const tableColumn = ["Date", "Type", "Client / Company", "Vehicle No.", "Route Map", "Fare", "Status"];
    const tableRows = bookings.map(b => [
        b.date ? format(parseISO(b.date), 'dd-MM-yyyy') : 'N/A',
        b.type.toUpperCase(),
        b.type === 'Local' ? b.customerName : b.companyId,
        b.vehicleNumber || '---',
        `${b.pickup || '---'} -> ${b.drop || '---'}`,
        `Rs. ${parseFloat(b.fare).toLocaleString()}`,
        b.paymentStatus.toUpperCase()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Report_${reportType}_${bookingType}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="animate-in pb-5">
      {/* Premium Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
        <div>
          <h2 className="fw-800 mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>Insights & Intelligence</h2>
          <p className="text-secondary fw-500 mb-0">Quantitative analysis of fleet utilization and logistics revenue</p>
        </div>
        <button 
          className="btn d-flex align-items-center justify-content-center gap-2 px-4 border-0 shadow-lg text-white" 
          onClick={generatePDF}
          style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
            borderRadius: '12px',
            fontWeight: '700',
            height: '48px',
            boxShadow: '0 8px 16px -4px rgba(220, 38, 38, 0.4)'
          }}
        >
          <i className="bi bi-file-earmark-pdf-fill"></i>
          <span style={{ fontSize: '14px' }}>Download PDF Ledger</span>
        </button>
      </div>

      {/* ONE-LINE FILTER CARD */}
      <div className="card shadow-sm border-0 mb-5 bg-white p-3" style={{ borderRadius: '24px' }}>
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between py-1 px-2 gap-4">
          
          {/* Temporal Scope Pill Group */}
          <div className="d-flex align-items-center gap-3 overflow-auto no-scrollbar pb-2 pb-lg-0">
             <label className="text-secondary fw-800 small text-nowrap mb-0" style={{ letterSpacing: '0.05em' }}>TIMELINE:</label>
             <div className="btn-group p-1 bg-light rounded-pill border" style={{ height: '38px' }}>
                {['Day', 'Week', 'Month', 'Year'].map(type => (
                  <button
                    key={type}
                    className={`btn border-0 rounded-pill px-3 py-1 ${reportType === type ? 'btn-primary shadow-sm' : 'btn-link text-muted text-decoration-none'}`}
                    onClick={() => setReportType(type)}
                    style={{ fontSize: '0.75rem', fontWeight: reportType === type ? '700' : '600', whiteSpace: 'nowrap' }}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
          </div>

          <div className="vr opacity-10 d-none d-lg-block" style={{ height: '30px' }}></div>

          {/* Operational Segment Dropdown */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 flex-grow-1" style={{ maxWidth: '600px' }}>
             <label className="text-secondary fw-800 small text-nowrap mb-0" style={{ letterSpacing: '0.05em' }}>SEGMENT:</label>
             <div className="d-flex gap-2 flex-grow-1">
                <select 
                  className="form-select border-light bg-light rounded-pill px-4 fw-800 shadow-none shadow-none" 
                  value={bookingType} 
                  onChange={e => { setBookingType(e.target.value); setSelectedCompany(''); }}
                  style={{ fontSize: '0.8rem', height: '38px' }}
                >
                  <option value="All">All Operations</option>
                  <option value="Local">Local Fleet</option>
                  <option value="Company">Corporate Node</option>
                </select>

                {bookingType === 'Company' && (
                  <select 
                    className="form-select border-light bg-light rounded-pill px-4 fw-800 shadow-none animate-in" 
                    value={selectedCompany} 
                    onChange={e => setSelectedCompany(e.target.value)}
                    style={{ fontSize: '0.8rem', height: '38px' }}
                  >
                    <option value="">All Client Entities</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-4 overflow-hidden" style={{ borderRadius: '24px' }}>
             <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 fw-800 text-secondary small text-uppercase" style={{ letterSpacing: '1px' }}>Synchronized Capacity</p>
                  <h2 className="mb-0 fw-800" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#6366f1' }}>{stats.totalBookings}</h2>
                  <small className="text-muted fw-600 mt-1 d-block">Matched dispatch units</small>
                </div>
                <div className="bg-primary bg-opacity-10 text-primary p-3 p-md-4 rounded-xl">
                  <i className="bi bi-box-seam fs-1"></i>
                </div>
             </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-4 overflow-hidden" style={{ borderRadius: '24px' }}>
             <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 fw-800 text-secondary small text-uppercase" style={{ letterSpacing: '1px' }}>Net Period Revenue</p>
                  <h2 className="mb-0 fw-800" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#10b981' }}>₹{stats.totalRevenue.toLocaleString()}</h2>
                  <small className="text-muted fw-600 mt-1 d-block">Aggregated settlement verification</small>
                </div>
                <div className="bg-success bg-opacity-10 text-success p-3 p-md-4 rounded-xl">
                  <i className="bi bi-currency-exchange fs-1"></i>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Insights Engine Table */}
      <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
        <div className="card-header bg-white border-bottom p-4 px-3 px-md-5 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
                <div className="text-primary bg-primary bg-opacity-10 p-2 rounded-xl d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <i className="bi bi-cpu"></i>
                </div>
                <h5 className="fw-800 mb-0" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Fleet Analytics Engine</h5>
            </div>
            <div className="bg-white border border-primary-subtle rounded-pill px-3 py-1 fw-800 shadow-sm" style={{ fontSize: '12px', color: '#4f46e5' }}>
                {bookings.length} Records Accessed
            </div>
        </div>

        <div className="table-responsive">
          <table className="table table-mobile-cards align-middle mb-0">
            <thead className="bg-light">
              <tr style={{ height: '50px' }}>
                <th className="px-4 py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>TIMESTAMP</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>CLASS</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>CLIENT ENTITY</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>ASSET</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>ROUTING</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>VALUATION</th>
                <th className="px-4 py-3 text-secondary fw-800 small text-end" style={{ letterSpacing: '0.05em' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-5 text-muted fw-700">NO ANALYTIC SAMPLES DETECTED</td></tr>
              ) : (
                currentRecords.map((b, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td data-label="TIMESTAMP" className="px-4 py-4">
                      <div className="fw-700 text-dark" style={{ fontSize: '13px' }}>{b.date ? format(parseISO(b.date), 'dd MMM yyyy') : 'N/A'}</div>
                    </td>
                    <td data-label="CLASS">
                      <span className={`px-2 py-1 rounded-pill fw-800`} style={{ fontSize: '10px', background: b.type === 'Local' ? '#e0e7ff' : '#f1f5f9', color: b.type === 'Local' ? '#4338ca' : '#334155' }}>
                        {b.type.toUpperCase()}
                      </span>
                    </td>
                    <td data-label="CLIENT ENTITY">
                      <div className="fw-800 text-dark" style={{ fontSize: '14px' }}>
                        {b.type === 'Local' ? b.customerName : b.companyId}
                      </div>
                    </td>
                    <td data-label="ASSET">
                      <span className="fw-700 text-primary" style={{ fontSize: '12px' }}>{b.vehicleNumber || '---'}</span>
                    </td>
                    <td data-label="ROUTING" className="full-width-mobile">
                      <div className="d-flex align-items-center gap-2 fw-700 text-muted" style={{ fontSize: '11px' }}>
                        <span className="text-dark bg-light px-2 py-1 rounded">{b.pickup}</span>
                        <i className="bi bi-arrow-right opacity-25"></i>
                        <span className="text-dark bg-light px-2 py-1 rounded">{b.drop}</span>
                      </div>
                    </td>
                    <td data-label="VALUATION">
                      <span className="fw-800 text-dark">₹{parseFloat(b.fare).toLocaleString()}</span>
                    </td>
                    <td data-label="STATUS" className="px-4 text-lg-end">
                      <div className={`px-3 py-1 rounded-pill fw-800 d-inline-flex gap-2 align-items-center ${b.paymentStatus === 'Paid' || b.paymentStatus === 'Full' ? 'bg-success-subtle text-success' : (b.paymentStatus === 'Partial' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning')}`} style={{ fontSize: '10px' }}>
                        {b.paymentStatus.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalRecords > 0 && (
          <div className="card-footer bg-white border-top p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
             <div className="text-secondary fw-700 small" style={{ letterSpacing: '0.5px' }}>
                SHOWING <span className="text-dark fw-800">{indexOfFirstRecord + 1}</span> TO <span className="text-dark fw-800">{Math.min(indexOfLastRecord, totalRecords)}</span> OF <span className="text-primary fw-900">{totalRecords}</span> RECORDS
             </div>
             
             <div className="d-flex gap-2">
                <button 
                  className="btn btn-light border-0 shadow-sm px-3 fw-800 d-flex align-items-center gap-2" 
                  style={{ borderRadius: '10px', fontSize: '13px', opacity: currentPage === 1 ? 0.5 : 1 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <i className="bi bi-chevron-left mt-0.5"></i> Previous
                </button>
                <div className="d-flex align-items-center justify-content-center px-3 fw-900 text-primary bg-primary bg-opacity-10 rounded-pill" style={{ minWidth: '40px', fontSize: '13px' }}>
                  {currentPage}
                </div>
                <button 
                  className="btn btn-light border-0 shadow-sm px-3 fw-800 d-flex align-items-center gap-2" 
                  style={{ borderRadius: '10px', fontSize: '13px', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next <i className="bi bi-chevron-right mt-0.5"></i>
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
