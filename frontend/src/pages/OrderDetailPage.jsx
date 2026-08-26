import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById } from "../api/orders";
import { OrderDetailFailure, OrderDetailLoading } from "../components/orders/OrderDetailStates";
import OrderItems from "../components/orders/OrderItems";
import OrderSummary from "../components/orders/OrderSummary";
import PaymentHistory from "../components/orders/PaymentHistory";

const validOrderId = (value) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= 2147483647;

function OrderDetailContent({ orderId }) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => {
    setStatus("loading");
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getOrderById(orderId, { signal: controller.signal })
      .then((data) => {
        setOrder(data);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus(error.status === 404 ? "not-found" : "error");
      });
    return () => controller.abort();
  }, [orderId, requestVersion]);

  if (status === "loading") return <OrderDetailLoading />;
  if (status === "not-found") return <OrderDetailFailure notFound />;
  if (status === "error") return <OrderDetailFailure onRetry={retry} />;

  return (
    <div className="space-y-7">
      <OrderSummary order={order} />
      <OrderItems items={order.items} />
      <PaymentHistory payments={order.payments} />
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  if (!validOrderId(orderId)) return <OrderDetailFailure invalid />;
  return <OrderDetailContent key={orderId} orderId={orderId} />;
}
