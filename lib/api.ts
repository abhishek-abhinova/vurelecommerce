const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  is_admin: boolean
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Product {
  id: number
  name: string
  description?: string
  category: string
  price: number
  original_price?: number
  stock: number
  status: string
  image_url?: string
  colors?: { name: string; value: string }[]
  sizes?: string[]
  gallery_images?: string[]
  video_url?: string
  is_featured?: boolean
  created_at: string
}

export interface Order {
  id: number
  customer_id: number
  customer_name: string
  customer_email: string
  total: number
  status: string
  items: any[]
  created_at: string
}

export interface DashboardStats {
  total_revenue: number
  total_orders: number
  total_products: number
  total_customers: number
  recent_orders: Array<{
    id: number
    customer: string
    email: string
    total: number
    status: string
  }>
}

export interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  created_at: string
  total_orders: number
  total_spent: number
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

// Set auth token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("token", token)
}

// Remove auth token from localStorage
export function removeAuthToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  return userStr ? JSON.parse(userStr) : null
}

// Set current user in localStorage
export function setCurrentUser(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

// Remove current user from localStorage
export function removeCurrentUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("user")
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "An error occurred" }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Authentication API
export const authAPI = {
  register: async (data: {
    first_name: string
    last_name: string
    email: string
    password: string
  }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
    setAuthToken(response.access_token)
    setCurrentUser(response.user)
    return response
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
    setAuthToken(response.access_token)
    setCurrentUser(response.user)
    return response
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>("/api/auth/me")
  },

  logout: (): void => {
    removeAuthToken()
    removeCurrentUser()
  },
}

// Admin Products API
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    return apiRequest<Product[]>("/api/admin/products")
  },

  create: async (data: {
    name: string
    description?: string
    category: string
    price: number
    stock: number
    image_url?: string
    colors?: { name: string; value: string }[]
    sizes?: string[]
    gallery_images?: string[]
    video_url?: string
  }): Promise<Product> => {
    return apiRequest<Product>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    return apiRequest<Product>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/api/admin/products/${id}`, {
      method: "DELETE",
    })
  },
}

// Admin Orders API
export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    return apiRequest<Order[]>("/api/admin/orders")
  },

  update: async (id: number, data: { status: string }): Promise<Order> => {
    return apiRequest<Order>(`/api/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
}

// Admin Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    return apiRequest<DashboardStats>("/api/admin/dashboard")
  },
}

// Admin Customers API
export const customersAPI = {
  getAll: async (): Promise<Customer[]> => {
    return apiRequest<Customer[]>("/api/admin/customers")
  },
}

// Public Products API
export const publicProductsAPI = {
  getAll: async (): Promise<Product[]> => {
    return apiRequest<Product[]>("/api/products")
  },

  getById: async (id: number): Promise<Product> => {
    return apiRequest<Product>(`/api/products/${id}`)
  },
}

