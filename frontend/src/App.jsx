import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import OrderDetailPage from "./pages/OrderDetailPage";
import EditOrderPage from "./pages/EditOrderPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import SupplierDetailPage from "./pages/SupplierDetailPage";
import CreateSupplierPage from "./pages/CreateSupplierPage";
import EditSupplierPage from "./pages/EditSupplierPage";
import SuppliersPage from "./pages/SuppliersPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/suppliers" replace />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/new" element={<CreateSupplierPage />} />
        <Route path="suppliers/:supplierId" element={<SupplierDetailPage />} />
        <Route path="suppliers/:supplierId/edit" element={<EditSupplierPage />} />
        <Route path="suppliers/:supplierId/orders/new" element={<CreateOrderPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="orders/:orderId/edit" element={<EditOrderPage />} />
        <Route path="*" element={<Navigate to="/suppliers" replace />} />
      </Route>
    </Routes>
  );
}
