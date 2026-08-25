const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

// Group the integer characters directly so financial strings never pass through floating-point numbers.
export function formatRmb(decimalString) {
  if (typeof decimalString !== "string" || !/^-?\d+(?:\.\d+)?$/.test(decimalString)) {
    return "—";
  }

  const isNegative = decimalString.startsWith("-");
  const unsigned = isNegative ? decimalString.slice(1) : decimalString;
  const [integerPart, fractionPart] = unsigned.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fraction = fractionPart ? `.${fractionPart}` : "";
  return `${isNegative ? "-" : ""}¥${groupedInteger}${fraction}`;
}
