/* eslint-disable no-useless-catch */
import CryptoJS from 'crypto-js';
import Cookies from "js-cookie"; 
interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

interface LoginUserData {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  contact: string; // Can be either email or phone number
}

interface ResetPasswordData {
  user_id: string;
  password: string;
}

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const encryptPassword = (password: string) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing VITE_SECRET_KEY for password encryption');
  }
  return CryptoJS.AES.encrypt(password, secretKey).toString();
};

export const registerUser = async (userData: RegisterUserData) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const encryptedUserData = {
      ...userData,
      password: encryptPassword(userData.password)
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedUserData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (userData: LoginUserData) => {
  try {
    const encryptedUserData = {
      email: userData.email,
      password: encryptPassword(userData.password)
    };

    const response = await fetch(`${API_BASE_URL}/auth/vendorLogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedUserData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.error || 'Login failed';
      throw new Error(errorMessage);
    }

    // Persist tokens/cookies for route protection
    const accessToken = data.accessToken || data.token || data.authToken;
    if (accessToken) {
      Cookies.set('authToken', accessToken, { expires: 7 });
      localStorage.setItem('isAuthenticated', 'true');
    }
    if (data.refreshToken) {
      Cookies.set('refreshToken', data.refreshToken, { expires: 14 });
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred during login');
  }
};

export const forgotPassword = async (data: ForgotPasswordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/password/request-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to process forgot password request');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (data: ResetPasswordData) => {
  try {
    const encryptedData = {
      user_id: data.user_id,
      password: encryptPassword(data.password)
    };

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedData),
    });

    if (!response.ok) {
      throw new Error('Password reset failed');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();

    // Persist tokens/cookies consistently for route protection
    const accessToken = data.accessToken || data.token || data.authToken;
    if (accessToken) {
      Cookies.set('authToken', accessToken, { expires: 7 });
      Cookies.set('accessToken', accessToken, { expires: 7 }); // keep for compatibility
      localStorage.setItem('isAuthenticated', 'true');
    }
    if (data.refreshToken) {
      Cookies.set('refreshToken', data.refreshToken, { expires: 14 });
    }

    return data;

  } catch (error) {
    console.error("Error during Google Login:", error);
    throw error;
  }
}   
