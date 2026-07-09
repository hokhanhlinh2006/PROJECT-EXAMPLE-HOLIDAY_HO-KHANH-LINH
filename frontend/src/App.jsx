import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configure Axios base URL
const API_BASE = 'http://localhost:8080/api';

// Rich Mock Data for local fallback when Backend is offline
const MOCK_HOMESTAYS = [
  {
    id: 1,
    name: "Sunset Holiday Villas",
    address: "123 Bãi Cháy, Hạ Long, Quảng Ninh",
    description: "Biệt thự nghỉ dưỡng view trực diện biển Hạ Long. Đầy đủ tiện ích hồ bơi vô cực, BBQ ngoài trời và phòng karaoke riêng.",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600"
  },
  {
    id: 2,
    name: "Pine Hill Cabin Da Lat",
    address: "45 Khởi Nghĩa Bắc Sơn, Đà Lạt",
    description: "Căn bungalow gỗ nhỏ xinh ẩn mình giữa đồi thông xanh ngát, đem lại cảm giác yên bình, thơ mộng tuyệt vời cho kỳ nghỉ của bạn.",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600"
  },
  {
    id: 3,
    name: "An Bang Beach Boutique Homestay",
    address: "An Bàng, Hội An, Quảng Nam",
    description: "Vị trí đắc địa cách bãi biển An Bàng chỉ 2 phút đi bộ. Sân vườn xanh mát thích hợp đọc sách thư giãn nghỉ dưỡng holiday.",
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=600"
  }
];

const MOCK_ROOMS = {
  1: [
    { id: 101, roomNumber: "101", type: "Double", price: 1200000.0, status: "AVAILABLE", isAvailable: true },
    { id: 102, roomNumber: "102", type: "Double", price: 1200000.0, status: "AVAILABLE", isAvailable: true },
    { id: 103, roomNumber: "201", type: "Family", price: 2200000.0, status: "AVAILABLE", isAvailable: true }
  ],
  2: [
    { id: 201, roomNumber: "Bung-A", type: "Single", price: 750000.0, status: "AVAILABLE", isAvailable: true },
    { id: 202, roomNumber: "Bung-B", type: "Double", price: 1100000.0, status: "AVAILABLE", isAvailable: true }
  ],
  3: [
    { id: 301, roomNumber: "Room-1", type: "Double", price: 950000.0, status: "AVAILABLE", isAvailable: true },
    { id: 302, roomNumber: "Room-2", type: "Double", price: 950000.0, status: "AVAILABLE", isAvailable: true },
    { id: 303, roomNumber: "Suite-3", type: "Family", price: 1800000.0, status: "MAINTENANCE", isAvailable: false }
  ]
};

