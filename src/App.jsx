import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";
import { Home } from "./pages/Home.jsx";
import QRScanner from "./components/QRScanner";
import PreorderPage from "./pages/Preorderpage";
import { CafeList } from "./pages/CafeList";
import { SlotBooking } from "./pages/SlotBooking";
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Profile } from './pages/Profile';
import PreorderModal from './pages/PreorderModal';
import Cart from "./pages/Cart";
import { ChatBot } from './components/ChatBot';
import { AdminLogin } from "./pages/AdminLogin";
import { AdminPortal } from "./pages/AdminPortal";
import { MenuManagement } from "./pages/admin/MenuManagement";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import CafeManagement from "./pages/admin/CafeManagement";
import OrderManagement from "./pages/admin/OrderManagement";
function App() {
  return (
    <>
      <ThemeProvider>
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={routes} />
        </div>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/preorderpage" element={<PreorderPage />} />
          <Route path="/preorderModal" element={<PreorderModal />} />
          <Route path="/cafes" element={<CafeList />} />
          <Route path="/book-slot/:cafeId" element={<SlotBooking />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/preorder/:restaurantId" element={<PreorderPage />} />
          <Route path="/preorderpage/:restaurantId" element={<PreorderPage />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-portal" element={<AdminPortal />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/cafes" element={<CafeManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/orders/:filter" element={<OrderManagement />} />

          {/* Add a catch-all route for 404 */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        <ChatBot />
      </ThemeProvider>
    </>
  );
}

export default App;