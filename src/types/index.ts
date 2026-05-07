export type ProductVariantItem = {
  label: string;
  price: number;
};

export type ProductDTO = {
  _id: string;
  name: string;
  description: string;
  price: number;
  /** Present when product is linked to admin Categories — keeps name in sync on rename */
  categoryId?: string;
  category: string;
  image: string;
  isVeg: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isChefSpecial?: boolean;
  isSignatureDish?: boolean;
  isFamousDish?: boolean;
  /** Pizza sizes / types — agar khali hai to sirf `price` use hota hai */
  variants?: ProductVariantItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type OrderStatus = "pending" | "accepted" | "rejected" | "delivered";

export type OrderItemDTO = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type OrderDTO = {
  _id: string;
  /** Public order id for tracking URL */
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItemDTO[];
  totalAmount: number;
  appliedOffer?: any;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type PlaceOrderPayload = {
  items: OrderItemDTO[];
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerAddress: string;
  password?: string;
  offerId?: string;
};

export type CategoryDTO = {
  _id: string;
  name: string;
  sortOrder: number;
  image: string;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ReviewDTO = {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ReservationDTO = {
  _id: string;
  trackId: string;
  fullName: string;
  phone: string;
  reservationDate: string;
  reservationTime: string;
  guests: number;
  notes?: string;
  adminNote?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
};

export type CartLine = {
  /** Unique per cart row (product + variant label) */
  key: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  isVeg?: boolean;
};

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
};
