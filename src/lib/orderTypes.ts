export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderDoc {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  academicYear: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: number;
}