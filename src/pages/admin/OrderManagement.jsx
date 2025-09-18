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
  Badge,
  Progress
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
  Filter,
  Coffee,
  ArrowRight,
  Zap,
  Award,
  Activity
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
      case "preparing": return "orange";
      case "ready": return "green";
      case "delivered": return "green";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "preparing": return <Coffee className="h-4 w-4 animate-pulse" />;
      case "ready": return <CheckCircle2 className="h-4 w-4" />;
      case "delivered": return <Award className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusProgress = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return 25;
      case "preparing": return 50;
      case "ready": return 75;
      case "delivered": return 100;
      case "cancelled": return 0;
      default: return 0;
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full animate-ping opacity-30"></div>
          <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 rounded-full p-6 shadow-2xl">
            <Coffee className="h-16 w-16 text-white animate-bounce" />
          </div>
        </div>
        <div className="space-y-3">
          <Typography variant="h4" className="font-bold bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
            Brewing Your Orders...
          </Typography>
          <Typography className="text-amber-700 max-w-md mx-auto">
            Please wait while we fetch fresh data from our kitchen
          </Typography>
          <div className="w-64 mx-auto">
            <Progress value={75} color="amber" className="animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Floating Coffee Bean Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-3 h-3 bg-amber-600 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-16 w-2 h-2 bg-orange-600 rounded-full opacity-30 animate-float-delay"></div>
        <div className="absolute bottom-32 left-20 w-4 h-4 bg-yellow-600 rounded-full opacity-15 animate-float"></div>
        <div className="absolute bottom-60 right-32 w-2 h-2 bg-amber-500 rounded-full opacity-25 animate-float-delay"></div>
      </div>

      {/* Logo with Enhanced Styling */}
      <div className="hidden md:block pt-6 pl-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity"></div>
          <img
            src="/img/Tastoria.jpg"
            alt="Tastoria Logo"
            className="relative h-20 w-32 lg:h-26 lg:w-40 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Enhanced Header with Animated Stats */}
      <div className="relative bg-white/90 shadow-2xl border-b backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-orange-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3 rounded-xl shadow-lg">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <Typography variant="h2" className="font-bold bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
                    Order Dashboard
                  </Typography>
                  <Typography className="text-amber-700 flex items-center gap-2 mt-1">
                    <TrendingUp className="h-4 w-4" />
                    Real-time order management & tracking
                  </Typography>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards with Animations */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
              <div className="group relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 rounded-2xl p-5 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-center space-y-2">
                  <Package className="h-6 w-6 mx-auto mb-2 animate-pulse" />
                  <Typography variant="h3" className="font-bold">{stats.totalOrders}</Typography>
                  <Typography variant="small" className="opacity-90 font-medium">Total Orders</Typography>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-500 to-red-600 rounded-2xl p-5 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-center space-y-2">
                  <div className="relative">
                    <Zap className="h-6 w-6 mx-auto mb-2 animate-bounce" />
                    {stats.activeOrders > 0 && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                        {stats.activeOrders}
                      </div>
                    )}
                  </div>
                  <Typography variant="h3" className="font-bold">{stats.activeOrders}</Typography>
                  <Typography variant="small" className="opacity-90 font-medium">Active Now</Typography>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-center space-y-2">
                  <Award className="h-6 w-6 mx-auto mb-2 animate-pulse" />
                  <Typography variant="h3" className="font-bold">{stats.completedToday}</Typography>
                  <Typography variant="small" className="opacity-90 font-medium">Today</Typography>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-center space-y-2">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 animate-pulse" />
                  <Typography variant="h3" className="font-bold">₹{stats.totalRevenue}</Typography>
                  <Typography variant="small" className="opacity-90 font-medium">Revenue</Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters with Glass Morphism */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 shadow-2xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-orange-600/5"></div>
          <CardBody className="relative p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3 rounded-xl shadow-lg">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div>
                <Typography variant="h5" className="font-bold bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
                  Smart Filters
                </Typography>
                <Typography variant="small" className="text-amber-700">Find orders quickly with advanced search</Typography>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-600 group-focus-within:text-orange-600 transition-colors" />
                  <Input
                    label="Search orders, customers, phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-12 !border-amber-300 focus:!border-orange-600 bg-white/70"
                    labelProps={{ className: "before:content-none after:content-none text-amber-700" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[400px]">
                <Select
                  label="Filter by Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="!border-amber-300 focus:!border-orange-600 bg-white/70"
                  labelProps={{ className: "before:content-none after:content-none text-amber-700" }}
                >
                  <Option value="all">🔍 All Orders</Option>
                  <Option value="Pending">⏳ Pending Orders</Option>
                  <Option value="Preparing">☕ In Kitchen</Option>
                  <Option value="Ready">✅ Ready to Serve</Option>
                  <Option value="Delivered">🚚 Delivered</Option>
                  <Option value="Cancelled">❌ Cancelled</Option>
                </Select>

                <Select
                  label="Sort Orders"
                  value={sortBy}
                  onChange={setSortBy}
                  className="!border-amber-300 focus:!border-orange-600 bg-white/70"
                  labelProps={{ className: "before:content-none after:content-none text-amber-700" }}
                >
                  <Option value="newest">🕐 Latest First</Option>
                  <Option value="oldest">🕐 Oldest First</Option>
                  <Option value="total_high">💰 Highest Value</Option>
                  <Option value="total_low">💰 Lowest Value</Option>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Enhanced Orders List */}
        {sortedOrders.length === 0 ? (
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50"></div>
            <CardBody className="relative text-center py-20">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-2xl"></div>
                <div className="relative bg-gradient-to-r from-amber-100 to-orange-100 rounded-full p-8 w-32 h-32 mx-auto flex items-center justify-center">
                  <ShoppingCart className="h-16 w-16 text-amber-600 animate-bounce" />
                </div>
              </div>
              <Typography variant="h3" className="font-bold bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent mb-4">
                No orders found
              </Typography>
              <Typography className="text-amber-700 max-w-md mx-auto text-lg">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search filters to find what you're looking for"
                  : "Your order dashboard is ready! Orders will appear here as customers place them."}
              </Typography>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedOrders.map((order, index) => (
              <Card
                key={order._id}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-xl transform hover:-translate-y-2 overflow-hidden"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardBody className="relative p-8">
                  <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Enhanced Order Info */}
                    <div className="flex-1 space-y-6">
                      {/* Enhanced Header with Progress */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3 rounded-xl shadow-lg">
                              <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <Typography variant="h5" className="font-bold text-amber-900">
                                {order.orderNumber}
                              </Typography>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <Typography variant="small" className="text-amber-700 font-medium">
                                  {getTimeAgo(order.createdAt)}
                                </Typography>
                              </div>
                            </div>
                          </div>
                          <Chip
                            value={order.status}
                            color={getStatusColor(order.status)}
                            icon={getStatusIcon(order.status)}
                            className="shadow-lg font-bold px-4 py-2"
                          />
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Typography variant="small" className="text-amber-700 font-medium">Order Progress</Typography>
                            <Typography variant="small" className="text-amber-700 font-bold">{getStatusProgress(order.status)}%</Typography>
                          </div>
                          <Progress
                            value={getStatusProgress(order.status)}
                            color={getStatusColor(order.status)}
                            className="h-2"
                          />
                        </div>
                      </div>

                      {/* Enhanced Customer Info */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50 shadow-inner">
                        <Typography variant="h6" className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Customer Details
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3 rounded-xl shadow-lg">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Typography variant="small" className="text-amber-600 font-medium">Customer Name</Typography>
                              <Typography className="font-bold text-amber-900 text-lg">{order.customerName}</Typography>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
                              <Phone className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Typography variant="small" className="text-amber-600 font-medium">Contact</Typography>
                              <Typography className="font-bold text-amber-900 text-lg">{order.phone}</Typography>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Items Display */}
                      <div className="bg-white/70 border-2 border-amber-200/50 rounded-2xl p-6 shadow-inner">
                        <Typography variant="h6" className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                          <Coffee className="h-5 w-5 text-amber-600 animate-pulse" />
                          Order Items ({order.items.length})
                        </Typography>
                        <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                          {order.items.map((item, idx) => (
                            <div key={item._id} className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/30">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                  {idx + 1}
                                </div>
                                <div>
                                  <Typography className="font-bold text-amber-900">{item.name}</Typography>
                                  <Typography variant="small" className="text-amber-700">Qty: {item.quantity}</Typography>
                                </div>
                              </div>
                              <Typography className="font-bold text-lg text-amber-800">₹{item.price * item.quantity}</Typography>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Right Column: Actions */}
                    <div className="flex flex-col justify-between items-end gap-6 min-w-[240px]">
                      <div className="text-right space-y-3">
                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 rounded-2xl text-white shadow-2xl">
                          <Typography variant="small" className="opacity-90 font-medium">Total Amount</Typography>
                          <Typography variant="h3" className="font-bold">₹{order.total}</Typography>
                        </div>
                        {order.estimatedTime > 0 && (
                          <div className="bg-amber-100 p-3 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-2 text-amber-800">
                              <Clock className="h-5 w-5" />
                              <div>
                                <Typography variant="small" className="font-medium">Estimated Time</Typography>
                                <Typography className="font-bold">{order.estimatedTime} minutes</Typography>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 w-full">
                        <Button
                          variant="outlined"
                          color="amber"
                          onClick={() => openOrderModal(order)}
                          className="flex items-center gap-2 justify-center hover:shadow-xl transition-all duration-300 border-2 border-amber-400 text-amber-800 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 font-bold"
                        >
                          <Eye className="h-5 w-5" />
                          View Details
                        </Button>

                        {order.status === "Pending" && (
                          <Button
                            onClick={() => updateStatus(order._id, "Preparing")}
                            className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold py-3 flex items-center gap-2"
                          >
                            <Coffee className="h-5 w-5 animate-bounce" />
                            Start Brewing
                          </Button>
                        )}
                        {order.status === "Preparing" && (
                          <Button
                            color="green"
                            onClick={() => updateStatus(order._id, "Ready")}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold py-3 flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            Mark as Ready
                          </Button>
                        )}

                        {order.status === "Ready" && (
                          <Button
                            color="blue"
                            onClick={() => updateStatus(order._id, "Delivered")}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold py-3 flex items-center gap-2"
                          >
                            <Award className="h-5 w-5" />
                            Mark as Delivered
                          </Button>
                        )}

                        {order.status !== "Cancelled" && order.status !== "Delivered" && (
                          <Button
                            color="red"
                            onClick={() => updateStatus(order._id, "Cancelled")}
                            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold py-3 flex items-center gap-2"
                          >
                            <XCircle className="h-5 w-5" />
                            Cancel Order
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

      {/* Enhanced Order Modal with Glass Morphism */}
      <Dialog
        open={showOrderModal}
        handler={() => setShowOrderModal(false)}
        size="xl"
        className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10"></div>
        <DialogHeader className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-t-xl m-0 shadow-2xl">
          <div className="flex items-center gap-4 w-full">
            <div className="bg-white/20 p-3 rounded-xl">
              <Package className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <Typography variant="h4" className="font-bold">Order Details</Typography>
              <Typography className="opacity-90">{selectedOrder?.orderNumber}</Typography>
            </div>
            <div className="text-right">
              <Typography variant="h5" className="font-bold">₹{selectedOrder?.total}</Typography>
              <Typography variant="small" className="opacity-90">Total Amount</Typography>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="relative max-h-[70vh] overflow-y-auto p-8 custom-scrollbar">
          {selectedOrder && (
            <div className="space-y-8">
              {/* Enhanced Progress Tracker */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <Typography variant="h6" className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Order Progress
                </Typography>
                <div className="space-y-4">
                  <Progress
                    value={getStatusProgress(selectedOrder.status)}
                    color={getStatusColor(selectedOrder.status)}
                    className="h-3"
                  />
                  <div className="flex justify-between items-center">
                    <Typography variant="small" className="font-bold text-amber-700">
                      Status: {selectedOrder.status}
                    </Typography>
                    <Typography variant="small" className="font-bold text-amber-700">
                      {getStatusProgress(selectedOrder.status)}% Complete
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Enhanced Customer Information */}
              <div className="bg-white/70 rounded-2xl p-6 border-2 border-amber-200/50 shadow-inner">
                <Typography variant="h6" className="font-bold mb-6 text-amber-800 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-2 rounded-xl">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Customer Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 group-hover:shadow-lg transition-shadow">
                      <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3 rounded-xl shadow-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="small" className="text-amber-600 font-medium">Full Name</Typography>
                        <Typography className="font-bold text-amber-900 text-lg">{selectedOrder.customerName}</Typography>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 group-hover:shadow-lg transition-shadow">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="small" className="text-green-600 font-medium">Phone Number</Typography>
                        <Typography className="font-bold text-green-900 text-lg">{selectedOrder.phone}</Typography>
                      </div>
                    </div>
                  </div>

                  <div className="group md:col-span-2">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200/50 group-hover:shadow-lg transition-shadow">
                      <div className="bg-gradient-to-r from-red-600 to-pink-600 p-3 rounded-xl shadow-lg">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <Typography variant="small" className="text-red-600 font-medium">Delivery Address</Typography>
                        <Typography className="font-bold text-red-900 text-lg">{selectedOrder.address}</Typography>
                      </div>
                    </div>
                  </div>

                  <div className="group md:col-span-2">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50 group-hover:shadow-lg transition-shadow">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="small" className="text-blue-600 font-medium">Order Placed</Typography>
                        <Typography className="font-bold text-blue-900 text-lg">
                          {selectedOrder.createdAt.toLocaleDateString()} at {selectedOrder.createdAt.toLocaleTimeString()}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Order Items */}
              <div className="bg-white/70 rounded-2xl p-6 border-2 border-amber-200/50 shadow-inner">
                <Typography variant="h6" className="font-bold mb-6 text-amber-800 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-2 rounded-xl">
                    <Coffee className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  Order Items ({selectedOrder.items.length})
                </Typography>
                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item._id} className="group p-5 bg-gradient-to-r from-white to-amber-50/50 border-2 border-amber-200/50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>
                          <div>
                            <Typography className="font-bold text-amber-900 text-xl">{item.name}</Typography>
                            <div className="flex items-center gap-4 mt-1">
                              <Typography variant="small" className="text-amber-700 font-medium">
                                Quantity: <span className="font-bold">{item.quantity}</span>
                              </Typography>
                              <Typography variant="small" className="text-amber-700 font-medium">
                                Unit Price: <span className="font-bold">₹{item.price}</span>
                              </Typography>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Typography className="font-bold text-2xl text-amber-800">₹{item.price * item.quantity}</Typography>
                          <Typography variant="small" className="text-amber-600">Subtotal</Typography>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Total Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl text-white shadow-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <Typography variant="h5" className="font-bold">Order Total</Typography>
                      <Typography variant="small" className="opacity-90">Including all items</Typography>
                    </div>
                    <div className="text-right">
                      <Typography variant="h3" className="font-bold">₹{selectedOrder.total}</Typography>
                      <Typography variant="small" className="opacity-90">Final Amount</Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="relative bg-gradient-to-r from-amber-50 to-orange-50 rounded-b-xl border-t-2 border-amber-200/50 p-6">
          <div className="flex gap-4 w-full justify-end">
            <Button
              variant="outlined"
              color="red"
              onClick={() => setShowOrderModal(false)}
              className="border-2 border-red-400 text-red-600 hover:bg-red-50 font-bold px-6 py-2"
            >
              Close
            </Button>
            {selectedOrder && selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
              <Button
                onClick={() => {
                  const nextStatus = selectedOrder.status === "Pending" ? "Preparing" :
                    selectedOrder.status === "Preparing" ? "Ready" : "Delivered";
                  updateStatus(selectedOrder._id, nextStatus);
                  setShowOrderModal(false);
                }}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 font-bold px-6 py-2 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
              >
                {selectedOrder.status === "Pending" && <><Coffee className="h-4 w-4" /> Start Preparing</>}
                {selectedOrder.status === "Preparing" && <><CheckCircle2 className="h-4 w-4" /> Mark Ready</>}
                {selectedOrder.status === "Ready" && <><Award className="h-4 w-4" /> Mark Delivered</>}
              </Button>
            )}
          </div>
        </DialogFooter>
      </Dialog>

      {/* Enhanced CSS Animations & Custom Scrollbar */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(5deg);
          }
          50% {
            transform: translateY(-20px) rotate(0deg);
          }
          75% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }

        @keyframes float-delay {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(-5deg);
          }
          50% {
            transform: translateY(-30px) rotate(0deg);
          }
          75% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delay {
          animation: float-delay 8s ease-in-out infinite;
          animation-delay: 2s;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d97706 #fef3c7;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fef3c7;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #d97706, #ea580c);
          border-radius: 10px;
          border: 2px solid #fef3c7;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #b45309, #c2410c);
        }

        /* Glass morphism effect for cards */
        .group:hover .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Gradient text animation */
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          background: linear-gradient(-45deg, #d97706, #ea580c, #f59e0b, #d97706);
          background-size: 400% 400%;
          animation: gradient 3s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}