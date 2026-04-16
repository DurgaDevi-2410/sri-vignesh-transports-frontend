import React, { useState, useEffect } from 'react';
import { getCompanyBookings, saveCompanyBooking, deleteCompanyBooking, getCompanies, getVehicles } from '../utils/storage';
import { format, parseISO } from 'date-fns';

const CompanyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [filterCompany, setFilterCompany] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [formData, setFormData] = useState({
    id: '', companyId: '', customerName: '', pickup: '', drop: '', 
    vehicleNumber: '', date: '', fare: '', paymentStatus: 'Pending'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setBookings(await getCompanyBookings());
    setCompanies(await getCompanies());
    setVehicles(await getVehicles());
  };

  const handleOpenModal = (b = null) => {
    if (b) {
      setFormData(b);
    } else {
      setFormData({
        id: '', companyId: companies.length > 0 ? companies[0].name : '', customerName: '', pickup: '', drop: '', 
        vehicleNumber: vehicles.length > 0 ? vehicles[0].vehicleNumber : '', date: new Date().toISOString().split('T')[0], fare: '', paymentStatus: 'Pending'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.companyId) {
       alert("Please select or add a company first");
       return;
    }
    await saveCompanyBooking(formData);
    loadData();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this booking?')) {
      await deleteCompanyBooking(id);
      loadData();
    }
  };

  let filteredBookings = bookings.sort((a,b) => new Date(b.date) - new Date(a.date));
  
  if(filterCompany) {
    filteredBookings = filteredBookings.filter(b => b.companyId.toLowerCase().includes(filterCompany.toLowerCase()));
  }
  if(filterDate) {
    filteredBookings = filteredBookings.filter(b => b.date === filterDate);
  }

  // Pagination Logic
  const totalRecords = filteredBookings.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredBookings.slice(indexOfFirstRecord, indexOfLastRecord);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCompany, filterDate]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Full':
      case 'Paid': return 'bg-success-subtle text-success';
      case 'Partial': return 'bg-info-subtle text-info';
      default: return 'bg-warning-subtle text-warning';
    }
  };

  return (
    <>
      <div className="animate-in pb-5">
        {/* Header Controls */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
          <div>
            <h2 className="fw-800 mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>Corporate Bookings</h2>
            <p className="text-secondary fw-500 mb-0">Fleet management for corporate clients</p>
          </div>
          
          <div className="d-flex flex-column flex-sm-row gap-3 align-items-stretch align-items-sm-center">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white" style={{ minWidth: '200px', height: '48px' }}>
              <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-search text-primary"></i></span>
              <input 
                type="text" 
                className="form-control border-0 bg-white shadow-none" 
                placeholder="Filter company..." 
                value={filterCompany}
                onChange={e => setFilterCompany(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              />
            </div>
            
            <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white" style={{ minWidth: '160px', height: '48px' }}>
              <input 
                type="date" 
                className="form-control border-0 bg-white shadow-none px-3" 
                value={filterDate} 
                onChange={e => setFilterDate(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              />
            </div>

            <button 
              className="btn d-flex align-items-center justify-content-center gap-2 px-4 shadow-lg border-0 text-white" 
              onClick={() => handleOpenModal()}
              style={{ 
                background: '#4f46e5',
                borderRadius: '12px',
                fontWeight: '700',
                height: '48px',
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.4)'
              }}
            >
              <i className="bi bi-plus-lg"></i>
              <span style={{ fontSize: '14px' }}>New Entry</span>
            </button>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
          <div className="card-header bg-white border-bottom p-4 px-3 px-md-5 d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                  <div className="text-primary bg-primary bg-opacity-10 p-2 rounded-xl d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <i className="bi bi-grid-fill"></i>
                  </div>
                  <h5 className="fw-800 mb-0" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Client Activity Log</h5>
              </div>
              <div className="bg-white border border-primary-subtle rounded-pill px-3 py-1 fw-800 shadow-sm" style={{ fontSize: '12px', color: '#4f46e5' }}>
                  {filteredBookings.length} Records
              </div>
          </div>

          <div className="table-responsive">
            <table className="table table-mobile-cards align-middle mb-0">
              <thead className="bg-light">
                <tr style={{ height: '50px' }}>
                  <th className="px-4 py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>BOOKING & FLEET</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>COMPANY</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>CUSTOMER</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>ROUTE</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>FARE</th>
                  <th className="py-3 text-secondary fw-800 small text-center" style={{ letterSpacing: '0.05em' }}>STATUS</th>
                  <th className="px-4 py-3 text-secondary fw-800 small text-end" style={{ letterSpacing: '0.05em' }}>MANAGE</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted fw-700">NO ACTIVE LOGS FOUND</td></tr>
                ) : (
                  currentRecords.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td data-label="BOOKING & FLEET" className="px-4 py-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="fw-700 text-dark" style={{ fontSize: '13px' }}>{b.date ? format(parseISO(b.date), 'dd MMM yyyy') : 'N/A'}</div>
                          <div className="text-muted opacity-25 d-none d-lg-block">|</div>
                          <span className="fw-800 text-primary" style={{ fontSize: '12px' }}>
                            {b.vehicleNumber}
                          </span>
                        </div>
                      </td>
                      <td data-label="COMPANY">
                        <span className="text-primary fw-700" style={{ fontSize: '14px' }}>{b.companyId}</span>
                      </td>
                      <td data-label="CUSTOMER">
                        <div className="fw-600 text-dark" style={{ fontSize: '13px' }}>{b.customerName}</div>
                      </td>
                      <td data-label="ROUTE" className="full-width-mobile">
                        <div className="d-flex align-items-center gap-2 fw-600 text-muted" style={{ fontSize: '12px' }}>
                          <span>{b.pickup}</span>
                          <i className="bi bi-shuffle opacity-30 text-primary"></i>
                          <span>{b.drop}</span>
                        </div>
                      </td>
                      <td data-label="FARE">
                        <span className="fw-700 text-dark">₹{parseFloat(b.fare).toLocaleString()}</span>
                      </td>
                      <td data-label="STATUS" className="text-lg-center">
                        <span className={`px-3 py-1 rounded-pill fw-800 ${getStatusColor(b.paymentStatus)}`} style={{ fontSize: '11px' }}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td data-label="MANAGE" className="px-4 text-lg-end">
                        <div className="d-flex gap-2 justify-content-lg-end">
                          <button className="btn btn-sm btn-light border p-2 rounded-lg text-secondary shadow-sm" onClick={() => handleOpenModal(b)}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-sm btn-light border p-2 rounded-lg text-danger shadow-sm" onClick={() => handleDelete(b.id)} style={{ background: '#fee2e2' }}>
                            <i className="bi bi-trash3"></i>
                          </button>
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
                  SHOWING <span className="text-dark fw-800">{indexOfFirstRecord + 1}</span> TO <span className="text-dark fw-800">{Math.min(indexOfLastRecord, totalRecords)}</span> OF <span className="text-primary fw-900">{totalRecords}</span> ENTRIES
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog modal-lg m-0 m-md-auto" style={{ maxWidth: '650px' }}>
            <form onSubmit={handleSubmit} className="modal-content shadow-2xl border-0">
              <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                <h4 className="modal-title fw-800 text-dark" style={{ letterSpacing: '-0.5px' }}>Corporate Entry Log</h4>
                <button type="button" className="btn border-0 p-0 shadow-none" onClick={() => setShowModal(false)}>
                   <i className="bi bi-x-lg fs-5 opacity-40 hover-opacity-100 transition-all"></i>
                </button>
              </div>
              
              <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>SELECT COMPANY</label>
                      <select className="form-select rounded-lg shadow-none fw-700" value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})} required>
                        <option value="">Choose Company...</option>
                        {companies.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>REPRESENTATIVE NAME</label>
                      <input type="text" className="form-control rounded-lg shadow-none" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} placeholder="e.g. John Doe" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>PICKUP NODE</label>
                      <input type="text" className="form-control rounded-lg shadow-none" value={formData.pickup} onChange={e => setFormData({...formData, pickup: e.target.value})} placeholder="Enter origin" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>DESTINATION NODE</label>
                      <input type="text" className="form-control rounded-lg shadow-none" value={formData.drop} onChange={e => setFormData({...formData, drop: e.target.value})} placeholder="Enter destination" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>ASSIGNED VEHICLE</label>
                      <select className="form-select rounded-lg shadow-none fw-700" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} required>
                        <option value="">Select Asset...</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.vehicleNumber}>{v.vehicleNumber}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>DISPATCH DATE</label>
                      <input type="date" className="form-control rounded-lg shadow-none fw-700" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>VALUATION (₹)</label>
                      <input type="number" className="form-control rounded-lg shadow-none" value={formData.fare} onChange={e => setFormData({...formData, fare: e.target.value})} placeholder="0.00" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>REVENUE STATUS</label>
                      <select className="form-select rounded-lg shadow-none" value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value})}>
                        <option>Pending</option>
                        <option>Partial</option>
                        <option>Full</option>
                      </select>
                    </div>
                  </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-outline-light text-secondary border px-4 py-2 fw-800" onClick={() => setShowModal(false)} style={{ borderRadius: '10px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4 py-2 fw-800 shadow-sm border-0" style={{ borderRadius: '10px', background: '#4f46e5' }}>Commit Corporate Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyBooking;
