import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import DiseaseDetection from "./pages/DiseaseDetection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DashboardRedirect from "./pages/DashboardRedirect";
import Login from "./pages/Login";
import FarmerDashboard from "./pages/FarmerDashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Tracking from "./pages/Tracking";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Cart from "./pages/Cart";
import AgentDashboard from "./pages/AgentDashboard";
import ChatBot from "./components/ChatBot";

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-brand-primary">Loading AgroConnect...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && profile?.role !== role && profile?.role !== 'admin') return <Navigate to="/dashboard" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
              <Route path="/farmer-dashboard" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
              <Route path="/consumer-dashboard" element={<ProtectedRoute role="consumer"><ConsumerDashboard /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              
              {/* Delivery & GPS */}
              <Route path="/order-tracking/:orderId" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
              <Route path="/delivery-agent" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <ChatBot />
        </div>
      </Router>
      </CartProvider>
    </AuthProvider>
  );
}
