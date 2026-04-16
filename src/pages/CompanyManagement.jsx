import React, { useState, useEffect } from 'react';
import { getCompanies, saveCompany, deleteCompany } from '../utils/storage';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    id: '', name: '', contactPerson: '', phone: '', address: '', gst: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setCompanies(await getCompanies());
  };

  const handleOpenModal = (c = null) => {
    if (c) {
      setFormData(c);
    } else {
      setFormData({ id: '', name: '', contactPerson: '', phone: '', address: '', gst: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveCompany(formData);
    loadCompanies();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this company?')) {
      await deleteCompany(id);
      loadCompanies();
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalRecords = filteredCompanies.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCompanies.slice(indexOfFirstRecord, indexOfLastRecord);

  // Reset to page 1 if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <>
      <div className="animate-in pb-5">
        {/* Premium Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
        <div>
          <h2 className="fw-800 mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>Company Management</h2>
          <p className="text-secondary fw-500 mb-0">Maintain records of your corporate enterprise clients</p>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-3 align-items-stretch align-items-sm-center">
          <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white" style={{ minWidth: '240px', height: '48px' }}>
            <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-search text-primary"></i></span>
            <input 
              type="text" 
              className="form-control border-0 bg-white shadow-none" 
              placeholder="Search companies..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
          </div>
          <button 
            className="btn d-flex align-items-center justify-content-center gap-2 px-4 border-0 shadow-lg text-white" 
            onClick={() => handleOpenModal()}
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              borderRadius: '12px',
              fontWeight: '700',
              height: '48px',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
            }}
          >
            <i className="bi bi-plus-lg"></i>
            <span style={{ fontSize: '14px' }}>Add Company</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
        <div className="card-header bg-white border-bottom p-4 px-3 px-md-5 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
                <div className="text-primary bg-primary bg-opacity-10 p-2 rounded-xl d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <i className="bi bi-building-fill"></i>
                </div>
                <h5 className="fw-800 mb-0" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Enterprise Directory</h5>
            </div>
            <div className="bg-white border border-primary-subtle rounded-pill px-3 py-1 fw-800 shadow-sm" style={{ fontSize: '12px', color: '#4f46e5' }}>
                {filteredCompanies.length} Systems Active
            </div>
        </div>

        <div className="table-responsive">
          <table className="table table-mobile-cards align-middle mb-0">
            <thead className="bg-light">
              <tr style={{ height: '50px' }}>
                <th className="px-4 py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>NAME</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>PRIMARY CONTACT</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>PHONE</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>GSTIN</th>
                <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>ADDRESS</th>
                <th className="px-4 py-3 text-secondary fw-800 small text-end" style={{ letterSpacing: '0.05em' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-5 text-muted fw-700">NO COMPANIES LOGGED</td></tr>
              ) : (
                currentRecords.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td data-label="NAME" className="px-4 py-4 fw-800 text-primary">{c.name}</td>
                    <td data-label="PRIMARY CONTACT" className="fw-600 text-dark" style={{ fontSize: '14px' }}>{c.contactPerson}</td>
                    <td data-label="PHONE">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-telephone text-muted opacity-50" style={{ fontSize: '14px' }}></i>
                        <span className="fw-700 text-dark" style={{ fontSize: '13px' }}>{c.phone}</span>
                      </div>
                    </td>
                    <td data-label="GSTIN">
                      <span className="badge bg-light text-dark fw-800 px-3 py-1 border" style={{ fontSize: '11px', borderRadius: '6px' }}>
                        {c.gst || 'N/A'}
                      </span>
                    </td>
                    <td data-label="ADDRESS" className="full-width-mobile">
                      <div className="text-muted fw-500 text-truncate" style={{ maxWidth: '200px', fontSize: '12px' }}>
                        {c.address}
                      </div>
                    </td>
                    <td data-label="ACTIONS" className="px-4 text-lg-end">
                      <div className="d-flex gap-2 justify-content-lg-end">
                        <button className="btn btn-sm btn-light border p-2 rounded-lg text-secondary shadow-sm" onClick={() => handleOpenModal(c)}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn btn-sm btn-light border p-2 rounded-lg text-danger shadow-sm" onClick={() => handleDelete(c.id)} style={{ background: '#fee2e2' }}>
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
                SHOWING <span className="text-dark fw-800">{indexOfFirstRecord + 1}</span> TO <span className="text-dark fw-800">{Math.min(indexOfLastRecord, totalRecords)}</span> OF <span className="text-primary fw-900">{totalRecords}</span> ENTITIES
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
          <div className="modal-dialog m-0 m-md-auto" style={{ maxWidth: '600px' }}>
            <form onSubmit={handleSubmit} className="modal-content shadow-2xl border-0">
              <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                <h4 className="modal-title fw-800 text-dark" style={{ letterSpacing: '-0.5px' }}>Register New Company</h4>
                <button type="button" className="btn border-0 p-0 shadow-none" onClick={() => setShowModal(false)}>
                   <i className="bi bi-x-lg fs-5 opacity-40 hover-opacity-100 transition-all"></i>
                </button>
              </div>
              
              <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-12">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>COMPANY LEGAL NAME</label>
                      <input type="text" className="form-control rounded-lg shadow-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Acme Corporation" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>PRIMARY CONTACT</label>
                      <input type="text" className="form-control rounded-lg shadow-none" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} placeholder="Full Name" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>PHONE NUMBER</label>
                      <input type="text" className="form-control rounded-lg shadow-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 00000 00000" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>GST IDENTIFICATION (GSTIN)</label>
                      <input type="text" className="form-control rounded-lg shadow-none" value={formData.gst} onChange={e => setFormData({...formData, gst: e.target.value})} placeholder="Optional" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>ADDRESS</label>
                      <textarea className="form-control rounded-lg shadow-none" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Complete Business Address" required></textarea>
                    </div>
                  </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-outline-light text-secondary border px-4 py-2 fw-800" onClick={() => setShowModal(false)} style={{ borderRadius: '10px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4 py-2 fw-800 shadow-sm border-0" style={{ borderRadius: '10px', background: '#4f46e5' }}>Register Entity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyManagement;
