import React, { useState, useEffect } from 'react';
import { getExpenses, saveExpense, deleteExpense, getVehicles } from '../utils/storage';
import { format, parseISO } from 'date-fns';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '', date: new Date().toISOString().split('T')[0], 
    category: 'Petrol', otherCategory: '', amount: '', vehicleNumber: '', description: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const categories = ['Petrol', 'Diesel', 'DA (Daily Allowance)', 'Toll & Parking', 'Maintenance', 'Service', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setExpenses(await getExpenses());
      setVehicles(await getVehicles());
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (e = null) => {
    if (e) {
      setFormData(e);
    } else {
      setFormData({ 
        id: '', date: new Date().toISOString().split('T')[0], 
        category: 'Petrol', otherCategory: '', amount: '', 
        vehicleNumber: vehicles.length > 0 ? vehicles[0].vehicleNumber : '', 
        description: '' 
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (formData.category === 'Other' && formData.otherCategory) {
      dataToSave.category = formData.otherCategory;
    }
    await saveExpense(dataToSave);
    loadData();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
      loadData();
    }
  };

  let filteredExpenses = expenses;
  if(searchDate) {
    filteredExpenses = filteredExpenses.filter(e => e.date === searchDate);
  }
  if(filterCategory !== 'All') {
    filteredExpenses = filteredExpenses.filter(e => e.category === filterCategory);
  }
  filteredExpenses = filteredExpenses.sort((a,b) => new Date(b.date) - new Date(a.date));

  // Pagination Logic
  const totalRecords = filteredExpenses.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredExpenses.slice(indexOfFirstRecord, indexOfLastRecord);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchDate, filterCategory]);

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const filterCategories = ['All', ...new Set(expenses.map(e => e.category))];

  return (
    <>
      <div className="animate-in pb-5">
        {/* Premium Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
          <div>
            <h2 className="fw-800 mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>Expense Ledger</h2>
            <p className="text-secondary fw-500 mb-0">Record and monitor all operational expenditures</p>
          </div>
          
          <div className="d-flex flex-column flex-sm-row gap-3 align-items-stretch align-items-sm-center">
            <div className="d-none d-lg-flex flex-column text-end border-end pe-4 me-2">
              <span className="text-secondary fw-700 small" style={{ letterSpacing: '0.5px', fontSize: '10px' }}>PERIOD EXPENDITURE</span>
              <span className="fw-800 fs-4 text-danger">₹{totalExpense.toLocaleString()}</span>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-3">
              <select 
                className="form-select shadow-sm rounded-pill border bg-white px-4 shadow-none" 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                style={{ minWidth: '180px', height: '48px', fontSize: '0.85rem', fontWeight: '600' }}
              >
                {filterCategories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Ledger Items' : c}</option>)}
              </select>
              <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white" style={{ minWidth: '160px', height: '48px' }}>
                <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-calendar3 text-primary"></i></span>
                <input 
                  type="date" 
                  className="form-control border-0 bg-white shadow-none ps-1 pe-3" 
                  value={searchDate} 
                  onChange={e => setSearchDate(e.target.value)}
                  style={{ fontSize: '0.85rem', minWidth: '130px' }}
                />
              </div>
              <button 
                className="btn d-flex align-items-center justify-content-center gap-2 px-4 border-0 shadow-lg text-white" 
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
                <span style={{ fontSize: '14px' }}>Add Log</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
          <div className="card-header bg-white border-bottom p-4 px-3 px-md-5 d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                  <div className="text-danger bg-danger bg-opacity-10 p-2 rounded-xl d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <i className="bi bi-receipt-cutoff"></i>
                  </div>
                  <h5 className="fw-800 mb-0" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Operational Costs</h5>
              </div>
              <div className="bg-white border border-danger-subtle rounded-pill px-3 py-1 fw-800 shadow-sm" style={{ fontSize: '12px', color: '#dc3545' }}>
                  ₹{totalExpense.toLocaleString()} Total Outflow
              </div>
          </div>

          <div className="table-responsive">
            <table className="table table-mobile-cards align-middle mb-0">
              <thead className="bg-light">
                <tr style={{ height: '50px' }}>
                  <th className="px-4 py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>DATE</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>FLEET UNIT</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>CATEGORY</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>DESCRIPTION</th>
                  <th className="py-3 text-secondary fw-800 small" style={{ letterSpacing: '0.05em' }}>AMOUNT</th>
                  <th className="px-4 py-3 text-secondary fw-800 small text-end" style={{ letterSpacing: '0.05em' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-danger border-2" style={{ width: '20px', height: '20px' }}></div></td></tr>
                ) : currentRecords.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted fw-700">NO EXPENDITURE LOGGED</td></tr>
                ) : (
                  currentRecords.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td data-label="DATE" className="px-4 py-4">
                        <div className="fw-700 text-dark" style={{ fontSize: '13px' }}>{e.date ? format(parseISO(e.date), 'dd MMM yyyy') : 'N/A'}</div>
                      </td>
                      <td data-label="FLEET UNIT">
                        <span className="fw-800 text-primary" style={{ fontSize: '12px' }}>
                          {e.vehicleNumber}
                        </span>
                      </td>
                      <td data-label="CATEGORY">
                        <span className={`px-3 py-1 rounded-pill fw-800 ${
                          e.category.includes('Petrol') || e.category.includes('Diesel') ? 'bg-primary-subtle text-primary' : 
                          e.category.includes('DA') ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'
                        }`} style={{ fontSize: '11px' }}>
                          {e.category.toUpperCase()}
                        </span>
                      </td>
                      <td data-label="DESCRIPTION" className="full-width-mobile">
                        <div className="text-muted fw-600 truncate-text" style={{ maxWidth: '250px', fontSize: '12px' }}>
                          {e.description || 'General maintenance record'}
                        </div>
                      </td>
                      <td data-label="AMOUNT">
                        <span className="fw-800 text-danger" style={{ fontSize: '14px' }}>₹{parseFloat(e.amount).toLocaleString()}</span>
                      </td>
                      <td data-label="ACTIONS" className="px-4 text-lg-end">
                        <div className="d-flex gap-2 justify-content-lg-end">
                          <button className="btn btn-sm btn-light border p-2 rounded-lg text-secondary shadow-sm" onClick={() => handleOpenModal(e)}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-sm btn-light border p-2 rounded-lg text-danger shadow-sm" onClick={() => handleDelete(e.id)} style={{ background: '#fee2e2' }}>
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
                  SHOWING <span className="text-dark fw-800">{indexOfFirstRecord + 1}</span> TO <span className="text-dark fw-800">{Math.min(indexOfLastRecord, totalRecords)}</span> OF <span className="text-primary fw-900">{totalRecords}</span> VOUCHERS
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
                <h4 className="modal-title fw-800 text-dark" style={{ letterSpacing: '-0.5px' }}>Expenditure Log</h4>
                <button type="button" className="btn border-0 p-0 shadow-none" onClick={() => setShowModal(false)}>
                   <i className="bi bi-x-lg fs-5 opacity-40 hover-opacity-100 transition-all"></i>
                </button>
              </div>
              
              <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>VOUCHER DATE</label>
                      <input type="date" className="form-control rounded-lg shadow-none fw-700" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>FLEET UNIT</label>
                      <select className="form-select rounded-lg shadow-none fw-700" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} required>
                        <option value="">Select Asset...</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.vehicleNumber}>{v.vehicleNumber}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>LEDGER CATEGORY</label>
                      <select className="form-select rounded-lg shadow-none fw-700" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {['Petrol', 'Diesel', 'DA (Daily Allowance)', 'Toll & Parking', 'Maintenance', 'Service', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {formData.category === 'Other' && (
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>SPECIFY CATEGORY</label>
                        <input type="text" className="form-control rounded-lg shadow-none" value={formData.otherCategory} onChange={e => setFormData({...formData, otherCategory: e.target.value})} placeholder="e.g. Fine, Repair" required />
                      </div>
                    )}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>VALUATION (₹)</label>
                      <input type="number" className="form-control rounded-lg shadow-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-800 small text-secondary opacity-80 mb-2" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>NOTES</label>
                      <textarea className="form-control rounded-lg shadow-none" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. 20 Liters Petrol, Driver DA for 2 days"></textarea>
                    </div>
                  </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-outline-light text-secondary border px-4 py-2 fw-800" onClick={() => setShowModal(false)} style={{ borderRadius: '10px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4 py-2 fw-800 shadow-sm border-0" style={{ borderRadius: '10px', background: '#4f46e5' }}>Log Expenditure</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseManagement;
