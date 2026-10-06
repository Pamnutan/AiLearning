import { useEffect, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  X,
  Loader2,
  Boxes,
} from "lucide-react";

import api from "../services/api";

function Products() {
  const emptyForm = {
    name: "",
    price: "",
    category: "",
    stock: "",
  };

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // ============================================
  // FETCH PRODUCTS
  // ============================================

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data);
    } catch (error) {
      console.error(error);

      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // FORM INPUT
  // ============================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ============================================
  // OPEN ADD MODAL
  // ============================================

  function openAddModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  // ============================================
  // OPEN EDIT MODAL
  // ============================================

  function openEditModal(product) {
    setEditingProduct(product);

    setForm({
      name: product.Name ?? "",
      price: product.Price ?? "",
      category: product.Category ?? "",
      stock: product.Stock ?? "",
    });

    setError("");
    setModalOpen(true);
  }

  // ============================================
  // CLOSE MODAL
  // ============================================

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
  }

  // ============================================
  // SAVE PRODUCT
  // ============================================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const productData = {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        stock: Number(form.stock),
      };

      if (!productData.name || !productData.category) {
        setError("Name and category are required.");
        return;
      }

      if (
        Number.isNaN(productData.price) ||
        Number.isNaN(productData.stock)
      ) {
        setError("Please enter valid price and stock values.");
        return;
      }

      if (productData.price < 0 || productData.stock < 0) {
        setError("Price and stock cannot be negative.");
        return;
      }

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct.ProductId}`,
          productData
        );
      } else {
        await api.post("/products", productData);
      }

      closeModal();

      await fetchProducts();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // DELETE PRODUCT
  // ============================================

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.Name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/products/${product.ProductId}`);

      await fetchProducts();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to delete product."
      );
    }
  }

  // ============================================
  // SEARCH
  // ============================================

  const searchText = search.toLowerCase().trim();

  const filteredProducts = products.filter((product) => {
    return (
      product.Name?.toLowerCase().includes(searchText) ||
      product.Category?.toLowerCase().includes(searchText)
    );
  });

  // ============================================
  // FORMAT PRICE
  // ============================================

  function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  // ============================================
  // STOCK BADGE
  // ============================================

  function getStockBadge(stock) {
    if (stock === 0) {
      return {
        text: "Out of Stock",
        className:
          "bg-red-50 text-red-700 ring-1 ring-red-200",
      };
    }

    if (stock < 10) {
      return {
        text: `${stock} Low`,
        className:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      };
    }

    return {
      text: `${stock} Available`,
      className:
        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Boxes size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Products
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Manage your product inventory
              </p>
            </div>

          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">

          <div className="flex items-center gap-2">
            <span className="font-medium">
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1.5 transition hover:bg-red-100"
          >
            <X size={17} />
          </button>

        </div>
      )}


      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* ===================================================
            TOOLBAR
        ==================================================== */}

        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            {/* Search */}

            <div className="relative w-full md:max-w-md">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search products or categories..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}

            </div>


            {/* Product Count */}

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <span>
                Showing
              </span>

              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                {filteredProducts.length}
              </span>

              <span>
                product
                {filteredProducts.length !== 1 ? "s" : ""}
              </span>

            </div>

          </div>

        </div>


        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">

              <Loader2
                size={26}
                className="animate-spin text-indigo-600"
              />

            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              Loading products
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we fetch your inventory.
            </p>

          </div>
        )}


        {/* ===================================================
            EMPTY STATE
        ==================================================== */}

        {!loading &&
          filteredProducts.length === 0 && (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                <Package
                  size={30}
                  className="text-slate-400"
                />

              </div>

              <h3 className="text-base font-semibold text-slate-900">
                No products found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search
                  ? "Try changing your search criteria."
                  : "Start by adding your first product to the inventory."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Add Product
                </button>
              )}

            </div>
          )}


        {/* ===================================================
            TABLE
        ==================================================== */}

        {!loading &&
          filteredProducts.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      ID
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Product
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>


                <tbody className="divide-y divide-slate-100">

                  {filteredProducts.map((product) => {

                    const stockBadge =
                      getStockBadge(product.Stock);

                    return (
                      <tr
                        key={product.ProductId}
                        className="group transition hover:bg-slate-50"
                      >

                        {/* ID */}

                        <td className="whitespace-nowrap px-6 py-4">

                          <span className="font-mono text-xs font-medium text-slate-500">
                            #{product.ProductId}
                          </span>

                        </td>


                        {/* PRODUCT */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <Package size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {product.Name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                Product ID: {product.ProductId}
                              </p>
                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td className="px-6 py-4">

                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {product.Category}
                          </span>

                        </td>


                        {/* PRICE */}

                        <td className="px-6 py-4">

                          <span className="font-semibold text-slate-900">
                            {formatPrice(product.Price)}
                          </span>

                        </td>


                        {/* STOCK */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${stockBadge.className}`}
                          >
                            {stockBadge.text}
                          </span>

                        </td>


                        {/* CREATED */}

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">

                          {product.CreatedAt
                            ? new Date(
                                product.CreatedAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}

                        </td>


                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              title="Edit product"
                              onClick={() =>
                                openEditModal(product)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              title="Delete product"
                              onClick={() =>
                                deleteProduct(product)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

      </div>


      {/* =====================================================
          MODAL
      ====================================================== */}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Package size={19} />
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {editingProduct
                        ? "Edit Product"
                        : "Add Product"}
                    </h2>

                    <p className="mt-0.5 text-sm text-slate-500">
                      {editingProduct
                        ? "Update product information"
                        : "Add a new product to inventory"}
                    </p>

                  </div>

                </div>

              </div>


              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >

              {/* Product Name */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>


              {/* Price + Stock */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Price
                  </label>

                  <div className="relative">

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="75000"
                      min="0"
                      step="0.01"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                </div>


                <div>

                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

              </div>


              {/* Category */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Electronics"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>


              {/* Form Actions */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Save Product"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Products;

// import {
//   useEffect,
//   useState
// } from "react";

// import {
//   Plus,
//   Search,
//   Pencil,
//   Trash2,
//   Package,
//   X
// } from "lucide-react";

// import api from "../services/api";


// function Products() {

//   const emptyForm = {
//     name: "",
//     price: "",
//     category: "",
//     stock: ""
//   };


//   const [products, setProducts] =
//     useState([]);

//   const [form, setForm] =
//     useState(emptyForm);

//   const [search, setSearch] =
//     useState("");

//   const [loading, setLoading] =
//     useState(true);

//   const [saving, setSaving] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   const [modalOpen, setModalOpen] =
//     useState(false);

//   const [editingProduct, setEditingProduct] =
//     useState(null);


//   // ============================================
//   // FETCH PRODUCTS
//   // ============================================

//   useEffect(() => {
//     fetchProducts();
//   }, []);


//   async function fetchProducts() {

//     try {

//       setLoading(true);
//       setError("");

//       const response =
//         await api.get("/products");

//       setProducts(response.data);

//     } catch (error) {

//       console.error(error);

//       setError(
//         "Unable to load products."
//       );

//     } finally {

//       setLoading(false);

//     }
//   }


//   // ============================================
//   // FORM INPUT
//   // ============================================

//   function handleChange(event) {

//     const {
//       name,
//       value
//     } = event.target;

//     setForm((previous) => ({
//       ...previous,
//       [name]: value
//     }));
//   }


//   // ============================================
//   // OPEN ADD MODAL
//   // ============================================

//   function openAddModal() {

//     setEditingProduct(null);

//     setForm(emptyForm);

//     setModalOpen(true);

//   }


//   // ============================================
//   // OPEN EDIT MODAL
//   // ============================================

//   function openEditModal(product) {

//     setEditingProduct(product);

//     setForm({
//       name: product.Name,
//       price: product.Price,
//       category: product.Category,
//       stock: product.Stock
//     });

//     setModalOpen(true);

//   }


//   // ============================================
//   // CLOSE MODAL
//   // ============================================

//   function closeModal() {

//     if (saving) {
//       return;
//     }

//     setModalOpen(false);

//     setEditingProduct(null);

//     setForm(emptyForm);

//   }


//   // ============================================
//   // SAVE PRODUCT
//   // ============================================

//   async function handleSubmit(event) {

//     event.preventDefault();

//     try {

//       setSaving(true);
//       setError("");

//       const productData = {
//         name: form.name.trim(),
//         price: Number(form.price),
//         category: form.category.trim(),
//         stock: Number(form.stock)
//       };


//       if (
//         !productData.name ||
//         !productData.category
//       ) {

//         setError(
//           "Name and category are required."
//         );

//         return;
//       }


//       if (
//         productData.price < 0 ||
//         productData.stock < 0
//       ) {

//         setError(
//           "Price and stock cannot be negative."
//         );

//         return;
//       }


//       if (editingProduct) {

//         await api.put(
//           `/products/${editingProduct.Id}`,
//           productData
//         );

//       } else {

//         await api.post(
//           "/products",
//           productData
//         );

//       }


//       closeModal();

//       await fetchProducts();

//     } catch (error) {

//       console.error(error);

//       setError(
//         error.response?.data?.message ||
//         "Unable to save product."
//       );

//     } finally {

//       setSaving(false);

//     }

//   }


//   // ============================================
//   // DELETE PRODUCT
//   // ============================================

//   async function deleteProduct(product) {

//     const confirmed =
//       window.confirm(
//         `Delete "${product.Name}"?`
//       );

//     if (!confirmed) {
//       return;
//     }


//     try {

//       setError("");

//       await api.delete(
//         `/products/${product.Id}`
//       );

//       await fetchProducts();

//     } catch (error) {

//       console.error(error);

//       setError(
//         error.response?.data?.message ||
//         "Unable to delete product."
//       );

//     }

//   }


//   // ============================================
//   // SEARCH
//   // ============================================

//   const filteredProducts =
//     products.filter((product) => {

//       const searchText =
//         search.toLowerCase();

//       return (
//         product.Name
//           .toLowerCase()
//           .includes(searchText) ||

//         product.Category
//           .toLowerCase()
//           .includes(searchText)
//       );

//     });


//   // ============================================
//   // FORMAT PRICE
//   // ============================================

//   function formatPrice(price) {

//     return new Intl.NumberFormat(
//       "en-IN",
//       {
//         style: "currency",
//         currency: "INR",
//         maximumFractionDigits: 0
//       }
//     ).format(price);

//   }


//   return (
//     <div>

//       {/* ========================================
//           HEADER
//       ========================================= */}

//       <div className="page-header">

//         <div>

//           <h1>
//             Products
//           </h1>

//           <p>
//             Manage your product inventory
//           </p>

//         </div>


//         <button
//           className="primary-button"
//           onClick={openAddModal}
//         >
//           <Plus size={18} />

//           Add Product
//         </button>

//       </div>


//       {/* ========================================
//           ERROR
//       ========================================= */}

//       {error && (
//         <div className="error-banner">

//           {error}

//           <button
//             onClick={() => setError("")}
//           >
//             <X size={16} />
//           </button>

//         </div>
//       )}


//       {/* ========================================
//           PRODUCTS CARD
//       ========================================= */}

//       <div className="dashboard-card">

//         <div className="products-toolbar">

//           <div className="product-search">

//             <Search size={18} />

//             <input
//               type="text"
//               placeholder="Search products..."
//               value={search}
//               onChange={(event) =>
//                 setSearch(
//                   event.target.value
//                 )
//               }
//             />

//           </div>


//           <div className="product-count">

//             {filteredProducts.length}
//             {" "}
//             product
//             {filteredProducts.length !== 1
//               ? "s"
//               : ""}

//           </div>

//         </div>


//         {/* ======================================
//             LOADING
//         ======================================= */}

//         {loading && (

//           <div className="empty-state">

//             <Package size={40} />

//             <p>
//               Loading products...
//             </p>

//           </div>

//         )}


//         {/* ======================================
//             EMPTY
//         ======================================= */}

//         {!loading &&
//           filteredProducts.length === 0 && (

//             <div className="empty-state">

//               <Package size={40} />

//               <h3>
//                 No products found
//               </h3>

//               <p>
//                 Try another search or add
//                 a new product.
//               </p>

//             </div>

//           )}


//         {/* ======================================
//             TABLE
//         ======================================= */}

//         {!loading &&
//           filteredProducts.length > 0 && (

//             <div className="table-wrapper">

//               <table>

//                 <thead>

//                   <tr>

//                     <th>
//                       ID
//                     </th>

//                     <th>
//                       Product
//                     </th>

//                     <th>
//                       Category
//                     </th>

//                     <th>
//                       Price
//                     </th>

//                     <th>
//                       Stock
//                     </th>

//                     <th>
//                       Created
//                     </th>

//                     <th>
//                       Actions
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {filteredProducts.map(
//                     (product) => (

//                       <tr
//                         key={product.Id}
//                       >

//                         <td>
//                           #{product.Id}
//                         </td>


//                         <td>

//                           <div className="product-name">

//                             <div className="product-icon">
//                               <Package size={17} />
//                             </div>

//                             <strong>
//                               {product.Name}
//                             </strong>

//                           </div>

//                         </td>


//                         <td>

//                           <span className="category-badge">
//                             {product.Category}
//                           </span>

//                         </td>


//                         <td>

//                           <strong>
//                             {formatPrice(
//                               product.Price
//                             )}
//                           </strong>

//                         </td>


//                         <td>

//                           <span
//                             className={
//                               product.Stock === 0
//                                 ? "stock-badge out"
//                                 : product.Stock < 10
//                                 ? "stock-badge low"
//                                 : "stock-badge"
//                             }
//                           >
//                             {product.Stock}
//                           </span>

//                         </td>


//                         <td>

//                           {new Date(
//                             product.CreatedAt
//                           ).toLocaleDateString(
//                             "en-IN"
//                           )}

//                         </td>


//                         <td>

//                           <div className="action-buttons">

//                             <button
//                               className="icon-button edit"
//                               title="Edit product"
//                               onClick={() =>
//                                 openEditModal(
//                                   product
//                                 )
//                               }
//                             >
//                               <Pencil
//                                 size={17}
//                               />
//                             </button>


//                             <button
//                               className="icon-button delete"
//                               title="Delete product"
//                               onClick={() =>
//                                 deleteProduct(
//                                   product
//                                 )
//                               }
//                             >
//                               <Trash2
//                                 size={17}
//                               />
//                             </button>

//                           </div>

//                         </td>

//                       </tr>

//                     )
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           )}

//       </div>


//       {/* ========================================
//           MODAL
//       ========================================= */}

//       {modalOpen && (

//         <div
//           className="modal-overlay"
//           onMouseDown={(event) => {

//             if (
//               event.target ===
//               event.currentTarget
//             ) {
//               closeModal();
//             }

//           }}
//         >

//           <div className="modal">

//             <div className="modal-header">

//               <div>

//                 <h2>
//                   {editingProduct
//                     ? "Edit Product"
//                     : "Add Product"}
//                 </h2>

//                 <p>
//                   {editingProduct
//                     ? "Update product details"
//                     : "Add a new product to inventory"}
//                 </p>

//               </div>


//               <button
//                 className="modal-close"
//                 onClick={closeModal}
//               >
//                 <X size={20} />
//               </button>

//             </div>


//             <form
//               onSubmit={handleSubmit}
//               className="product-form"
//             >

//               <div className="form-group">

//                 <label>
//                   Product Name
//                 </label>

//                 <input
//                   type="text"
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   placeholder="Enter product name"
//                   required
//                 />

//               </div>


//               <div className="form-row">

//                 <div className="form-group">

//                   <label>
//                     Price
//                   </label>

//                   <input
//                     type="number"
//                     name="price"
//                     value={form.price}
//                     onChange={handleChange}
//                     placeholder="75000"
//                     min="0"
//                     step="0.01"
//                     required
//                   />

//                 </div>


//                 <div className="form-group">

//                   <label>
//                     Stock
//                   </label>

//                   <input
//                     type="number"
//                     name="stock"
//                     value={form.stock}
//                     onChange={handleChange}
//                     placeholder="10"
//                     min="0"
//                     required
//                   />

//                 </div>

//               </div>


//               <div className="form-group">

//                 <label>
//                   Category
//                 </label>

//                 <input
//                   type="text"
//                   name="category"
//                   value={form.category}
//                   onChange={handleChange}
//                   placeholder="Electronics"
//                   required
//                 />

//               </div>


//               <div className="modal-actions">

//                 <button
//                   type="button"
//                   className="secondary-button"
//                   onClick={closeModal}
//                   disabled={saving}
//                 >
//                   Cancel
//                 </button>


//                 <button
//                   type="submit"
//                   className="primary-button"
//                   disabled={saving}
//                 >

//                   {saving
//                     ? "Saving..."
//                     : editingProduct
//                     ? "Update Product"
//                     : "Save Product"}

//                 </button>

//               </div>

//             </form>

//           </div>

//         </div>

//       )}

//     </div>
//   );
// }

// export default Products;


// import { useEffect, useState } from "react";
// import { Package, Plus } from "lucide-react";

// import api from "../services/api";

// function Products() {

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   async function fetchProducts() {

//     try {

//       const response =
//         await api.get("/products");

//       setProducts(response.data);

//     } catch (error) {

//       console.error(error);

//       setError(
//         "Unable to load products."
//       );

//     } finally {

//       setLoading(false);

//     }
//   }

//   return (
//     <div>

//       <div className="page-header">

//         <div>
//           <h1>Products</h1>

//           <p>
//             Manage your product inventory
//           </p>
//         </div>

//         <button className="primary-button">
//           <Plus size={18} />
//           Add Product
//         </button>

//       </div>

//       <div className="dashboard-card">

//         {loading && (
//           <div className="empty-state">
//             <Package size={40} />
//             <p>Loading products...</p>
//           </div>
//         )}

//         {error && (
//           <div className="error-message">
//             {error}
//           </div>
//         )}

//         {!loading &&
//           !error &&
//           products.length === 0 && (
//             <div className="empty-state">
//               <Package size={40} />

//               <h3>
//                 No products found
//               </h3>

//               <p>
//                 Add your first product.
//               </p>
//             </div>
//           )}

//         {!loading &&
//           !error &&
//           products.length > 0 && (

//             <div className="table-wrapper">

//               <table>

//                 <thead>
//                   <tr>
//                     <th>ID</th>
//                     <th>Product</th>
//                     <th>Category</th>
//                     <th>Price</th>
//                     <th>Stock</th>
//                   </tr>
//                 </thead>

//                 <tbody>

//                   {products.map(
//                     (product) => (
//                       <tr key={product.Id}>

//                         <td>
//                           #{product.Id}
//                         </td>

//                         <td>
//                           {product.Name}
//                         </td>

//                         <td>
//                           {product.Category}
//                         </td>

//                         <td>
//                           ₹
//                           {Number(
//                             product.Price
//                           ).toLocaleString(
//                             "en-IN"
//                           )}
//                         </td>

//                         <td>
//                           {product.Stock}
//                         </td>

//                       </tr>
//                     )
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           )}

//       </div>

//     </div>
//   );
// }

// export default Products;


// import {
//   useEffect,
//   useState
// } from "react";

// import api from "../services/api";

// function Products() {

//   const [products, setProducts] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   useEffect(() => {

//     async function loadProducts() {

//       const response =
//         await api.get("/products");

//       setProducts(response.data);

//       setLoading(false);
//     }

//     loadProducts();

//   }, []);

//   async function handleDelete(id) {

//     const confirmed =
//       window.confirm(
//         "Delete this product?"
//       );

//     if (!confirmed) {
//       return;
//     }

//     await api.delete(
//       `/products/${id}`
//     );

//     setProducts(
//       products.filter(
//         product =>
//           product.Id !== id
//       )
//     );
//   }

//   if (loading) {
//     return <p>Loading products...</p>;
//   }

//   return (
//     <div>

//       <h1>Products</h1>

//       <table>

//         <thead>

//           <tr>
//             <th>Name</th>
//             <th>Price</th>
//             <th>Category</th>
//             <th>Stock</th>
//             <th>Action</th>
//           </tr>

//         </thead>

//         <tbody>

//           {products.map(product => (

//             <tr key={product.Id}>

//               <td>
//                 {product.Name}
//               </td>

//               <td>
//                 ₹{product.Price}
//               </td>

//               <td>
//                 {product.Category}
//               </td>

//               <td>
//                 {product.Stock}
//               </td>

//               <td>

//                 <button
//                   onClick={() =>
//                     handleDelete(
//                       product.Id
//                     )
//                   }
//                 >
//                   Delete
//                 </button>

//               </td>

//             </tr>

//           ))}

//         </tbody>

//       </table>

//     </div>
//   );
// }

// export default Products;
