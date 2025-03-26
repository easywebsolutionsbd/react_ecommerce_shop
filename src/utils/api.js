const API_URL = ' https://mern-ecommerce-shop-mlbi.onrender.com/api';

// Helper function for making API requests
const fetchApi = async (endpoint, options = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get login and register status
  if(endpoint === '/users/login'){
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
    });
    const result = await response.json();
    return { data: result };
  }
  
  if(endpoint === '/users/register'){
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
    });
    const result = await response.json();
    return { data: result };
  }
  
  // Handle different endpoints 
  if (endpoint === '/products' || endpoint.startsWith('/products?')) {
    const response = await fetch(`${API_URL}${endpoint}`);
    const result = await response.json();

    return { data: result };
  }
  
  if (endpoint.startsWith('/products/')) {
    const response = await  fetch(`${API_URL}${endpoint}`);
    const product = await response.json();

    if (!product.data) {
      throw new Error('Product not found');
    }
    return { data: product.data };
  }
  
  if (endpoint === '/users/me') {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
    });
    const result = await response.json();

    return { data: result };
  }
  
  if (endpoint === '/cart' && options.method === 'GET') {
    const product = await fetch(`${API_URL}${endpoint}`, options);
    const productData = await product.json();


    return { data: productData.data };
  }
    
  if (endpoint === '/cart' && options.method === 'POST') {
    const product = await fetch(`${API_URL}${endpoint}`, options);
    const productData = await product.json();

    return { data: productData.data };
  }

  if (endpoint.startsWith('/cart/') && options.method === 'PUT') {
    const product = await fetch(`${API_URL}${endpoint}`, options);
    const productData = await product.json();
    return { data: productData };
  }

  if (endpoint.startsWith('/cart/') && options.method === 'DELETE') {
    const product = await fetch(`${API_URL}${endpoint}`, options);
    const productData = await product.json();
    return { data: productData };
  }
  if (endpoint.endsWith('/cart') && options.method === 'DELETE') {
    const product = await fetch(`${API_URL}${endpoint}`, options);
    const productData = await product.json();
    return { data: productData };
  }
  
  if (endpoint === '/users/wishlist' && options.method === 'GET') {
    const products = await fetch(`${API_URL}${endpoint}`, options);
    const productsData = await products.json();
    return { data: productsData };
  }
  
  if (endpoint.startsWith('/users/wishlist/') && options.method === 'PUT') {
    const product = await fetch(`${API_URL}${endpoint}`, options);
    const productData = await product.json();
    return { data: productData };
  }
  
  if (endpoint.startsWith('/users/wishlist/') && options.method === 'DELETE') {
    const product = await fetch(`${API_URL}${endpoint}`, options);
    const productData = await product.json();
    return { data: productData };
  }
  
  if (endpoint === '/users/compare' && options.method === 'GET') {
    const compare = await fetch(`${API_URL}${endpoint}`, options);  
    const compareData = await compare.json();
    return { data: compareData };
  }
  
  if (endpoint.startsWith('/users/compare/') && options.method === 'PUT') {
    const product = await fetch(`${API_URL}${endpoint}`, options);
    const productData = await product.json();

    return productData;
  }
  
  if (endpoint.startsWith('/users/compare/') && options.method === 'DELETE') {
    const product = await fetch(`${API_URL}${endpoint}`, options);
    const productData = await product.json();

    return { data: productData };
  }
  
  if (endpoint === '/orders' && options.method === 'POST') {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    return { data: result };
  }
  
  if (endpoint === '/orders' && options.method === 'GET') {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    return { data: result };
  }
  
  if (endpoint.startsWith('/orders/')) {
    const order = await fetch(`${API_URL}${endpoint}`, options);  
    const orderData = await order.json();
    return { data: orderData };
  }
  
  // Default fallback
  return { data: options };
};

// Get login and register page status
export const getLoginPageStatus = async () => {
  const response = await fetchApi('/users/login');
  return response;
};

export const getRegisterPageStatus = async () => {
  const response = await fetchApi('/users/register');
  return response;
};

// Auth API calls
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(userData),
    headers : {
      'Content-type' : 'application/json; charset=UTF-8'
    }
  });

  return response;
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      credentials: 'include', 
      body: JSON.stringify(userData),
      headers : {
        'Content-type' : 'application/json; charset=UTF-8'
      }
    });

    const result = await response.json();

    return result;
};

