import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuGroups = [
    {
      title: 'MAIN',
      items: [
        { path: '/dashboard', name: 'Dashboard', icon: 'bi-grid-fill' },
        { path: '/local-booking', name: 'Local Booking', icon: 'bi-car-front-fill' },
        { path: '/company-booking', name: 'Company Booking', icon: 'bi-building-fill' },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { path: '/companies', name: 'Companies', icon: 'bi-journal-bookmark-fill' },
        { path: '/vehicles', name: 'Vehicles', icon: 'bi-truck' },
        { path: '/expenses', name: 'Expenses', icon: 'bi-cash-stack' },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { path: '/payments', name: 'Payments', icon: 'bi-credit-card-fill' },
        { path: '/reports', name: 'Reports', icon: 'bi-bar-chart-line-fill' },
      ]
    }
  ];

  const getCurrentDate = () => {
    const d = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('en-GB', options).toUpperCase();
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: 'var(--bg-app)', overflowX: 'hidden' }}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay d-lg-none" 
          onClick={() => setIsSidebarOpen(false)} 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar flex-column no-scrollbar ${isSidebarOpen ? 'mobile-active' : ''}`} 
        style={{ width: '280px', position: 'fixed', top: 0, bottom: 0, zIndex: 1100 }}
      >
        <div className="sidebar-header px-4 py-4 d-flex align-items-center justify-content-between">
           <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-lg d-flex align-items-center justify-content-center bg-white bg-opacity-10" style={{ width: '42px', height: '42px', borderRadius: '12px' }}>
                <a href="/dashboard"> <img src="/logo sri vignesh transports.png" alt="SVT" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} /></a>
              </div>
              <div>
                 <h5 className="fw-800 mb-0" style={{ letterSpacing: '-0.3px', color: 'white', fontSize: '1.2rem' }}>Sri Vignesh</h5>
                 <p className="text-secondary fw-700 mb-0 opacity-50" style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Transports</p>
              </div>
           </div>
           <button className="btn d-lg-none text-white p-0 border-0" onClick={() => setIsSidebarOpen(false)}>
              <i className="bi bi-x-lg fs-4 opacity-50 hover-opacity-100"></i>
           </button>
        </div>

        <div className="flex-grow-1 overflow-auto no-scrollbar pb-4 pt-2">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-4">
              <div className="px-4 mb-2 text-secondary fw-800 opacity-40" style={{ fontSize: '10px', letterSpacing: '0.12em' }}>
                 {group.title}
              </div>
              <div className="nav flex-column px-2">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      isActive ? 'nav-link active mx-2 py-3 px-4 rounded-xl mb-1' : 'nav-link mx-2 py-3 px-4 rounded-xl mb-1'
                    }
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ fontSize: '14px', transition: 'all 0.2s ease', position: 'relative' }}
                  >
                    <i className={`bi ${item.icon} me-3`}></i> <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pb-4 mt-auto">
            <div className="p-3 rounded-xl d-flex align-items-center justify-content-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="d-flex align-items-center gap-2">
                 <div className="bg-white bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', borderRadius: '10px' }}>
                    <i className="bi bi-person text-white opacity-90 fs-5"></i>
                 </div>
                 <div className="ms-2">
                    <h6 className="mb-0 fw-700 text-white" style={{ fontSize: '13px', lineHeight: '1.2' }}>Admin Panel</h6>
                    <small className="fw-700 opacity-40 d-block" style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '0.8px', marginTop: '2px' }}>SVT MANAGER</small>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main 
        className="flex-grow-1 d-flex flex-column main-content" 
        style={{ 
          minHeight: '100vh',
          transition: 'all 0.4s ease'
        }}
      >
        <header className="px-3 px-md-5 py-3 py-md-4 d-flex justify-content-between align-items-center" style={{ zIndex: 900, background: 'transparent' }}>
          <button className="btn d-lg-none p-0 border-0 shadow-none" onClick={() => setIsSidebarOpen(true)}>
             <i className="bi bi-list fs-1 text-primary"></i>
          </button>

          {/* Desktop Only Header Info */}
          <div className="d-none d-lg-flex align-items-center gap-4 ms-auto">
             <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-xl border border-white shadow-sm">
                <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}></div>
                <span className="text-secondary fw-800" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>SYSTEMS LIVE</span>
             </div>
             
             <button className="btn d-flex align-items-center gap-2 px-3 py-2 border shadow-sm" style={{ background: '#ffffff', borderRadius: '12px', color: '#5c67f2', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' }}>
                <i className="bi bi-calendar3 fs-6"></i>
                <span className="fw-800" style={{ fontSize: '11px' }}>{getCurrentDate()}</span>
                <i className="bi bi-chevron-down opacity-50 small ms-1"></i>
             </button>
          </div>

          {/* Mobile Only Header Info */}
          <div className="d-lg-none d-flex align-items-center gap-2">
             <div className="text-end">
                <small className="text-secondary fw-800 d-block" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>{getCurrentDate()}</small>
                <span className="badge bg-success-subtle text-success fw-900" style={{ fontSize: '9px' }}>LIVE</span>
             </div>
          </div>
        </header>

        <div className="p-3 p-md-4 p-xl-5 pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
