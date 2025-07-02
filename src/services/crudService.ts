/* eslint-disable @typescript-eslint/no-explicit-any */
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

interface InsertRecordResponse {
  success: boolean;
  message?: string;
  data?: any;
  id?: string | number;
}

interface GetRecordResponse {
  success: boolean;
  data?: any;
  message?: string;
}

interface GetAllProductsResponse extends GetRecordResponse {
  data?: any[];
}

/**
 * Inserts a new record using the global insert endpoint
 * @param formName The name of the form/table to insert into
 * @param data The data to insert
 * @returns Promise with the insert result
 */
export const insertRecord = async <T>(
  formName: string,
  data: T
): Promise<InsertRecordResponse> => {
  try {
    const token = Cookies.get('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/global/insert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        formName,
        ...data
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error inserting record: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in insertRecord:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to insert record'
    };
  }
};

/**
 * Fetches all products for a specific form
 * @param formName The name of the form/table to fetch products from
 * @returns Promise with the products data
 */
export const getAllProducts = async (formName: string): Promise<GetAllProductsResponse> => {
  try {
    const token = Cookies.get('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/global/getAllRecords?formName=${encodeURIComponent(formName)}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error fetching products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch products',
    };
  }
}

/**
 * Fetches a single record by ID
 * @param formName The name of the form/table to fetch from
 * @param id The ID of the record to fetch
 * @returns Promise with the record data
 */
export const getRecordById = async (
  formName: string,
  id: string | number
): Promise<GetRecordResponse> => {
  try {
    console.log('getRecordById called with:', { formName, id });
    const token = Cookies.get('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No auth token found');
    }

    const url = new URL(`${API_BASE_URL}/global/getById`);
    url.searchParams.append('formName', formName);
    url.searchParams.append('id', id.toString());
    
    console.log('Making API call to:', url.toString());
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });
    
    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error fetching record: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getRecordById:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch record',
    };
  }
};

/**
 * Updates an existing record
 * @param formName The name of the form/table to update in
 * @param data The data to update, must include the record ID
 * @returns Promise with the update result
 */
export const updateRecord = async <T>(
  formName: string,
  data: T & { id?: string | number }
): Promise<InsertRecordResponse> => {
  try {
    console.log('updateRecord called with:', { formName, data });
    const token = Cookies.get('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No auth token found for update operation');
    }

    // Ensure the data includes the formName and updated_at
    const payload = {
      ...data,
      formName,
      // Log the ID to ensure it's preserved
      _debug_id: data.id,
      updated_at: new Date().toISOString()
    };

    console.log('Making update API call with payload:', payload);
    const response = await fetch(`${API_BASE_URL}/global/update`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    console.log('Update API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error updating record: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateRecord:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update record',
    };
  }
};

/**
 * Deletes a record by ID
 * @param formName The name of the form/table to delete from
 * @param id The ID of the record to delete
 * @returns Promise with the delete result
 */
export const deleteRecord = async (
  formName: string,
  id: string | number
): Promise<InsertRecordResponse> => {
  try {
    console.log('deleteRecord called with:', { formName, id });
    const token = Cookies.get('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No auth token found for delete operation');
    }

    const url = new URL(`${API_BASE_URL}/global/delete`);
    url.searchParams.append('formName', formName);
    url.searchParams.append('id', id.toString());
    
    console.log('Making delete API call to:', url.toString());
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers,
    });
    
    console.log('Delete API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error deleting record: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteRecord:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete record',
    };
  }
};