// Public Orders API
export const publicOrdersAPI = {
  create: async (data: {
    customer_id: number
    items: any[]
    total: number
    shipping_address: string
    payment_method: string
  }): Promise<Order> => {
    return apiRequest<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
}

// User Orders API
export const userOrdersAPI = {
  getAll: async (): Promise<Order[]> => {
    return apiRequest<Order[]>("/api/user/orders")
  },

  getById: async (id: number): Promise<Order> => {
    return apiRequest<Order>(`/api/user/orders/${id}`)
  },
}

// Category interface
export interface Category {
  id: number
  name: string
  description?: string
  parent_id?: number | null
  parent_name?: string
  is_active: boolean
  subcategories?: Category[]
  created_at: string
}

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    return apiRequest<Category[]>("/api/categories")
  },

  getGrouped: async (): Promise<Category[]> => {
    return apiRequest<Category[]>("/api/categories/grouped")
  },

  adminGetAll: async (): Promise<Category[]> => {
    return apiRequest<Category[]>("/api/admin/categories")
  },

  create: async (data: { name: string; description?: string; parent_id?: number | null }): Promise<Category> => {
    return apiRequest<Category>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: Partial<Category>): Promise<void> => {
    return apiRequest<void>(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/api/admin/categories/${id}`, {
      method: "DELETE",
    })
  },
}

// Sale Banner Settings
export interface SaleBannerSettings {
  enabled: boolean
  text: string
  end_date: string
}

export interface HeroSlide {
  title: string
  subtitle: string
  description: string
  image: string
  cta: string
  href: string
}

export interface HeroSettings {
  slides: HeroSlide[]
  recommended_size: string
}

export interface ScrollingTextSettings {
  enabled: boolean
  text: string
}

export const settingsAPI = {
  getSaleBanner: async (): Promise<SaleBannerSettings> => {
    return apiRequest<SaleBannerSettings>("/api/settings/sale-banner")
  },

  updateSaleBanner: async (data: SaleBannerSettings): Promise<void> => {
    return apiRequest<void>("/api/admin/settings/sale-banner", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  getHero: async (): Promise<HeroSettings> => {
    return apiRequest<HeroSettings>("/api/settings/hero")
  },

  updateHero: async (data: HeroSettings): Promise<void> => {
    return apiRequest<void>("/api/admin/settings/hero", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  getScrollingText: async (): Promise<ScrollingTextSettings> => {
    return apiRequest<ScrollingTextSettings>("/api/settings/scrolling-text")
  },

  updateScrollingText: async (data: ScrollingTextSettings): Promise<void> => {
    return apiRequest<void>("/api/admin/settings/scrolling-text", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // Our Story
  getOurStory: async (): Promise<{ enabled: boolean; title: string; description: string; video_url: string }> => {
    return apiRequest("/api/settings/our-story")
  },

  updateOurStory: async (data: { enabled: boolean; title: string; description: string; video_url: string }): Promise<void> => {
    return apiRequest<void>("/api/admin/settings/our-story", { method: "PUT", body: JSON.stringify(data) })
  },

  // Testimonials
  getTestimonials: async (): Promise<{ enabled: boolean; title: string; videos: { name: string; video_url: string; thumbnail?: string }[] }> => {
    return apiRequest("/api/settings/testimonials")
  },

  updateTestimonials: async (data: { enabled: boolean; title: string; videos: { name: string; video_url: string; thumbnail?: string }[] }): Promise<void> => {
    return apiRequest<void>("/api/admin/settings/testimonials", { method: "PUT", body: JSON.stringify(data) })
  },

  // Shop The Look
  getShopTheLook: async (): Promise<{ enabled: boolean; title: string; product_ids: number[] }> => {
    return apiRequest("/api/settings/shop-the-look")
  },

  updateShopTheLook: async (data: { enabled: boolean; title: string; product_ids: number[] }): Promise<void> => {
    return apiRequest<void>("/api/admin/settings/shop-the-look", { method: "PUT", body: JSON.stringify(data) })
  },
}

// Featured Products API
export const featuredProductsAPI = {
  getAll: async (): Promise<Product[]> => {
    return apiRequest<Product[]>("/api/featured-products")
  },

  setFeatured: async (productId: number, isFeatured: boolean): Promise<void> => {
    return apiRequest<void>(`/api/admin/products/${productId}/featured`, {
      method: "PUT",
      body: JSON.stringify({ is_featured: isFeatured }),
    })
  },
}

// Collection interface
export interface Collection {
  id: number
  title: string
  description?: string
  cover_image?: string
  format_type: 'short' | 'long'
  is_active: boolean
  show_on_home: boolean
  display_order: number
  product_count: number
  products?: Product[]
  created_at: string
}

// Collections API
export const collectionsAPI = {
  getHome: async (): Promise<Collection[]> => {
    return apiRequest<Collection[]>("/api/collections")
  },

  getById: async (id: number): Promise<Collection> => {
    return apiRequest<Collection>(`/api/collections/${id}`)
  },

  adminGetAll: async (): Promise<Collection[]> => {
    return apiRequest<Collection[]>("/api/admin/collections")
  },

  create: async (data: { title: string; description?: string; cover_image?: string; format_type?: string }): Promise<{ id: number }> => {
    return apiRequest<{ id: number }>("/api/admin/collections", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: Partial<Collection>): Promise<void> => {
    return apiRequest<void>(`/api/admin/collections/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/api/admin/collections/${id}`, {
      method: "DELETE",
    })
  },

  getProducts: async (id: number): Promise<Product[]> => {
    return apiRequest<Product[]>(`/api/admin/collections/${id}/products`)
  },

  setProducts: async (id: number, productIds: number[]): Promise<void> => {
    return apiRequest<void>(`/api/admin/collections/${id}/products`, {
      method: "PUT",
      body: JSON.stringify({ product_ids: productIds }),
    })
  },
}
