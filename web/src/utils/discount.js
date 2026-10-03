/**
 * Utility functions for handling and displaying promotional discounts
 */

/**
 * Returns today's date in the user's local timezone formatted as YYYY-MM-DD
 */
export const getLocalTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Returns a future date string in the user's local timezone formatted as YYYY-MM-DD
 */
export const getFutureDateString = (daysAhead = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Validates whether a discount is currently active based on status, value, and expiration
 */
export const isDiscountActive = (discount) => {
  if (!discount) return false;
  if (discount.status && discount.status.toLowerCase() !== "active") return false;
  
  const val = Number(discount.discountValue);
  if (isNaN(val) || val <= 0) return false;
  if (!discount.endDate) return false;

  const todayStr = getLocalTodayString();
  const endStr = String(discount.endDate).slice(0, 10);

  // If discount has expired, it is not active
  if (todayStr > endStr) return false;

  return true;
};

/**
 * Calculates final discounted price for a product
 */
export const calculateFinalPrice = (product) => {
  if (!product) return 0;
  const basePrice = Number(product.price) || 0;
  if (!product.discount || !isDiscountActive(product.discount)) {
    return basePrice;
  }
  const disc = product.discount;
  const val = Number(disc.discountValue) || 0;
  if (disc.discountType === "Percentage") {
    return Math.max(0, basePrice * (1 - val / 100));
  } else {
    return Math.max(0, basePrice - val);
  }
};

/**
 * Formats badge text for discount, e.g. "50% OFF" or "Rs. 100 OFF"
 */
export const formatDiscountBadgeText = (discount) => {
  if (!discount) return "";
  const val = Number(discount.discountValue) || 0;
  if (discount.discountType === "Percentage") {
    return `${val}% OFF`;
  }
  return `Rs. ${val} OFF`;
};

/**
 * Enriches product list with discounts from discounts list if product.discount is not directly present
 */
export const attachDiscounts = (products = [], discounts = []) => {
  if (!Array.isArray(products)) return [];
  if (!Array.isArray(discounts) || discounts.length === 0) {
    return products.map((product) => {
      if (product.discount && isDiscountActive(product.discount)) {
        return product;
      }
      return { ...product, discount: null };
    });
  }

  return products.map((product) => {
    // Look for matching active discount in discounts array
    const matched = discounts.find((d) => {
      if (!isDiscountActive(d)) return false;
      if (product.discountId && d.id === product.discountId) return true;
      if (d.products && Array.isArray(d.products)) {
        return d.products.some((p) => p && p.id === product.id);
      }
      return false;
    });

    if (matched) {
      return {
        ...product,
        discountId: matched.id,
        discount: {
          id: matched.id,
          title: matched.title,
          discountType: matched.discountType,
          discountValue: matched.discountValue,
          startDate: matched.startDate,
          endDate: matched.endDate,
          status: matched.status,
        },
      };
    }

    if (product.discount && isDiscountActive(product.discount)) {
      return product;
    }

    return { ...product, discount: null };
  });
};
