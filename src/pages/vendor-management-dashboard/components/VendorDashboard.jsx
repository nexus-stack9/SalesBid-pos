import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  User, Package, ShoppingCart, DollarSign, TrendingUp,
  Eye, Edit, MoreVertical, Star, AlertCircle, CheckCircle,
  Clock, XCircle, Filter, Search, Download
} from 'lucide-react';
import './VendorDashboard.css';

const VendorDashboard = () => {
  // Sample data
  const vendorProfile = {
    name: "John's Electronics Store",
    email: "john@electronics.com",
    phone: "+1 234 567 8900",
    address: "123 Business St, NY 10001",
    rating: 4.8,
    totalReviews: 1250,
    joinedDate: "Jan 2022",
    avatar: "https://ui-avatars.com/api/?name=John+Electronics&background=6366f1&color=fff&size=200"
  };

  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+12.5%",
      icon: DollarSign,
      color: "blue",
      bgColor: "bg-blue-500"
    },
    {
      title: "Total Orders",
      value: "1,429",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "green",
      bgColor: "bg-green-500"
    },
    {
      title: "Total Products",
      value: "342",
      change: "+4.3%",
      icon: Package,
      color: "purple",
      bgColor: "bg-purple-500"
    },
    {
      title: "Avg. Rating",
      value: "4.8",
      change: "+0.3",
      icon: Star,
      color: "yellow",
      bgColor: "bg-yellow-500"
    }
  ];

  const salesData = [
    { month: 'Jan', sales: 4000, orders: 240, revenue: 2400 },
    { month: 'Feb', sales: 3000, orders: 139, revenue: 2210 },
    { month: 'Mar', sales: 2000, orders: 980, revenue: 2290 },
    { month: 'Apr', sales: 2780, orders: 390, revenue: 2000 },
    { month: 'May', sales: 1890, orders: 480, revenue: 2181 },
    { month: 'Jun', sales: 2390, orders: 380, revenue: 2500 },
    { month: 'Jul', sales: 3490, orders: 430, revenue: 2100 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 400, color: '#6366f1' },
    { name: 'Accessories', value: 300, color: '#8b5cf6' },
    { name: 'Gadgets', value: 200, color: '#ec4899' },
    { name: 'Audio', value: 100, color: '#f59e0b' }
  ];

  const recentOrders = [
    { id: '#12345', customer: 'Alice Johnson', product: 'Wireless Headphones', amount: '$129', status: 'Delivered', date: '2024-01-15' },
    { id: '#12346', customer: 'Bob Smith', product: 'Smart Watch', amount: '$299', status: 'Processing', date: '2024-01-14' },
    { id: '#12347', customer: 'Carol White', product: 'Phone Case', amount: '$25', status: 'Shipped', date: '2024-01-14' },
    { id: '#12348', customer: 'David Brown', product: 'USB-C Cable', amount: '$15', status: 'Pending', date: '2024-01-13' },
    { id: '#12349', customer: 'Eva Green', product: 'Power Bank', amount: '$45', status: 'Cancelled', date: '2024-01-12' }
  ];

  const topProducts = [
    { name: 'Wireless Earbuds', sold: 245, revenue: '$12,250', stock: 45, trend: 'up' },
    { name: 'Smart Watch Pro', sold: 189, revenue: '$56,700', stock: 23, trend: 'up' },
    { name: 'USB-C Hub', sold: 167, revenue: '$8,350', stock: 89, trend: 'down' },
    { name: 'Phone Stand', sold: 143, revenue: '$2,860', stock: 120, trend: 'up' },
    { name: 'Screen Protector', sold: 98, revenue: '$1,960', stock: 200, trend: 'down' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': 'status-delivered',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Pending': 'status-pending',
      'Cancelled': 'status-cancelled'
    };
    return colors[status] || 'status-pending';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Delivered': CheckCircle,
      'Processing': Clock,
      'Shipped': TrendingUp,
      'Pending': AlertCircle,
      'Cancelled': XCircle
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon size={16} />;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Package size={32} />
          <span>VendorHub</span>
        </div>
        <nav className="nav-menu">
          <a href="#" className="nav-item active">
            <TrendingUp size={20} />
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <Package size={20} />
            <span>Products</span>
          </a>
          <a href="#" className="nav-item">
            <ShoppingCart size={20} />
            <span>Orders</span>
          </a>
          <a href="#" className="nav-item">
            <User size={20} />
            <span>Profile</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, John! 👋</h1>
            <p>Here's what's happening with your store today.</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <Download size={20} />
              Export Report
            </button>
            <div className="profile-badge">
              <img src={vendorProfile.avatar} alt="Profile" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-info">
                  <p className="stat-title">{stat.title}</p>
                  <h3 className="stat-value">{stat.value}</h3>
                  <span className="stat-change positive">
                    <TrendingUp size={16} />
                    {stat.change}
                  </span>
                </div>
                <div className={`stat-icon ${stat.bgColor}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Sales Overview */}
          <div className="chart-card large">
            <div className="card-header">
              <h3>Sales Overview</h3>
              <div className="card-actions">
                <select className="select-input">
                  <option>Last 7 months</option>
                  <option>Last 30 days</option>
                  <option>Last year</option>
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="chart-card">
            <div className="card-header">
              <h3>Product Categories</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend-custom">
              {categoryData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                  <span className="legend-label">{item.name}</span>
                  <span className="legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="tables-row">
          {/* Recent Orders */}
          <div className="table-card large">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <div className="card-actions">
                <button className="btn-icon">
                  <Filter size={18} />
                </button>
                <button className="btn-icon">
                  <Search size={18} />
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={index}>
                      <td className="font-medium">{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td className="font-medium">{order.amount}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <button className="btn-icon">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="table-card">
            <div className="card-header">
              <h3>Top Products</h3>
              <button className="btn-text">View All</button>
            </div>
            <div className="products-list">
              {topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <div className="product-rank">{index + 1}</div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p>{product.sold} sold • Stock: {product.stock}</p>
                  </div>
                  <div className="product-stats">
                    <span className="product-revenue">{product.revenue}</span>
                    <TrendingUp 
                      size={16} 
                      className={product.trend === 'up' ? 'trend-up' : 'trend-down'}
                      style={{ transform: product.trend === 'down' ? 'rotate(180deg)' : 'none' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-card">
            <div className="card-header">
              <h3>Vendor Profile</h3>
              <button className="btn-icon">
                <Edit size={18} />
              </button>
            </div>
            <div className="profile-content">
              <div className="profile-avatar-large">
                <img src={vendorProfile.avatar} alt="Vendor" />
                <div className="profile-badge-verified">
                  <CheckCircle size={20} />
                </div>
              </div>
              <div className="profile-details">
                <h2>{vendorProfile.name}</h2>
                <div className="rating-display">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i < Math.floor(vendorProfile.rating) ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                  <span>{vendorProfile.rating} ({vendorProfile.totalReviews} reviews)</span>
                </div>
                <div className="profile-info-grid">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{vendorProfile.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{vendorProfile.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Address</span>
                    <span className="info-value">{vendorProfile.address}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">{vendorProfile.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;