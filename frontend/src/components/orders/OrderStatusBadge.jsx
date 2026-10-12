import { getStatusVariant } from "../../utils/formatters";

export default function OrderStatusBadge({ status }) {
  const variant = getStatusVariant(status || "");
  return <span className={`badge rounded-pill bg-${variant}-subtle text-${variant} px-3 py-2`}>{status}</span>;
}
