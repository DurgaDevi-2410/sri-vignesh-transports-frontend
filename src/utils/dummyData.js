export const injectDummyData = () => {
  if (!localStorage.getItem('companies') || JSON.parse(localStorage.getItem('companies')).length === 0) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const formatDate = (date) => date.toISOString().split('T')[0];

    const companies = [
      { id: 'c1', name: 'Acme Logistics', contactPerson: 'John Doe', phone: '9876543210', address: '123 Main St, Tech Park', gst: '29ABCDE1234F1Z5' },
      { id: 'c2', name: 'Global Movers', contactPerson: 'Jane Smith', phone: '9876543211', address: '456 West Ave, Industrial Area', gst: '29FGHIJ5678K1Z2' },
      { id: 'c3', name: 'Swift Delivery Pvt Ltd', contactPerson: 'Rajesh Kumar', phone: '9876543212', address: '789 South Blvd, Business Center', gst: '29KLMNO9012P1Z3' }
    ];

    const vehicles = [
      { id: 'v1', vehicleNumber: 'TN 10 AB 1234', ownerName: 'Murugan', phone: '9443311220', driverName: 'Senthil' },
      { id: 'v2', vehicleNumber: 'TN 22 CD 5678', ownerName: 'Sri Transports', phone: '9443311221', driverName: 'Ramesh' },
      { id: 'v3', vehicleNumber: 'TN 09 EF 9012', ownerName: 'Sri Transports', phone: '9443311221', driverName: 'Suresh' },
      { id: 'v4', vehicleNumber: 'TN 45 GH 3456', ownerName: 'Vignesh Logistics', phone: '9443311224', driverName: 'Prakash' },
      { id: 'v5', vehicleNumber: 'TN 55 IJ 7890', ownerName: 'Vignesh Logistics', phone: '9443311224', driverName: 'Kumar' }
    ];

    const localBookings = [
      { id: 'l1', customerName: 'Amit Sharma', phone: '9000000001', pickup: 'City Center', drop: 'Airport', vehicleNumber: 'TN 10 AB 1234', date: formatDate(today), fare: '1500', paymentStatus: 'Paid' },
      { id: 'l2', customerName: 'Rahul Verma', phone: '9000000002', pickup: 'Railway Station', drop: 'Tech Park', vehicleNumber: 'TN 22 CD 5678', date: formatDate(yesterday), fare: '3000', paymentStatus: 'Unpaid' },
      { id: 'l3', customerName: 'Priya Singh', phone: '9000000003', pickup: 'North Market', drop: 'South Market', vehicleNumber: 'TN 09 EF 9012', date: formatDate(lastWeek), fare: '1200', paymentStatus: 'Partial' },
      { id: 'l4', customerName: 'Sanjay Dutt', phone: '9000000004', pickup: 'East Wing Area', drop: 'West End Mall', vehicleNumber: 'TN 45 GH 3456', date: formatDate(today), fare: '2500', paymentStatus: 'Paid' }
    ];

    const companyBookings = [
      { id: 'cb1', companyId: 'Acme Logistics', customerName: 'John Stores', pickup: 'Warehouse A', drop: 'Retail Store 1', vehicleNumber: 'TN 55 IJ 7890', date: formatDate(today), fare: '8500', paymentStatus: 'Pending' },
      { id: 'cb2', companyId: 'Global Movers', customerName: 'Port Authority', pickup: 'Port', drop: 'Factory', vehicleNumber: 'TN 33 KL 1122', date: formatDate(yesterday), fare: '15000', paymentStatus: 'Full' },
      { id: 'cb3', companyId: 'Swift Delivery Pvt Ltd', customerName: 'Tech Hub', pickup: 'Office', drop: 'Client Location', vehicleNumber: 'TN 77 MN 3344', date: formatDate(lastWeek), fare: '4500', paymentStatus: 'Partial' },
      { id: 'cb4', companyId: 'Acme Logistics', customerName: 'Mega Mart', pickup: 'Warehouse B', drop: 'Retail Store 2', vehicleNumber: 'TN 88 OP 5566', date: formatDate(today), fare: '8000', paymentStatus: 'Full' },
      { id: 'cb5', companyId: 'Global Movers', customerName: 'Steel Corp', pickup: 'Factory 2', drop: 'City Hub', vehicleNumber: 'TN 99 QR 7788', date: formatDate(yesterday), fare: '12000', paymentStatus: 'Pending' }
    ];

    const expenses = [
      { id: 'e1', date: formatDate(today), vehicleNumber: 'TN 10 AB 1234', category: 'Petrol', amount: '2500', description: 'Petrol for Airport trip' },
      { id: 'e2', date: formatDate(today), vehicleNumber: 'TN 10 AB 1234', category: 'DA (Daily Allowance)', amount: '500', description: 'Driver DA' },
      { id: 'e3', date: formatDate(yesterday), vehicleNumber: 'TN 22 CD 5678', category: 'Diesel', amount: '4500', description: 'Full tank diesel' },
      { id: 'e4', date: formatDate(lastWeek), vehicleNumber: 'TN 09 EF 9012', category: 'Maintenance', amount: '1200', description: 'Oil change' }
    ];

    localStorage.setItem('companies', JSON.stringify(companies));
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    localStorage.setItem('localBookings', JSON.stringify(localBookings));
    localStorage.setItem('companyBookings', JSON.stringify(companyBookings));
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }
};
