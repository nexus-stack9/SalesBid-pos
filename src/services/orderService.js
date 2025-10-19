// services/orderService.js
import axios from "axios";
import CryptoJS from 'crypto-js';
import Cookies from "js-cookie"; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const getAllOrderMatrixByVendorId = async (vendorId) => {
  try {
    const url = `${API_BASE_URL}/pos/getAllOrderMatrixByVendorId/${vendorId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching order matrix:', error);
    throw error;
  }
};

export const getAllOrderByVendorId = async (vendorId) => {
  try {
    const url = `${API_BASE_URL}/pos/getAllOrderByVendorId/${vendorId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const url = `${API_BASE_URL}/pos/updateOrderStatus`;
    const response = await axios.put(url, { orderId, status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const bulkUpdateOrderStatus = async (orderIds, status) => {
  try {
    const url = `${API_BASE_URL}/pos/bulkUpdateOrderStatus`;
    const response = await axios.put(url, { orderIds, status });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating orders:', error);
    throw error;
  }
};

export const exportOrders = async (orderIds, format) => {
  try {
    const url = `${API_BASE_URL}/pos/exportOrders`;
    const response = await axios.post(url, { orderIds, format }, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting orders:', error);
    throw error;
  }
};