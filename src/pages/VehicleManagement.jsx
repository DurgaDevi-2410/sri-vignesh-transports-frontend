import React, { useState, useEffect } from 'react';
import { getVehicles, saveVehicle, deleteVehicle } from '../utils/storage';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    id: '', vehicleNumber: '', ownerName: '', phone: '', driverName: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setVehicles(await getVehicles());
  };

  const handleOpenModal = (v = null) => {
    if (v) {
      setFormData(v);
    } else {
      setFormData({ id: '', vehicleNumber: '', ownerName: '', phone: '', driverName: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveVehicle(formData);
    loadVehicles();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this vehicle?')) {
      await deleteVehicle(id);
      loadVehicles();
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalRecords = filteredVehicles.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredVehicles.slice(indexOfFirstRecord, indexOfLastRecord);

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
            <h2 className="fw-800 mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>Vehicle Management</h2>
            <p className="text-secondary fw-500 mb-0">Control and monitor your transport assets</p>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-3 align-items-stretch align-items-sm-center">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white" style={{ minWidth: '240px', height: '48px' }}>
              <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-search text-primary"></i></span>
              <input 
                type="text" 
                className="form-control border-0 bg-white shadow-none" 
                placeholder="Search assets..." 
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
              <span style={{ fontSize: '14px' }}>Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
          <div className="card-header bg-white border-bottom p-4 px-3 px-md-5 d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                  <div className="text-primary bg-primary bg-opacity-10 p-2 rounded-xl d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <i className="bi bi-truck"></i>
                  </div>
                  <h5 className="fw-800 mb-0" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Fleet Inventory</h5>
              </div>
              <div className="bg-white border border-primary-subtle rounded-pill px-3 py-1 fw-800 shadow-sm" style={{ fontSize: '12px', color: '#4f46e5' }}>
                  {filteredVehicles.length} Units Active
              </div>
          </div>

          <div className="table-responsive">
            <table className="table table-mobile-cards align-middle mb-0">
              <thead className="bg-light">
                <tr style={{ height: '50px' }}>
                  <th className="px-4 py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>VEHICLE NUMBER</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>OWNER IDENTITY</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>CONTACT</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>DRIVER</th>
                  <th className="px-4 py-3 text-secondary fw-800 small text-end" style={{ letterSpacing: '0.05em' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted fw-700">NO FLEET ASSETS DETECTED</td></tr>
                ) : (
                  currentRecords.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td data-label="VEHICLE NUMBER" className="px-4 py-4">
                        <span className="fw-800 text-dark" style={{ fontSize: '13px' }}>
                          {v.vehicleNumber}
                        </span>
                      </td>
                      <td data-label="OWNER IDENTITY" className="fw-700 text-dark" style={{ fontSize: '14px' }}>{v.ownerName}</td>
                      <td data-label="CONTACT">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-telephone text-muted opacity-50" style={{ fontSize: '14px' }}></i>
                          <span className="fw-700 text-dark" style={{ fontSize: '13px' }}>{v.phone}</span>
                        </div>
                      </td>
                      <td data-label="DRIVER">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                            <i className="bi bi-person-fill" style={{ fontSize: '12px' }}></i>
                          </div>
                          <span className="fw-600 text-dark" style={{ fontSize: '13px' }}>{v.driverName || 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="ACTIONS" className="px-4 text-lg-end">
                        <div className="d-flex gap-2 justify-content-lg-end">
                          <button className="btn btn-sm btn-light border p-2 rounded-lg text-secondary shadow-sm" onClick={() => handleOpenModal(v)}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-sm btn-light border p-2 rounded-lg text-danger shadow-sm" onClick={() => handleDelete(v.id)} style={{ background: '#fee2e2' }}>
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
                  SHOWING <span className="text-dark fw-800">{indexOfFirstRecord + 1}</span> TO <span className="text-dark fw-800">{Math.min(indexOfLastRecord, totalRecords)}</span> OF <span className="text-primary fw-900">{totalRecords}</span> UNITS
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
        <div className="modal d-flex align-items-end align-items-md-center justify-content-center" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3000 }}> 
          <div className="modal-dialog border-0 animate-in w-100 m-0 m-md-3" style={{ maxWidth: '500px' }}>
            <div className="modal-content shadow-2xl border-0 overflow-hidden" style={{ borderRadius: '24px 24px 0 0', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', borderRadius: '32px', background: '#ffffff', maxHeight: '90vh' }}>
              <div className="modal-header border-0 p-4 p-md-5 pb-0 d-flex justify-content-between align-items-center">
                <h3 className="modal-title fw-900 text-dark" style={{ letterSpacing: '-1px', fontSize: 'clamp(1.4rem, 4vw, 1.8rem)' }}>Fleet Asset</h3>
                <button type="button" className="btn border-0 p-0" onClick={() => setShowModal(false)}>
                   <i className="bi bi-x-lg fs-4 opacity-30 hover-opacity-100 transition-all"></i>
                </button>
              </div>
              <div className="modal-body p-4 p-md-5 pt-4 overflow-auto no-scrollbar">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 g-md-4 mb-4">
                    <div className="col-12">
                      <label className="form-label fw-800 small text-secondary opacity-60 mb-2" style={{ fontSize: '11px' }}>VEHICLE NUMBER</label>
                      <input type="text" className="form-control border-light bg-light bg-opacity-50 py-3 px-4 fw-700 shadow-none" style={{ borderRadius: '14px', fontSize: '1rem' }} value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})} placeholder="e.g. TN 10 AB 1234" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-800 small text-secondary opacity-60 mb-2" style={{ fontSize: '11px' }}>OWNER FULL NAME</label>
                      <input type="text" className="form-control border-light bg-light bg-opacity-50 py-3 px-4 fw-700 shadow-none" style={{ borderRadius: '14px', fontSize: '1rem' }} value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-60 mb-2" style={{ fontSize: '11px' }}>OWNER CONTACT</label>
                      <input type="text" className="form-control border-light bg-light bg-opacity-50 py-3 px-4 fw-700 shadow-none" style={{ borderRadius: '14px', fontSize: '1rem' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-60 mb-2" style={{ fontSize: '11px' }}>DESIGNATED DRIVER</label>
                      <input type="text" className="form-control border-light bg-light bg-opacity-50 py-3 px-4 fw-700 shadow-none" style={{ borderRadius: '14px', fontSize: '1rem' }} value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} placeholder="Driver name..." />
                    </div>
                  </div>
                  <div className="d-flex flex-column flex-sm-row justify-content-end mt-4 gap-3">
                    <button type="button" className="btn btn-light px-5 py-3 fw-800" onClick={() => setShowModal(false)} style={{ borderRadius: '14px', background: '#f1f5f9', color: '#64748b' }}>Discard</button>
                    <button type="submit" className="btn btn-primary px-5 py-3 fw-800 shadow-sm border-0" style={{ borderRadius: '14px', background: '#4f46e5' }}>Commit Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleManagement;
