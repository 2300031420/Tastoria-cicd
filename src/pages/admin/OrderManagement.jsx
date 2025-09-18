import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Badge
} from "@material-tailwind/react";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Clock,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Package,
  Star,
  Filter
} from "lucide-react";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/orders`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.map(order => ({ ...order, createdAt: new Date(order.createdAt) })));
      } catch (err) {
        console.error(err);
        toast.error(err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const mapFrontendStatusToBackend = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return "Pending";
      case "preparing": return "Preparing";
      case "ready": return "Ready";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return "Pending";
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const oldStatus = orders.find(o => o._id === orderId)?.status;
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: mapFrontendStatusToBackend(newStatus) }),
      });

      const updatedOrder = await res.json();
      if (!res.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: oldStatus } : o));
        toast.error(updatedOrder.message || "Failed to update order status");
      } else {
        toast.success("Order status updated!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return "amber";
      case "preparing": return "blue";
      case "ready": return "green";
      case "delivered": return "green";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "preparing": return <ShoppingCart className="h-4 w-4" />;
      case "ready": return <CheckCircle2 className="h-4 w-4" />;
      case "delivered": return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
      case "total_high": return b.total - a.total;
      case "total_low": return a.total - b.total;
      default: return 0;
    }
  });

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getTimeAgo = (date) => {
    const diffInMinutes = Math.floor((new Date() - date) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => ["Pending", "Preparing"].includes(o.status)).length;
    const completedToday = orders.filter(o =>
      o.status === "Delivered" &&
      new Date(o.createdAt).toDateString() === new Date().toDateString()
    ).length;
    const totalRevenue = orders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + o.total, 0);

    return { totalOrders, activeOrders, completedToday, totalRevenue };
  };

  const stats = getOrderStats();

  if (loading) return (
    <div className="min-h-screen bg-[#d0b290] flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 mx-auto"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
        <Typography className="mt-6 text-amber-800 font-medium">Loading orders...</Typography>
        <Typography variant="small" className="text-amber-700 mt-1">Please wait while we fetch your data</Typography>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#d0b290]">
      {/* Logo */}
      <div className="hidden md:block pt-4 pl-4">
        <img
          src="/img/Tastoria.jpg"
          alt="Tastoria Logo"
          className="h-20 w-32 lg:h-26 lg:w-40"
        />
      </div>

      {/* Enhanced Header with Stats */}
      <div className="bg-white/95 shadow-lg border-b backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <Typography variant="h2" className="font-bold text-amber-800">
                Order Management
              </Typography>
              <Typography className="text-amber-700 mt-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Manage and track all customer orders efficiently
              </Typography>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl p-4 text-white text-center transform hover:scale-105 transition-transform duration-200">
                <Typography variant="h4" className="font-bold">{stats.totalOrders}</Typography>
                <Typography variant="small" className="opacity-90">Total Orders</Typography>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white text-center transform hover:scale-105 transition-transform duration-200">
                <Badge content={stats.activeOrders} className="bg-red-600">
                  <Typography variant="h4" className="font-bold">{stats.activeOrders}</Typography>
                </Badge>
                <Typography variant="small" className="opacity-90">Active</Typography>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 text-white text-center transform hover:scale-105 transition-transform duration-200">
                <Typography variant="h4" className="font-bold">{stats.completedToday}</Typography>
                <Typography variant="small" className="opacity-90">Today</Typography>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-4 text-white text-center transform hover:scale-105 transition-transform duration-200">
                <Typography variant="h4" className="font-bold">₹{stats.totalRevenue}</Typography>
                <Typography variant="small" className="opacity-90">Revenue</Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Card */}
        <Card className="mb-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-amber-700" />
              <Typography variant="h6" className="font-semibold text-amber-800">Filter & Search</Typography>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                <Input
                  label="Search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 !border-t-amber-200 focus:!border-t-amber-600"
                  labelProps={{ className: "before:content-none after:content-none" }}
                />
              </div>
              <Select
                label="Filter by Status"
                value={statusFilter}
                onChange={setStatusFilter}
                className="min-w-48 !border-t-amber-200 focus:!border-t-amber-600"
                labelProps={{ className: "before:content-none after:content-none" }}
              >
                <Option value="all">🔍 All Status</Option>
                <Option value="Pending">⏳ Pending</Option>
                <Option value="Preparing">🔄 Preparing</Option>
                <Option value="Ready">✅ Ready</Option>
                <Option value="Delivered">🚚 Delivered</Option>
                <Option value="Cancelled">❌ Cancelled</Option>
              </Select>
              <Select
                label="Sort Orders"
                value={sortBy}
                onChange={setSortBy}
                className="min-w-48 !border-t-amber-200 focus:!border-t-amber-600"
                labelProps={{ className: "before:content-none after:content-none" }}
              >
                <Option value="newest">📅 Newest First</Option>
                <Option value="oldest">📅 Oldest First</Option>
                <Option value="total_high">💰 Highest Total</Option>
                <Option value="total_low">💰 Lowest Total</Option>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Orders List */}
        {sortedOrders.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardBody className="text-center py-16">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full"></div>
                </div>
                <ShoppingCart className="relative h-16 w-16 text-amber-600 mx-auto" />
              </div>
              <Typography variant="h4" className="text-amber-800 mb-3 font-semibold">No orders found</Typography>
              <Typography className="text-amber-700 max-w-md mx-auto">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria to find what you're looking for"
                  : "Orders will appear here once customers place them. The dashboard will come alive with activity!"}
              </Typography>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-6">
            {sortedOrders.map((order, index) => (
              <Card
                key={order._id}
                className="hover:shadow-2xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm transform hover:-translate-y-1 group"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <CardBody className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">

                    {/* Left Column: Order Info */}
                    <div className="flex-1 flex flex-col gap-4">
                      {/* Header */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-amber-700" />
                          <Typography variant="h6" className="font-bold text-amber-900">{order.orderNumber}</Typography>
                        </div>
                        <Chip value={order.status} color={getStatusColor(order.status)} icon={getStatusIcon(order.status)} className="animate-pulse shadow-md" />
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <Typography variant="small">{getTimeAgo(order.createdAt)}</Typography>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-full"><User className="h-4 w-4 text-amber-700" /></div>
                            <div>
                              <Typography variant="small" className="text-amber-600">Customer</Typography>
                              <Typography className="font-medium text-amber-900">{order.customerName}</Typography>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full"><Phone className="h-4 w-4 text-green-700" /></div>
                            <div>
                              <Typography variant="small" className="text-amber-600">Phone</Typography>
                              <Typography className="font-medium text-amber-900">{order.phone}</Typography>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-white border border-amber-100 rounded-lg p-4">
                        <Typography variant="small" className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-600" /> Items ({order.items.length})
                        </Typography>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {order.items.map(item => (
                            <div key={item._id} className="flex justify-between items-center py-1">
                              <span className="text-amber-700 text-sm">{item.name} × {item.quantity}</span>
                              <span className="font-semibold text-amber-800">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                      <div className="text-right">
                        <Typography variant="h4" className="font-bold text-amber-800">
                          ₹{order.total}
                        </Typography>
                        {order.estimatedTime > 0 && (
                          <div className="flex items-center gap-1 text-amber-700 mt-1">
                            <Clock className="h-4 w-4" />
                            <Typography variant="small" className="font-medium">Est. {order.estimatedTime} min</Typography>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        <Button variant="outlined" color="amber" onClick={() => openOrderModal(order)} className="flex items-center gap-2 justify-center hover:shadow-lg transition-all duration-200 border-amber-300 text-amber-800 hover:bg-amber-50">
                          <Eye className="h-4 w-4" /> View Details
                        </Button>

                        {order.status === "Pending" && <Button color="amber" onClick={() => updateStatus(order._id, "Preparing")} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all duration-200"> Start Preparing</Button>}
                        {order.status === "Preparing" && <Button color="green" onClick={() => updateStatus(order._id, "Ready")} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200">Mark Ready</Button>}
                        {order.status === "Ready" && (
                          <Button
                            onClick={() => updateStatus(order._id, "Delivered")}
                            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            Mark Delivered
                          </Button>
                        )}

                      </div>
                    </div>

                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>


      {/* Enhanced Order Modal */}
      <Dialog open={showOrderModal} handler={() => setShowOrderModal(false)} size="lg" className="bg-white/95 backdrop-blur-sm">
        <DialogHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            Order Details - {selectedOrder?.orderNumber}
          </div>
        </DialogHeader>
        <DialogBody className="max-h-96 overflow-y-auto">
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                <Typography variant="h6" className="font-semibold mb-4 text-amber-800 flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-700" />
                  Customer Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <Typography variant="small" className="text-amber-600">Full Name</Typography>
                      <Typography className="font-medium text-amber-900">{selectedOrder.customerName}</Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Phone className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <Typography variant="small" className="text-amber-600">Phone Number</Typography>
                      <Typography className="font-medium text-amber-900">{selectedOrder.phone}</Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-1">
                    <div className="bg-red-100 p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <Typography variant="small" className="text-amber-600">Delivery Address</Typography>
                      <Typography className="font-medium text-amber-900">{selectedOrder.address}</Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <Typography variant="small" className="text-amber-600">Order Time</Typography>
                      <Typography className="font-medium text-amber-900">{selectedOrder.createdAt.toLocaleString()}</Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <Typography variant="h6" className="font-semibold mb-4 text-amber-800 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-amber-700" />
                  Order Items
                </Typography>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item._id} className="flex justify-between items-center p-4 bg-white border border-amber-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <Typography className="font-medium text-amber-900">{item.name}</Typography>
                          <Typography variant="small" className="text-amber-700">
                            Quantity: {item.quantity} × ₹{item.price}
                          </Typography>
                        </div>
                      </div>
                      <Typography className="font-bold text-lg text-amber-800">₹{item.price * item.quantity}</Typography>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-amber-200">
                  <Typography variant="h5" className="font-bold text-amber-800">Order Total</Typography>
                  <Typography variant="h4" className="font-bold text-amber-800">
                    ₹{selectedOrder.total}
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="bg-amber-50 rounded-b-lg border-t border-amber-100">
          <Button variant="text" color="red" onClick={() => setShowOrderModal(false)} className="mr-1">
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}