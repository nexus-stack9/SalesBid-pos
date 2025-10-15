import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Get all products by vendorId


export const getAllProductsByVendorId = async (vendorId) => {
  try {
    console.log('🚀 posCrud: getAllProductsByVendorId called with vendorId:', vendorId);
    console.log('🌐 posCrud: API_BASE_URL:', API_BASE_URL);
    const url = `${API_BASE_URL}/pos/getAllProductsByVendorId/${vendorId}`;
    console.log('📡 posCrud: Making request to:', url);

    const response = await axios.get(url);
    console.log('✅ posCrud: Response received:', response);
    return response;
  } catch (error) {
    console.error('❌ posCrud: getAllProductsByVendorId failed:', error);
    console.error('❌ posCrud: Error response:', error.response);
    throw error;
  }
};


export const getAllVendors = async () => {
  return axios.get(`${API_BASE_URL}/pos/getAllVendor`);
};


export const updateVendorStatus = async (vendorId, status,justification) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/pos/updateVendorStatus/${vendorId}/status/${status}/justification/${justification}`)
    return response.data;
  } catch (error) {
    console.error("Error updating vendor status:", error);
    throw error.response ? error.response.data : error;
  }
};

// Create product
export const addProduct = async (productData) => {
  return axios.post(API_BASE_URL, productData);
};

// Update product
export const updateProduct = async (id, productData) => {
  return axios.put(`${API_BASE_URL}/${id}`, productData);
};

// Delete product
export const deleteProduct = async (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};
