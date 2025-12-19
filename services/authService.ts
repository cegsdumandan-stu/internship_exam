import { LoginResponse } from '../types';

const API_URL = 'http://localhost:8000/api';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Attempt to fetch from the actual backend at http://localhost:8000/api/login
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        // If the backend responds with an error (e.g. 401), parse it
        const errorData = await response.json();
        return {
            success: false,
            message: errorData.message || 'Authentication failed'
        };
    }

    const data = await response.json();
    return {
      success: true,
      user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          token: data.token
      }
    };

  } catch (error) {
    console.warn("Backend not reachable. Falling back to mock implementation for demo purposes.");
    
    // FALLBACK MOCK IMPLEMENTATION
    // This allows the UI to function in the preview environment where localhost:8000 is unavailable.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    if (email === 'admin@test.com' && password === '123456789') {
      return {
        success: true,
        user: {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User Test',
          token: 'mock-jwt-token-12345'
        }
      };
    }

    return {
      success: false,
      message: 'Invalid email or password'
    };
  }
};