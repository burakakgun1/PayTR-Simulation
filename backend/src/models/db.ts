export type OrderStatus = 'CREATED' | 'PAYMENT_PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface OrderItem {
    name: string;
    price: number; // Kuruş
    quantity: number;
}

export interface Order {
    id: string;
    user_email: string;
    total_amount: number; // Kuruş
    items: OrderItem[];
    status: OrderStatus;
    createdAt: Date;
}

export interface Product {
    id: string;
    name: string;
    price: number; // TL (float) for easy management, converted to Kurus when needed
    stock: number;
    image: string;
}

// Global In-Memory Store
export const db = {
    orders: new Map<string, Order>(),
    products: new Map<string, Product>([
        ['1', {
            id: '1',
            name: 'Premium Wireless Headphones',
            price: 1500.00,
            stock: 10,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
        }],
        ['2', {
            id: '2',
            name: 'Apple Keyboard',
            price: 850.50,
            stock: 5,
            image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop'
        }],
        ['3', {
            id: '3',
            name: 'Ultra HDR Smart Watch',
            price: 2200.00,
            stock: 3,
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop'
        }],
        ['4', {
            id: '4',
            name: 'Macbook Monitor',
            price: 450.00,
            stock: 15,
            image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop'
        }]
    ])
};
