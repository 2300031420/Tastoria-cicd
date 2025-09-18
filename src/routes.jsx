import {
  HomeIcon,
  UserCircleIcon,
  ShoppingCartIcon,
  QrCodeIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/solid";
import { Home } from "@/pages/Home";
import { Profile } from "@/pages/Profile";
import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";
import QRScanner from "@/components/QRScanner";
import PreorderPage from "@/pages/PreorderPage";
import { CafeList } from "@/pages/CafeList";
import OrderManagement from "./pages/admin/OrderManagement"; // adjust the path if needed

import { AdminLogin } from "./pages/AdminLogin";
import { AdminPortal } from "./pages/AdminPortal";
import { MenuManagement } from "./pages/admin/MenuManagement";
import { CafeManagement } from "./pages/admin/CafeManagement";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PreorderModal from "./pages/PreorderModal";

// Regular user routes
export const userRoutes = [
  {
    icon: HomeIcon,
    name: "home",
    path: "/home",
    element: <Home />,
  },
  {
    icon: UserCircleIcon,
    name: "profile",
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    icon: QrCodeIcon,
    name: "qr scanner",
    path: "/qr-scanner",
    element: <QRScanner />,
  },
  {
    icon: BuildingStorefrontIcon,
    name: "Slot Booking",
    path: "/cafes",
    element: <CafeList />,
  },
  {/*{
    icon: UserCircleIcon,
    name: "Profile",
    path: "/profile",
    element: <Profile />,
  },*/}
];

// Admin routes (these won't show in the navigation)
export const adminRoutes = [
  {
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    path: "/admin-portal",
    element: <AdminPortal />,
  },
  {
    path: "/admin/menu",
    element: <MenuManagement />,
  },
  {
    path: "/admin/menu/:restaurantId",
    element: <MenuManagement />,
  },
  {
    path: "/admin/cafes",
    element: <CafeManagement />,
  },
  {
    path: "/admin/cafes/add",
    element: <CafeManagement />,
  },
  {
    path: "/admin/orders",
    element: <OrderManagement />,
  },
  {
    path: "/admin/orders/:filter",
    element: <OrderManagement />,
  },
];

// Combine all routes for the router
export const routes = [
  ...userRoutes,
  ...adminRoutes,
  // Add auth pages directly here instead of through authRoutes
  {
    path: "/sign-in",
    element: <SignIn />,
    showInNav: false, // This ensures it won't show in navigation
  },
  {
    path: "/sign-up",
    element: <SignUp />,
    showInNav: false, // This ensures it won't show in navigation
  },
  // Preorder routes
  {
    path: "/preorderModal",
    element: <PreorderModal />,
    showInNav: false,
  },
  {
    path: "/preorderpage",
    element: <PreorderPage />,
    showInNav: false,
  },
  {
    path: "/preorderpage/:restaurantId",
    element: <PreorderPage />,
    showInNav: false,
  },
 
];

export default routes;