export const logoutUser = async () => {
  const response = await fetch(`${API_URL}/users/logout`, {
    method: 'GET',
    credentials: 'include',
  });

};

export const getUser = async () => {
  try {
    const data = await fetchApi('/users/me');

    return data;
  } catch (error) {
    return null;
  }
};

// Product API calls
export const getProducts = async (query = '') => {
  const data = await fetchApi(`/products${query}`);
  return data.data;
};

export const getProduct = async (id) => {
  const data = await fetchApi(`/products/${id}`);
  return data.data;
};

export const searchProducts = async (query) => {
  const data = await fetch(`${API_URL}/products/search?query=${query}`);
  const result = await data.json();
  console.log('result : ', result);
  return result;
};

// Wishlist API calls
export const getWishlist = async () => {
  const data = await fetchApi('/users/wishlist', {
    method : 'GET',
    credentials : 'include',
  });
  console.log('data : ', data);
  return data.data;
};

export const addToWishlist = async (productId) => {
  const data = await fetchApi(`/users/wishlist/${productId}`, {
    method: 'PUT',
    credentials : 'include',
  });

  return data.data;
};

export const removeFromWishlist = async (productId) => {
  const data = await fetchApi(`/users/wishlist/${productId}`, {
    method: 'DELETE',
    credentials : 'include',
  });

  return data.data;
};

// Compare API calls
export const getCompareList = async () => {
  const data = await fetchApi('/users/compare', {
    method : 'GET',
    credentials : 'include',
  });

  return data.data;
};

export const addToCompareList = async (productId) => {
  const data = await fetchApi(`/users/compare/${productId}`, {
    method: 'PUT',
    credentials : 'include',
  });

  return data.data;
};

export const removeFromCompareList = async (productId) => {
  const data = await fetchApi(`/users/compare/${productId}`, {
    method: 'DELETE',
    credentials : 'include',
  });

  return data.data;
};

// Cart API calls
export const getCart = async () => {
  try {
    const data = await fetchApi('/cart', {
      method : 'GET',
      credentials : 'include',
    });
    return data.data;
  } catch (error) {
    return { items: [], totalPrice: 0 };
  }
};

export const addToCart = async (productId, quantity) => {
  const data = await fetchApi('/cart', {
    method: 'POST',
    credentials : 'include',
    body: JSON.stringify({ productId, quantity }),
    headers : {
      'Content-type' : 'application/json; charset=UTF-8'
    }
  });
  console.log("ont data", data.data);	
  return data.data;
};

export const updateCartItem = async (productId, quantity) => {
  const data = await fetchApi(`/cart/${productId}`, {
    method: 'PUT',
    credentials : 'include',
    body: JSON.stringify({ quantity }),
    headers : {
      'Content-type' : 'application/json; charset=UTF-8'
    }
  });

  return data.data;
};

export const removeFromCart = async (productId) => {
  const data = await fetchApi(`/cart/${productId}`, {
    method: 'DELETE',
    credentials : 'include',
  });

  return data.data;
};

export const clearCart = async () => {
  const data = await fetchApi('/cart', {
    method: 'DELETE',
    credentials : 'include',
  });
  return data.data;
};

// Order API calls
export const createOrder = async (orderData) => {
  const data = await fetchApi('/orders', {
    method: 'POST',
    credentials : 'include',
    body: JSON.stringify(orderData),
    headers : {
      'Content-type' : 'application/json; charset=UTF-8'
    }
  });

  return data.data;
};

export const getOrders = async () => {
  const data = await fetchApi('/orders', {
    method : 'GET',
    credentials : 'include',
  });
  return data.data;
};

export const getOrder = async (id) => {
  const data = await fetchApi(`/orders/${id}`, {
    method : 'GET',
    credentials : 'include',
  });
  return data.data;
};

export const updateOrderToPaid = async (id, paymentResult) => {
  const data = await fetchApi(`/orders/${id}/pay`, {
    method: 'PUT',
    body: JSON.stringify(paymentResult),
  });
  return data.data;
};

// bKash payment processing
export const processBkashPayment = async (phoneNumber, amount, orderId) => {
  try {
    // In a real implementation, this would call the bKash payment API
    // For now, we'll simulate a successful payment after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock response similar to what a real bKash API might return
    return {
      success: true,
      transactionId: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      paymentId: orderId,
      amount: amount,
      phoneNumber: phoneNumber,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('bKash payment error:', error);
    throw new Error('Failed to process bKash payment. Please try again.');
  }
}; 