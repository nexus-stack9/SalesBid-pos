import Cookies from 'js-cookie';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Define Product interface based on the API response
export interface Product {
  'Product ID': number;
  'Seller ID': number;
  'Product Name': string;
  'Product Description': string;
  'Starting Price': string;
  'Category ID': number;
  'Auction Start': string;
  'Auction End': string;
  'Product Status': string;
  'Created At': string;
  'Retail Value': string;
  'Location': string;
  'Shipping': string;
  'Quantity': number;
  'Image Path': string | null;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: Product[];
}

/**
 * Fetches all products from the API
 * @returns Promise with the products data
 */
export const fetchProducts = async (): Promise<{ data: Product[]; count: number }> => {
  try {
    const token = Cookies.get('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/global/getAllProducts?formName=productForm`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }

    const result: ApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to fetch products');
    }

    return {
      data: result.data,
      count: result.count,
    };
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    throw error;
  }
};

/**
 * Decodes a JWT token and extracts the payload
 * @param token The JWT token to decode
 * @returns The decoded payload as an object
 */
const decodeJwtToken = (token: string) => {
  try {
    // JWT tokens are split into three parts: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Gets the user ID from the JWT token stored in cookies
 * @returns The user ID from the token, or null if not found
 */
export const getUserIdFromToken = (): string | null => {
  try {
    const token = Cookies.get('authToken');
    if (!token) {
      return null;
    }
    
    const decodedToken = decodeJwtToken(token);
    // Assuming the user ID is stored in the 'sub' or 'userId' field
    // Adjust this based on your actual token structure
    return decodedToken?.sub || decodedToken?.userId || null;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
};
