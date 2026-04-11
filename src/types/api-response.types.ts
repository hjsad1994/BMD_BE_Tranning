// Standard API response wrappers used across all controllers.
// tsoa reads these interfaces to generate Swagger response schemas.

export interface ApiResponse<T> {
    success: true
    message: string
    data: T
}

export interface ApiMessageResponse {
    success: true
    message: string
}

export interface ApiErrorResponse {
    success: false
    message: string
}

// ── Domain response shapes ────────────────────────────────────────────────────

export interface StaffResponse {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
    address: string | null
    avatar: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
}

export interface CustomerResponse {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
    address: string | null
    avatar: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
}

export interface CategoryResponse {
    id: number
    name: string
    description: string | null
    status: 'active' | 'inactive'
    created_at: Date
    updated_at: Date
}

export interface ProductResponse {
    id: number
    name: string
    description: string | null
    price: number
    image_url: string | null
    status: 'active' | 'inactive'
    category: {
        id: number
        name: string
    } | null
    created_at: Date
    updated_at: Date
}

export interface OrderItemResponse {
    id: number
    product_id: number
    product_name: string
    product_image: string | null
    quantity: number
    price: number
}

export interface OrderResponse {
    id: number
    customer_id: number
    total_amount: number
    status: string
    shipping_address: string | null
    created_at: Date
    updated_at: Date
}

export interface OrderDetailResponse extends OrderResponse {
    items: OrderItemResponse[]
}

export interface CreatedOrderResponse {
    id: number
    total_amount: number
    status: string
}

export interface StaffLoginResponse {
    token: string
    staff: StaffResponse
}

export interface CustomerLoginResponse {
    token: string
    customer: CustomerResponse
}

export interface CreatedIdResponse {
    id: number
    username: string
    email: string
}

export interface CreatedProductResponse {
    productId: number
    name: string
}

export interface CreatedCategoryResponse {
    categoryId: number
    name: string
}

export interface ImageUrlResponse {
    image_url: string
}




export interface PaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface ProductListResponse {
    products: ProductResponse[]
    pagination: PaginationMeta
}

export interface StaffListResponse {
    staff: StaffResponse[]
    pagination: PaginationMeta
}

export interface CategoryListResponse {
    categories: CategoryResponse[]
    pagination: PaginationMeta
}

export interface OrderListResponse {
    orders: OrderResponse[]
    pagination: PaginationMeta
}

export interface CustomerListResponse {
    customers: CustomerResponse[]
    pagination: PaginationMeta
}
