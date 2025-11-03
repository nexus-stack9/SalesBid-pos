import axios from "axios";
import CryptoJS from 'crypto-js';
import Cookies from "js-cookie"; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Get all products by vendorId



const encryptPassword = (password) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing VITE_SECRET_KEY for password encryption');
  }
  return CryptoJS.AES.encrypt(password, secretKey).toString();
};


export const getAllProductsByVendorId = async (vendorId) => {
  try {
    const url = `${API_BASE_URL}/pos/getAllProductsByVendorId/${vendorId}`;

    const response = await axios.get(url);
    return response;
  } catch (error) {
    
    throw error;
  }
};

export const getVendorById = async (vendorId) => {
  try {
    const url = `${API_BASE_URL}/pos/getVendorById/${vendorId}`;

    const response = await axios.get(url);
    return response;
  } catch (error) {
    
    throw error;
  }
};

export const getAllmatrixByVendorId = async (vendorId) => {
  try {
    const url = `${API_BASE_URL}/pos/getAllmatrixByVendorId/${vendorId}`;

    const response = await axios.get(url);
    return response;
  } catch (error) {
    
    throw error;
  }
};

export const getAllOrderMatrixByVendorId = async (vendorId) => {
  try {
    const url = `${API_BASE_URL}/pos/getAllOrderMatrixByVendorId/${vendorId}`;

    const response = await axios.get(url);
    return response;
  } catch (error) {
    
    throw error;
  }
};

export const getAllOrderByVendorId = async (vendorId) => {
  try {
    const url = `${API_BASE_URL}/pos/getAllOrderByVendorId/${vendorId}`;

    const response = await axios.get(url);
    return response;
  } catch (error) {
    
    throw error;
  }
};


export const getAllVendors = async () => {
  return axios.get(`${API_BASE_URL}/pos/getAllVendor`);
};


export const updateVendorActiveStatus = async (vendorId, status) => {
   try {
    const response = await axios.put(
      `${API_BASE_URL}/pos/updateVendorActiveStatus`, // 👈 No params in URL now
      { vendorId, status } // 👈 Send data in body instead
    );
    return response.data;
  } catch (error) {
    console.error("Error updating vendor status:", error);
    throw error.response ? error.response.data : error;
  }
};

export const updateVendorStatus = async (vendorId,status,justification) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/pos/updateVendorStatus`, // 👈 No params in URL now
      { vendorId, status,justification } // 👈 Send data in body instead
    );
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
