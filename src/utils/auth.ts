import Cookies from 'js-cookie';

export const getToken = (): string | null => {
  return Cookies.get('authToken') || null;
};

export const getUserRole = (): string | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const hasRole = (requiredRole: string): boolean => {
  const userRole = getUserRole();
  return userRole === requiredRole;
};

export const isAdmin = (): boolean => {
  return hasRole('salesbidadmin');
};

export interface UserData {
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: string | number | boolean | undefined;
}

export const getUserDataFromToken = (): UserData | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      ...payload // Include any other fields from the token
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getVendorIdFromToken = (): string | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.vendorId || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
