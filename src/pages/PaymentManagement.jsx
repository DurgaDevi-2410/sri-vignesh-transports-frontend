import React, { useState, useEffect, useMemo } from 'react';
import { getLocalBookings, saveLocalBooking, getCompanyBookings, saveCompanyBooking } from '../utils/storage';
import { format, parseISO } from 'date-fns';

const PaymentManagement = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const lData = await getLocalBookings();
      const cData = await getCompanyBookings();
      const local = lData.map(b => ({ ...b, type: 'Local' }));
      const company = cData.map(b => ({ ...b, type: 'Company' }));
      setAllBookings([...local, ...company].sort((a,b) => new Date(b.date) - new Date(a.date)));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (booking, newStatus) => {
    try {
      const payload = { ...booking, paymentStatus: newStatus };
      if (payload.date && payload.date.includes('T')) {
        payload.date = payload.date.split('T')[0];
      }
      if (payload.phone === undefined) {
        payload.phone = null;
      }
      
      if (booking.type === 'Local') {
        await saveLocalBooking(payload);
      } else {
        await saveCompanyBooking(payload);
      }
      await loadData();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Check terminal/console for errors.");
    }
  };

  const filteredBookings = useMemo(() => {
    let filtered = allBookings;
    if(filterType !== 'All') {
      filtered = filtered.filter(b => b.type === filterType);
    }
    if(filterStatus !== 'All') {
      if(filterStatus === 'Paid') {
        filtered = filtered.filter(b => b.paymentStatus === 'Paid' || b.paymentStatus === 'Full');
      } else if(filterStatus === 'Unpaid') {
        filtered = filtered.filter(b => b.paymentStatus === 'Unpaid' || b.paymentStatus === 'Pending');
      } else {
        filtered = filtered.filter(b => b.paymentStatus === filterStatus);
      }
    }
    if(filterDate) {
      filtered = filtered.filter(b => (b.date ? b.date.split('T')[0] : '') === filterDate);
    }
    return filtered;
  }, [allBookings, filterType, filterStatus, filterDate]);

  // Pagination Logic
  const totalRecords = filteredBookings.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredBookings.slice(indexOfFirstRecord, indexOfLastRecord);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus, filterDate]);

  const stats = useMemo(() => {
    let collected = 0;
    let pending = 0;
    filteredBookings.forEach(b => {
      const amount = parseFloat(b.fare) || 0;
      if (b.paymentStatus === 'Paid' || b.paymentStatus === 'Full') {
        collected += amount;
      } else {
        pending += amount;
      }
    });
    return { collected, pending };
  }, [filteredBookings]);

  return (
    <div className="animate-in pb-5">
      {/* Premium Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
        <div>
          <h2 className="fw-800 mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>Financial Reconciliation</h2>
          <p className="text-secondary fw-500 mb-0">Track collections and manage outstanding balances</p>
        </div>
      </div>

      {/* Summary Analytics Grid */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6">
          <div className="card h-100 border-0 shadow-sm p-4 text-dark" style={{ borderRadius: '24px', background: '#ecfdf5', border: '1px solid #d1fae5' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 fw-700 small text-success text-uppercase" style={{ letterSpacing: '0.5px' }}>Net Revenue Collected</p>
                <h2 className="mb-0 fw-800" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#065f46' }}>₹{stats.collected.toLocaleString()}</h2>
              </div>
              <div className="p-3 rounded-xl d-flex justify-content-center align-items-center" style={{ backgroundColor: '#d1fae5', color: '#059669', width: '60px', height: '60px' }}>
                <i className="bi bi-shield-check fs-2"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card h-100 border-0 shadow-sm p-4 text-dark" style={{ borderRadius: '24px', background: '#fff1f2', border: '1px solid #ffe4e6' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 fw-700 small text-danger text-uppercase" style={{ letterSpacing: '0.5px' }}>Outstanding Balance</p>
                <h2 className="mb-0 fw-800" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#9f1239' }}>₹{stats.pending.toLocaleString()}</h2>
              </div>
              <div className="p-3 rounded-xl d-flex justify-content-center align-items-center" style={{ backgroundColor: '#ffe4e6', color: '#e11d48', width: '60px', height: '60px' }}>
                <i className="bi bi-exclamation-triangle fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container with One-Line Filters */}
      <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
        <div className="card-header bg-white border-bottom p-4 d-flex align-items-center justify-content-between flex-wrap gap-4">
            <div className="d-flex align-items-center gap-3">
                <div className="text-primary bg-primary bg-opacity-10 p-2 rounded-xl d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <i className="bi bi-wallet2"></i>
                </div>
                <h5 className="fw-800 mb-0" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Ledger Reconciliation</h5>
            </div>
            
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <select 
                className="form-select shadow-sm rounded-pill border bg-white px-3 shadow-none" 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)}
                style={{ width: 'auto', minWidth: '140px', height: '42px', fontSize: '0.85rem', fontWeight: '600' }}
              >
                <option value="All">All Operations</option>
                <option value="Local">Local Fleet</option>
                <option value="Company">Corporate Node</option>
              </select>
              
              <select 
                className="form-select shadow-sm rounded-pill border bg-white px-3 shadow-none" 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                style={{ width: 'auto', minWidth: '140px', height: '42px', fontSize: '0.85rem', fontWeight: '600' }}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Settled (Paid)</option>
                <option value="Partial">Partial Pay</option>
                <option value="Unpaid">Outstanding</option>
              </select>

              <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white" style={{ width: 'auto', minWidth: '160px', height: '42px' }}>
                <input 
                  type="date" 
                  className="form-control border-0 bg-white shadow-none px-3" 
                  value={filterDate} 
                  onChange={e => setFilterDate(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
        </div>

        <div className="table-responsive">
          <table className="table table-mobile-cards align-middle mb-0">
            <thead className="bg-light">
              <tr style={{ height: '50px' }}>
                <th className="px-4 py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>POSTING DATE</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>NODE TYPE</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>CLIENT</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>ASSET</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>NET FARE</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>STATUS</th>
                <th className="px-4 py-3 text-secondary fw-800 small text-end" style={{ letterSpacing: '0.05em' }}>RECONCILE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5 text-muted fw-700">SYNCING DATA...</td></tr>
              ) : currentRecords.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-5 text-muted fw-700">NO FINANCIAL ENTRIES MATCH FILTERS</td></tr>
              ) : (
                currentRecords.map((b, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td data-label="POSTING DATE" className="px-4 py-4">
                      <div className="fw-700 text-dark" style={{ fontSize: '13px' }}>{b.date ? format(parseISO(b.date), 'dd MMM yyyy') : 'N/A'}</div>
                      <small className="text-muted fw-600 d-none d-lg-block" style={{ fontSize: '10px' }}>TXN: #P{b.id.toString().slice(-4).toUpperCase()}</small>
                    </td>
                    <td data-label="NODE TYPE">
                      <span className={`px-2 py-1 rounded-pill fw-800`} style={{ fontSize: '10px', background: b.type === 'Local' ? '#e0e7ff' : '#f1f5f9', color: b.type === 'Local' ? '#4338ca' : '#334155' }}>
                        {b.type.toUpperCase()}
                      </span>
                    </td>
                    <td data-label="CLIENT">
                      <div className="fw-800 text-dark" style={{ fontSize: '14px' }}>
                        {b.type === 'Local' ? b.customerName : <span className="text-primary">{b.companyId}</span>}
                      </div>
                    </td>
                    <td data-label="ASSET">
                      <span className="fw-700 text-muted" style={{ fontSize: '12px' }}>{b.vehicleNumber || 'N/A'}</span>
                    </td>
                    <td data-label="NET FARE">
                      <span className="fw-800 text-dark">₹{parseFloat(b.fare).toLocaleString()}</span>
                    </td>
                    <td data-label="STATUS">
                      <span className={`px-3 py-1 rounded-pill fw-800 ${b.paymentStatus === 'Paid' || b.paymentStatus === 'Full' ? 'bg-success-subtle text-success' : (b.paymentStatus === 'Partial' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning')}`} style={{ fontSize: '11px' }}>
                        {b.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td data-label="RECONCILE" className="px-4 text-lg-end">
                      <select 
                        className="form-select form-select-sm border-0 bg-light shadow-sm fw-800 rounded-pill shadow-none" 
                        style={{ width: '130px', margin: '0 0 0 auto', fontSize: '0.75rem' }}
                        value={b.paymentStatus}
                        onChange={(e) => handleStatusChange(b, e.target.value)}
                      >
                        {b.type === 'Local' ? (
                          <>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partial">Partial</option>
                            <option value="Paid">Paid</option>
                          </>
                        ) : (
                          <>
                            <option value="Pending">Pending</option>
                            <option value="Partial">Partial</option>
                            <option value="Full">Full</option>
                          </>
                        )}
                      </select>
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
                SHOWING <span className="text-dark fw-800">{indexOfFirstRecord + 1}</span> TO <span className="text-dark fw-800">{Math.min(indexOfLastRecord, totalRecords)}</span> OF <span className="text-primary fw-900">{totalRecords}</span> TXNS
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

export default PaymentManagement;