function App() {
  // Navigation: 'HOME', 'ROOMS', 'BOOKINGS', 'ADMIN'
  const [currentTab, setCurrentTab] = useState('HOME');
  const [homestays, setHomestays] = useState(MOCK_HOMESTAYS);
  const [selectedHomestay, setSelectedHomestay] = useState(null);
  const [rooms, setRooms] = useState([]);
  
  // Real or mock status
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  
  // User Session
  const [currentUser, setCurrentUser] = useState({
    id: 2,
    username: 'client',
    role: 'CLIENT', // 'CLIENT', 'ADMIN', 'GUEST'
    token: 'mockToken'
  });
  
  // Client States
  const [myBookings, setMyBookings] = useState([
    {
      id: 501,
      room: { roomNumber: "101", type: "Double", price: 1200000.0, homestay: { name: "Sunset Holiday Villas" } },
      checkInDate: "2026-07-09",
      checkOutDate: "2026-07-12",
      totalPrice: 3600000.0,
      status: "PENDING"
    }
  ]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  // Booking Modal
  const [bookingRoom, setBookingRoom] = useState(null);
  const [checkIn, setCheckIn] = useState("2026-07-09");
  const [checkOut, setCheckOut] = useState("2026-07-12");

  // Admin overall bookings
  const [allBookings, setAllBookings] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalRevenue: 3600000.0,
    totalBookings: 1,
    paidBookings: 0,
    cancelledBookings: 0
  });

  // Check backend health
  useEffect(() => {
    fetchHomestays();
    fetchBookings();
    fetchStats();
  }, [currentUser]);

  const fetchHomestays = async () => {
    try {
      const res = await axios.get(`${API_BASE}/homestays`);
      setHomestays(res.data);
      setIsBackendOnline(true);
    } catch (e) {
      console.warn("Backend offline, using Mock Homestays.");
      setHomestays(MOCK_HOMESTAYS);
      setIsBackendOnline(false);
    }
  };

  const fetchBookings = async () => {
    if (currentUser.role === 'CLIENT') {
      try {
        const res = await axios.get(`${API_BASE}/bookings/user/${currentUser.id}`);
        setMyBookings(res.data);
      } catch (e) {
        // Fallback already initialized in state
      }
    } else if (currentUser.role === 'ADMIN') {
      try {
        const res = await axios.get(`${API_BASE}/bookings`);
        setAllBookings(res.data);
      } catch (e) {
        // use mock bookings compiled from client bookings + default
        setAllBookings(myBookings);
      }
    }
  };

  const fetchStats = async () => {
    if (currentUser.role === 'ADMIN') {
      try {
        const res = await axios.get(`${API_BASE}/admin/stats`);
        setAdminStats(res.data);
      } catch (e) {
        // calculate based on mock state
        const total = myBookings.reduce((sum, b) => b.status === 'PAID' ? sum + b.totalPrice : sum, 0);
        setAdminStats({
          totalRevenue: total || 1200000,
          totalBookings: myBookings.length,
          paidBookings: myBookings.filter(b => b.status === 'PAID').length,
          cancelledBookings: myBookings.filter(b => b.status === 'CANCELLED').length
        });
      }
    }
  };

  const selectHomestay = async (homestay) => {
    setSelectedHomestay(homestay);
    setCurrentTab('ROOMS');
    try {
      const res = await axios.get(`${API_BASE}/homestays/${homestay.id}/rooms`);
      setRooms(res.data);
    } catch (e) {
      // Fallback
      setRooms(MOCK_ROOMS[homestay.id] || []);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (currentUser.role === 'GUEST') {
      alert("Vui lòng đăng nhập để thực hiện đặt phòng!");
      return;
    }

    const payload = {
      userId: currentUser.id,
      roomId: bookingRoom.id,
      checkInDate: checkIn,
      checkOutDate: checkOut
    };

    try {
      const res = await axios.post(`${API_BASE}/bookings`, payload);
      alert("Đã lưu lệnh đặt phòng tạm thời! Hãy nhấn 'Thanh Toán' để hoàn tất đơn hàng.");
      setBookingRoom(null);
      fetchBookings();
      setCurrentTab('BOOKINGS');
    } catch (err) {
      if (err.response && err.response.data) {
        alert("Lỗi đặt phòng: " + err.response.data);
      } else {
        // Mock flow insert
        const days = Math.max(1, (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const price = days * bookingRoom.price;
        const newBooking = {
          id: Date.now(),
          room: { ...bookingRoom, homestay: selectedHomestay },
          checkInDate: checkIn,
          checkOutDate: checkOut,
          totalPrice: price,
          status: "PENDING"
        };
        setMyBookings([...myBookings, newBooking]);
        setBookingRoom(null);
        alert("MOCK: Đặt phòng thành công! (Dữ liệu giả lập lưu trên Client)");
        setCurrentTab('BOOKINGS');
      }
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      await axios.post(`${API_BASE}/bookings/${bookingId}/pay`, {
        paymentMethod: "BANK_TRANSFER",
        transactionId: "TXN" + Date.now()
      });
      alert("Đã xác nhận thanh toán trực tuyến!");
      fetchBookings();
      fetchStats();
    } catch (e) {
      // Mock update
      setMyBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'PAID' } : b));
      alert("MOCK: Thanh toán thành công! Trạng thái đơn đổi thành PAID.");
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này?")) return;
    try {
      await axios.post(`${API_BASE}/bookings/${bookingId}/cancel`);
      alert("Đơn đặt phòng đã được hủy.");
      fetchBookings();
      fetchStats();
    } catch (e) {
      // Mock update
      setMyBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      alert("MOCK: Đã hủy đơn đặt phòng thành công.");
    }
  };

  const handleRoomStatusUpdate = async (roomId, targetStatus) => {
    try {
      await axios.put(`${API_BASE}/admin/rooms/${roomId}/status?status=${targetStatus}`);
      alert("Trạng thái phòng đã được cập nhật.");
      if (selectedHomestay) {
        selectHomestay(selectedHomestay);
      }
    } catch (e) {
      // Mock update
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: targetStatus, isAvailable: targetStatus === 'AVAILABLE' } : r));
      alert(`MOCK: Đã đổi trạng thái phòng thành ${targetStatus}`);
    }
  };

  const filteredHomestays = homestays.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const switchRole = (role) => {
    if (role === 'CLIENT') {
      setCurrentUser({ id: 2, username: 'client', role: 'CLIENT', token: 'mockToken' });
      setCurrentTab('HOME');
    } else if (role === 'ADMIN') {
      setCurrentUser({ id: 1, username: 'admin', role: 'ADMIN', token: 'mockToken' });
      setCurrentTab('ADMIN');
    } else {
      setCurrentUser({ id: 9, username: 'guest', role: 'GUEST', token: '' });
      setCurrentTab('HOME');
    }
  };

  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode-active' : ''}`}>
      {/* Navbar Section */}
      <nav className="navbar">
        <div className="logo-container" onClick={() => setCurrentTab('HOME')}>
          <img src="https://img.icons8.com/color/48/beach.png" alt="beach" style={{width: '32px'}} />
          BookingHomestay <span style={{fontSize:'0.8rem', fontWeight:'normal', color:'var(--text-gray)'}}>Holiday Edition</span>
        </div>

        <div className="nav-links">
          <span className={`nav-link ${currentTab === 'HOME' ? 'active' : ''}`} onClick={() => setCurrentTab('HOME')}>Khu nghỉ Homestay</span>
          {selectedHomestay && (
            <span className={`nav-link ${currentTab === 'ROOMS' ? 'active' : ''}`} onClick={() => setCurrentTab('ROOMS')}>Phòng trống</span>
          )}
          {currentUser.role === 'CLIENT' && (
            <span className={`nav-link ${currentTab === 'BOOKINGS' ? 'active' : ''}`} onClick={() => { setCurrentTab('BOOKINGS'); fetchBookings(); }}>Lịch sử đặt</span>
          )}
          {currentUser.role === 'ADMIN' && (
            <span className={`nav-link ${currentTab === 'ADMIN' ? 'active' : ''}`} onClick={() => { setCurrentTab('ADMIN'); fetchStats(); fetchBookings(); }}>Hệ thống Admin</span>
          )}
          
          <button onClick={toggleDarkMode} className="btn-secondary" style={{padding: '0.4rem 0.8rem', fontSize:'0.9rem'}}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
          <span style={{fontSize:'0.85rem', color:'var(--text-gray)'}}>Đóng vai:</span>
          <select 
            value={currentUser.role} 
            onChange={(e) => switchRole(e.target.value)}
            style={{padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1'}}
          >
            <option value="CLIENT">Khách (client)</option>
            <option value="ADMIN">Quản lý (admin)</option>
            <option value="GUEST">Xem vãng lai</option>
          </select>
          
          <span className="badge badge-paid" style={{fontSize:'0.75rem'}}>
            {isBackendOnline ? '● Spring API Online' : '○ Standalone Mock'}
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      {currentTab === 'HOME' && (
        <div>
          {/* Hero Banner */}
          <header className="hero">
            <h1>Kỳ Nghỉ Lễ Trọn Vẹn Của Bạn</h1>
            <p>Trải nghiệm hơn 1,000+ phòng homestay nghỉ mát chất lượng cao, cảnh quan đẹp, giá tốt đã qua xác minh.</p>
            <div style={{marginTop: '1rem', width: '100%', maxWidth: '500px', display: 'flex', gap: '0.5rem'}}>
              <input 
                type="text" 
                placeholder="Tìm thành phố, bãi biển hay tên homestay..." 
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{flexGrow: 1, borderWidth:'2px'}}
              />
              <button className="btn-primary">Tìm kiếm</button>
            </div>
          </header>

          <main className="container">
            <h2 style={{fontFamily:'Poppins, sans-serif', fontSize:'1.6rem', marginBottom:'1.5rem'}}>Danh sách đề cử đắc địa nhất</h2>
            <div className="grid">
              {filteredHomestays.map(homestay => (
                <div className="card" key={homestay.id}>
                  <div className="card-img-wrapper">
                    <img src={homestay.imageUrl} alt={homestay.name} className="card-img" />
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{homestay.name}</h3>
                    <div className="card-address">
                      📍 {homestay.address}
                    </div>
                    <p className="card-desc">{homestay.description}</p>
                    <div className="card-footer">
                      <span className="rating-badge">★ {homestay.rating}</span>
                      <button className="btn-primary" onClick={() => selectHomestay(homestay)}>Xem Phòng Trống</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {currentTab === 'ROOMS' && selectedHomestay && (
        <main className="container" style={{paddingTop: '2rem'}}>
          <button className="btn-secondary" onClick={() => setCurrentTab('HOME')} style={{marginBottom: '1.5rem'}}>
            ← Quay lại danh mục Homestay
          </button>
          
          <div style={{display:'flex', gap:'2rem', marginBottom:'3rem', alignItems:'center', flexWrap:'wrap'}}>
            <img src={selectedHomestay.imageUrl} alt={selectedHomestay.name} style={{width:'320px', height:'200px', objectFit:'cover', borderRadius:'14px'}} />
            <div style={{flex: 1}}>
              <span className="rating-badge" style={{width:'fit-content', marginBottom:'0.5rem'}}>★ {selectedHomestay.rating}</span>
              <h2 style={{fontSize:'2.2rem', fontFamily:'Poppins'}}>{selectedHomestay.name}</h2>
              <p style={{color:'var(--text-gray)'}}>📍 {selectedHomestay.address}</p>
              <p style={{marginTop:'0.8rem', color:'#475569'}}>{selectedHomestay.description}</p>
            </div>
          </div>

          <h3 style={{fontSize:'1.4rem', marginBottom:'1.5rem'}}>Danh sách phòng nghỉ phòng trống</h3>
          <div className="grid">
            {rooms.map(room => (
              <div className="card" key={room.id} style={{borderLeft: room.status === 'MAINTENANCE' ? '5px solid #ef4444' : 'none'}}>
                <div className="card-body">
                  <div style={{display:'flex', justifyContent:'between', alignItems:'center', width:'100%', marginBottom:'0.5rem'}}>
                    <h4 style={{fontSize:'1.3rem', fontWeight:'600'}}>Phòng {room.roomNumber}</h4>
                    <span className={`badge ${room.status === 'AVAILABLE' ? 'badge-paid' : room.status === 'BOOKED' ? 'badge-pending' : 'badge-cancelled'}`}>
                      {room.status === 'AVAILABLE' ? 'Sẵn sàng' : room.status === 'BOOKED' ? 'Đã cho thuê' : 'Đang dọn dẹp'}
                    </span>
                  </div>
                  <p style={{fontSize:'0.9rem', color:'var(--text-gray)', marginBottom:'0.8rem'}}>Loại giường: {room.type}</p>
                  <p style={{fontSize:'1.4rem', fontWeight:'700', color:'var(--primary)'}}>
                    {room.price.toLocaleString('vi-VN')} đ <span style={{fontSize:'0.85rem', fontWeight:'normal', color:'var(--text-gray)'}}>/ đêm</span>
                  </p>
                  
                  <div style={{marginTop:'1.5rem', display:'flex', gap:'0.5rem'}}>
                    {room.status === 'AVAILABLE' ? (
                      <button className="btn-primary" style={{width:'100%'}} onClick={() => setBookingRoom(room)}>Đặt phòng ngay</button>
                    ) : (
                      <button className="btn-secondary" style={{width:'100%'}} disabled>Không khả dụng</button>
                    )}
                    
                    {currentUser.role === 'ADMIN' && (
                      <select 
                        value={room.status} 
                        onChange={(e) => handleRoomStatusUpdate(room.id, e.target.value)}
                        style={{padding:'0.4rem', borderRadius:'6px'}}
                      >
                        <option value="AVAILABLE">Đặt Trống</option>
                        <option value="BOOKED">Khoá Đặt</option>
                        <option value="MAINTENANCE">Vệ sinh</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {currentTab === 'BOOKINGS' && (
        <main className="container" style={{paddingTop: '2rem'}}>
          <h2 style={{fontFamily:'Poppins', fontSize:'2rem', marginBottom:'1.5rem'}}>Đơn đặt phòng nghỉ mát của bạn</h2>
          
          {myBookings.length === 0 ? (
            <p style={{color:'var(--text-gray)', textAlign:'center', marginTop:'3rem'}}>Bạn chưa có giao dịch đặt phòng nào.</p>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Homestay / Phòng</th>
                    <th>Ngày Check-in</th>
                    <th>Ngày Check-out</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.room.homestay ? b.room.homestay.name : 'Sunset Villa'}</strong><br/>
                        Phòng {b.room.roomNumber} ({b.room.type})
                      </td>
                      <td>{b.checkInDate}</td>
                      <td>{b.checkOutDate}</td>
                      <td style={{fontWeight:'700'}}>{b.totalPrice.toLocaleString('vi-VN')} đ</td>
                      <td>
                        <span className={`badge ${b.status === 'PAID' ? 'badge-paid' : b.status === 'PENDING' ? 'badge-pending' : 'badge-cancelled'}`}>
                          {b.status === 'PAID' ? 'Đã thanh toán' : b.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}
                        </span>
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                          {b.status === 'PENDING' && (
                            <button className="btn-primary" style={{padding:'0.3rem 0.8rem', fontSize:'0.85rem'}} onClick={() => handlePayment(b.id)}>
                              Thanh toán
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && (
                            <button className="btn-secondary" style={{padding:'0.3rem 0.8rem', fontSize:'0.85rem', color:'#ef4444', borderColor:'#f87171'}} onClick={() => handleCancel(b.id)}>
                              Hủy lịch
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      )}

      {currentTab === 'ADMIN' && (
        <main className="container" style={{paddingTop: '2rem'}}>
          <h2 style={{fontFamily:'Poppins', fontSize:'2rem', marginBottom:'1rem'}}>Hệ thống Quản trị dự án - PM & Admin Dashboard</h2>
          <p style={{color:'var(--text-gray)', marginBottom:'2rem'}}>Xem kết quả thống kê doanh thu phòng, cập nhật tình trạng dọn dẹp phòng trống phục vụ Holiday.</p>
          
          <div className="stats-grid">
            <div className="stat-card">
              <span style={{fontSize:'0.9rem', color:'var(--text-gray)'}}>Doanh thu (Paid)</span>
              <span className="stat-val">{adminStats.totalRevenue.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="stat-card">
              <span style={{fontSize:'0.9rem', color:'var(--text-gray)'}}>Tổng số lượt đặt</span>
              <span className="stat-val">{adminStats.totalBookings} lượt</span>
            </div>
            <div className="stat-card">
              <span style={{fontSize:'0.9rem', color:'var(--text-gray)'}}>Số đơn hoàn tất</span>
              <span className="stat-val">{adminStats.paidBookings} đơn</span>
            </div>
            <div className="stat-card">
              <span style={{fontSize:'0.9rem', color:'var(--text-gray)'}}>Lượt huỷ bỏ</span>
              <span className="stat-val">{adminStats.cancelledBookings} lượt</span>
            </div>
          </div>

          <h3 style={{fontSize:'1.4rem', marginBottom:'1rem'}}>Nhật ký đặt phòng hệ thống</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách đặt</th>
                  <th>Homestay / Phòng</th>
                  <th>Nhận / Trả</th>
                  <th>Giá trị đơn</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map(b => (
                  <tr key={b.id}>
                    <td>#BH-{b.id.toString().slice(-4)}</td>
                    <td>{b.user ? b.user.username : 'client'}</td>
                    <td>{b.room.homestay ? b.room.homestay.name : 'Sunset Villa'} - Phòng {b.room.roomNumber}</td>
                    <td>{b.checkInDate} / {b.checkOutDate}</td>
                    <td style={{fontWeight:'700'}}>{b.totalPrice.toLocaleString('vi-VN')} đ</td>
                    <td>
                      <span className={`badge ${b.status === 'PAID' ? 'badge-paid' : b.status === 'PENDING' ? 'badge-pending' : 'badge-cancelled'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* Booking Form Modal Overlay */}
      {bookingRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{fontFamily:'Poppins', fontSize:'1.4rem', marginBottom:'1.5rem'}}>Xác nhận đặt phòng homestay</h3>
            <p style={{marginBottom:'1rem', fontSize:'0.95rem'}}>
              Bạn đang chuẩn bị đặt <strong>Phòng {bookingRoom.roomNumber}</strong> ({bookingRoom.type}) tại <strong>{selectedHomestay.name}</strong>.
            </p>
            
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">Ngày nhận phòng (Check-in)</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ngày trả phòng (Check-out)</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>

              <div style={{marginTop:'1.5rem', padding:'1rem', background:'#f1f5f9', borderRadius:'8px', display:'flex', justifyContent:'space-between'}}>
                <span>Giá dự tính:</span>
                <strong style={{color:'var(--primary)'}}>
                  {bookingRoom.price.toLocaleString('vi-VN')} đ / đêm
                </strong>
              </div>

              <div style={{marginTop:'2rem', display:'flex', gap:'0.5rem', justifyContent:'flex-end'}}>
                <button type="button" className="btn-secondary" onClick={() => setBookingRoom(null)}>Đóng</button>
                <button type="submit" className="btn-primary">Gửi Đặt Phòng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer style={{marginTop:'5rem', padding:'2rem', background:'#0f172a', color:'#94a3b8', textAlign:'center', fontSize:'0.9rem'}}>
        <p>© 2026 Holiday BookingHomestay. Dự án mẫu học phần Công nghệ phần mềm phần thực hành.</p>
        <p style={{marginTop:'0.5rem', fontSize:'0.8rem'}}>Công nghệ sử dụng: Frontend ReactJS (Vite) + Backend Java (Spring Boot) + DB H2 In-Memory.</p>
      </footer>
    </div>
  );
}

export default App;
