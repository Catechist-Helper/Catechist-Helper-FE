export const formatPrice = (price: number) => {
    return Intl.NumberFormat("vi-VN", {
      currency: "VND",
    }).format(price);
  };

  export const formatCurrencyVND = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      // style: "currency",
      currency: "VND",
    }).format(value);
  };
  