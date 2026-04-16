import React, { useEffect, useState } from 'react';
import { getLocalBookings, getCompanyBookings, getCompanies, getExpenses } from '../utils/storage';
import { format, parseISO, subDays, isSameDay } from 'date-fns';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        totalCompanies: 0,
        totalExpenses: 0,
        netProfit: 0,
        todayBookings: 0,
        todayPayments: 0
    });

    const [recentBookings, setRecentBookings] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);

    useEffect(() => {
        const loadDashboard = async () => {
            const local = await getLocalBookings();
            const company = await getCompanyBookings();
            const expenses = await getExpenses();
            const allBookings = [...local, ...company].sort((a, b) => new Date(b.date) - new Date(a.date));

            console.log('DEBUG: Local count:', local.length);
            console.log('DEBUG: Company count:', company.length);
            
            const companies = await getCompanies();
            const today = new Date();
            const todayStr = format(today, 'yyyy-MM-dd');
            console.log('DEBUG: Today string:', todayStr);

            let tRevenue = 0;
            let tPending = 0;
            let tTodayBook = 0;
            let tTodayPay = 0;

            allBookings.forEach(b => {
                const fare = parseFloat(b.fare) || 0;
                const status = b.paymentStatus ? b.paymentStatus.toLowerCase() : '';
                
                // Use robust date-fns comparison
                const bDate = b.date ? parseISO(b.date) : null;
                const isToday = bDate ? isSameDay(bDate, today) : false;

                if (isToday) {
                    console.log('DEBUG: Match found for Today:', b.date, 'vs', todayStr);
                    tTodayBook++;
                    if (status === 'paid' || status === 'full') tTodayPay += fare;
                }

                if (status === 'paid' || status === 'full') {
                    tRevenue += fare;
                } else if (status === 'partial') {
                    tRevenue += fare / 2;
                    tPending += fare / 2;
                } else {
                    tPending += fare;
                }
            });

            const totalExp = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

            setStats({
                totalBookings: allBookings.length,
                totalRevenue: tRevenue,
                pendingPayments: tPending,
                totalCompanies: companies.length,
                totalExpenses: totalExp,
                netProfit: tRevenue - totalExp,
                todayBookings: tTodayBook,
                todayPayments: tTodayPay
            });

            console.log('DEBUG: Final TodayBookings:', tTodayBook);
            setRecentBookings(allBookings.slice(0, 5));

            // Calculate Performance Data (Last 6 Days)
            const perf = [];
            for (let i = 5; i >= 0; i--) {
                const day = subDays(today, i);
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayIncome = allBookings
                    .filter(b => b.date && isSameDay(parseISO(b.date), day) && (b.paymentStatus?.toLowerCase() === 'paid' || b.paymentStatus?.toLowerCase() === 'full' || b.paymentStatus?.toLowerCase() === 'partial'))
                    .reduce((sum, b) => {
                        const fare = parseFloat(b.fare) || 0;
                        return sum + (b.paymentStatus?.toLowerCase() === 'partial' ? fare / 2 : fare);
                    }, 0);
                
                perf.push({
                    day: format(day, 'MMM dd'),
                    income: dayIncome
                });
            }
            setPerformanceData(perf);
        };

        loadDashboard();
    }, []);

    const StatCard = ({ icon, label, value, subtext, trend, iconBg, trendColor, trendText }) => (
        <div className="col">
            <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: iconBg, borderRadius: '12px' }}>
                        <i className={`bi ${icon} text-white fs-5`}></i>
                    </div>
                </div>
                <h6 className="text-secondary fw-800 mb-1" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</h6>
                <h3 className="fw-900 mb-1" style={{ letterSpacing: '-1px' }}>{value}</h3>
                <p className="text-muted small mb-0 fw-600 opacity-50">{subtext}</p>
            </div>
        </div>
    );

    const maxIncome = Math.max(...performanceData.map(d => d.income), 1);

    return (
        <div className="animate-in pb-5">
            <div className="mb-5">
                <h1 className="fw-900 mb-1" style={{ color: '#111827', letterSpacing: '-2px', fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}>Sri Vignesh Transports</h1>
                {/* <p className="text-secondary fw-700 mb-0 opacity-40" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>Real-time operational overview of Sri Vignesh Transports</p> */}
            </div>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-5">
                <StatCard 
                    icon="bi-car-front" 
                    label="Today Dispatches" 
                    value={stats.todayBookings} 
                    subtext="Matched fleet units"
                    iconBg="#60a5fa"
                />
                <StatCard 
                    icon="bi-currency-rupee" 
                    label="Revenue" 
                    value={`₹${stats.totalRevenue.toLocaleString()}`} 
                    subtext="Aggregated settlement"
                    iconBg="#10b981"
                />
                <StatCard 
                    icon="bi-credit-card" 
                    label="Outstanding" 
                    value={`₹${stats.pendingPayments.toLocaleString()}`} 
                    subtext="Pending reconciliation"
                    iconBg="#f87171"
                />
                <StatCard 
                    icon="bi-cpu" 
                    label="Asset Yield" 
                    value={`${((stats.netProfit / (stats.totalRevenue || 1)) * 100).toFixed(1)}%`} 
                    subtext="Operational efficiency"
                    iconBg="#818cf8"
                />
            </div>

            <div className="row g-4">
                {/* Performance Chart */}
                <div className="col-12 col-xl-4">
                    <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-900 mb-0">Financial Pulse</h6>
                            <i className="bi bi-graph-up-arrow text-primary"></i>
                        </div>
                        
                        <div style={{ height: '240px' }} className="d-flex align-items-end justify-content-between pb-3 mt-4 px-2">
                            {performanceData.map((d, i) => {
                                const height = (d.income / maxIncome) * 180 + 20;
                                return (
                                    <div key={i} className="text-center">
                                        <div style={{ 
                                            height: `${height}px`, 
                                            width: 'clamp(15px, 3vw, 24px)', 
                                            backgroundColor: '#4f46e5', 
                                            borderRadius: '8px',
                                            transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                            background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)'
                                        }}></div>
                                        <small className="text-secondary mt-3 d-block fw-800" style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.5 }}>{d.day}</small>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-auto pt-4 border-top">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                <span className="small fw-800 text-secondary opacity-50" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>DAILY REVENUE TRAJECTORY</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Updates */}
                <div className="col-12 col-xl-8">
                    <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
                        <div className="p-4 px-md-5 d-flex justify-content-between align-items-center bg-white border-bottom">
                            <div>
                                <h6 className="fw-900 mb-0">Live Update Feed</h6>
                                <small className="text-secondary fw-700 opacity-50">Recent operational milestones</small>
                            </div>
                            <div className="bg-light rounded-pill px-3 py-1 fw-800 text-primary" style={{ fontSize: '10px' }}>
                                TOP 5 ENTRIES
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-mobile-cards mb-0 align-middle">
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc' }}>
                                        <th className="px-5 py-3 text-secondary fw-800 small">ENTITY DETAILS</th>
                                        <th className="py-3 text-secondary fw-800 small">LOGISTICS ROUTE</th>
                                        <th className="py-3 text-secondary fw-800 small">ASSET TAG</th>
                                        <th className="px-5 py-3 text-secondary fw-800 small text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted fw-700">SYSTEM IDLE - NO RECENT DATA</td></tr>
                                    ) : (
                                        recentBookings.map((b, idx) => (
                                            <tr key={idx}>
                                                <td data-label="ENTITY DETAILS" className="px-md-5 py-4">
                                                   <div className="d-flex align-items-center gap-3">
                                                       <div className="bg-primary bg-opacity-10 text-primary rounded-xl d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                                                           <i className="bi bi-person-fill fs-5"></i>
                                                       </div>
                                                       <div>
                                                           <div className="fw-900 text-dark" style={{ fontSize: '14px' }}>{b.customerName || b.companyId}</div>
                                                           <small className="text-secondary fw-800 opacity-50" style={{ fontSize: '10px' }}>{b.date ? format(parseISO(b.date), 'dd MMM yyyy') : 'N/A'}</small>
                                                       </div>
                                                   </div>
                                                </td>
                                                <td data-label="LOGISTICS ROUTE" className="full-width-mobile">
                                                    <div className="d-flex align-items-center gap-2 fw-800 text-secondary" style={{ fontSize: '11px', flexWrap: 'wrap' }}>
                                                        <span className="text-dark bg-light px-2 py-1 rounded">{b.pickup}</span>
                                                        <i className="bi bi-shuffle opacity-30 text-primary"></i>
                                                        <span className="text-dark bg-light px-2 py-1 rounded">{b.drop}</span>
                                                    </div>
                                                </td>
                                                <td data-label="ASSET TAG">
                                                   <span className="fw-900 text-primary" style={{ fontSize: '12px' }}>{b.vehicleNumber}</span>
                                                </td>
                                                <td data-label="STATUS" className="px-md-5 text-lg-center">
                                                    <span className={`px-3 py-1 rounded-pill fw-900 d-inline-flex align-items-center gap-2 ${
                                                        b.paymentStatus === 'Paid' || b.paymentStatus === 'Full' 
                                                        ? 'bg-success-subtle text-success' 
                                                        : (b.paymentStatus === 'Partial' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning')
                                                    }`} style={{ fontSize: '10px' }}>
                                                        <div style={{ width: '6px', height: '6px', backgroundColor: 'currentColor', borderRadius: '50%' }}></div>
                                                        {b.paymentStatus || 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
