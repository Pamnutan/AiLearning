import axios from "axios";
const api = axios.create({

  baseURL:
    "http://localhost:5000/api"

});


api.interceptors.request.use(
  config => {

    const token =
      localStorage.getItem(
        "token"
      );


    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }


    return config;
  }
);


export default api;

export const storeService = {
  getAllStores: () => api.get("/stores"),
  getStore: (id) => api.get(`/stores/${id}`),
  createStore: (data) => api.post("/stores", data),
  updateStore: (id, data) => api.put(`/stores/${id}`, data),
};

export const productService = {
  getProducts: (params) => api.get("/products", { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const wishlistService = {
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (data) => api.post("/wishlist", data),
  removeFromWishlist: (id) => api.delete(`/wishlist/item/${id}`),
};

export const orderService = {
  createOrder: (data) => api.post("/orders", data),
  getMyOrders: () => api.get("/orders"),
  getVendorOrders: () => api.get("/orders/vendor"),
  updateOrderItemStatus: (itemId, status) => api.put(`/orders/item/${itemId}`, { status }),
};


// import axios from "axios";

// const api = axios.create({
//   baseURL:
//     "http://localhost:5000/api"
// });

// export default api;
