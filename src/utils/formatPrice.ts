export const formatPrice = (price: number) => {
    return Intl.NumberFormat("vi-VN", {
      currency: "VND",
    }).format(price);
  };