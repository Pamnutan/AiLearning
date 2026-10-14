import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Search,
  Eye,
  X,
  ShoppingCart,
  Package,
  Clock3,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  CalendarDays,
  ChevronDown,
  RefreshCw,
  IndianRupee,
  Hash,
  Truck,
  Loader2,
  Store
} from "lucide-react";

import api from "../services/api";


function Orders() {

  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [loadingOrder, setLoadingOrder] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);


  // =========================================================
  // FETCH ORDERS
  // =========================================================

  useEffect(() => {
    fetchOrders();
  }, []);


  async function fetchOrders(showRefresh = false) {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await api.get("/orders");

      setOrders(response.data);

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to load orders."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  }


  // =========================================================
  // VIEW ORDER
  // =========================================================

  async function viewOrder(orderId) {

    try {

      setLoadingOrder(true);
      setError("");

      const response =
        await api.get(`/orders/${orderId}`);

      setSelectedOrder(response.data);

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to load order details."
      );

    } finally {

      setLoadingOrder(false);

    }
  }


  // =========================================================
  // CLOSE ORDER
  // =========================================================

  function closeOrder() {
    setSelectedOrder(null);
  }


  // =========================================================
  // UPDATE STATUS
  // =========================================================

  async function updateStatus(
    orderId,
    status
  ) {

    try {

      setUpdatingStatus(true);
      setError("");

      await api.put(
        `/orders/${orderId}/status`,
        {
          status
        }
      );

      await fetchOrders();

      if (selectedOrder) {
        await viewOrder(orderId);
      }

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to update order."
      );

    } finally {

      setUpdatingStatus(false);

    }
  }


  // =========================================================
  // FILTER
  // =========================================================

  const filteredOrders = useMemo(() => {

    const text =
      search.toLowerCase().trim();

    return orders.filter(order => {

      const matchesSearch =
        order.Id
          ?.toString()
          .includes(text) ||

        order.UserName
          ?.toLowerCase()
          .includes(text) ||

        order.Email
          ?.toLowerCase()
          .includes(text);

      const matchesStatus =
        statusFilter === "All" ||
        order.Status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );

    });

  }, [
    orders,
    search,
    statusFilter
  ]);


  // =========================================================
  // STATISTICS
  // =========================================================

  const totalOrders = orders.length;

  const pendingOrders =
    orders.filter(
      order => order.Status === "Pending"
    ).length;

  const processingOrders =
    orders.filter(
      order => order.Status === "Processing"
    ).length;

  const completedOrders =
    orders.filter(
      order => order.Status === "Completed"
    ).length;


  const totalRevenue = orders.reduce(
    (total, order) =>
      total +
      Number(order.TotalAmount || 0),
    0
  );


  // =========================================================
  // MONEY
  // =========================================================

  function formatPrice(amount) {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }
    ).format(amount || 0);

  }


  // =========================================================
  // DATE
  // =========================================================

  function formatDate(date) {

    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  }


  function formatDateTime(date) {

    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  }


  // =========================================================
  // INITIALS
  // =========================================================

  function getInitials(name = "") {

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map(word =>
        word.charAt(0)
      )
      .join("")
      .toUpperCase();

  }


  // =========================================================
  // STATUS STYLE
  // =========================================================

  function getStatusStyle(status) {

    switch (status) {

      case "Pending":

        return {
          wrapper:
            "bg-amber-50 text-amber-700 ring-amber-200",
          icon: Clock3
        };

      case "Processing":

        return {
          wrapper:
            "bg-blue-50 text-blue-700 ring-blue-200",
          icon: Truck
        };

      case "Completed":

        return {
          wrapper:
            "bg-emerald-50 text-emerald-700 ring-emerald-200",
          icon: CheckCircle2
        };

      case "Cancelled":

        return {
          wrapper:
            "bg-red-50 text-red-700 ring-red-200",
          icon: XCircle
        };

      default:

        return {
          wrapper:
            "bg-slate-100 text-slate-600 ring-slate-200",
          icon: Clock3
        };

    }
  }


  function StatusBadge({
    status
  }) {

    const config =
      getStatusStyle(status);

    const StatusIcon =
      config.icon;

    return (

      <span
        className={`
          inline-flex
          items-center
          gap-1.5
          rounded-full
          px-2.5
          py-1.5
          text-xs
          font-semibold
          ring-1
          ring-inset
          ${config.wrapper}
        `}
      >

        <StatusIcon size={13} />

        {status}

      </span>

    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl space-y-6">


        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">

                <ShoppingCart size={23} />

              </div>

              <div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Orders
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage and monitor customer orders.
                </p>

              </div>

            </div>

          </div>


          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>


        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>
              {error}
            </span>

            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 transition hover:bg-red-100"
            >

              <X size={17} />

            </button>

          </div>

        )}


        {/* =====================================================
            KPI CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">


          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Orders
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalOrders}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                <ShoppingCart size={21} />

              </div>

            </div>

          </div>


          {/* PENDING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {pendingOrders}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

                <Clock3 size={21} />

              </div>

            </div>

          </div>


          {/* PROCESSING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Processing
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {processingOrders}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                <Truck size={21} />

              </div>

            </div>

          </div>


          {/* COMPLETED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {completedOrders}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                <CheckCircle2 size={21} />

              </div>

            </div>

          </div>


          {/* REVENUE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Order Value
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatPrice(totalRevenue)}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

                <IndianRupee size={21} />

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            MAIN CARD
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


          {/* TOOLBAR */}

          <div className="border-b border-slate-200 p-4 sm:p-5">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">


              {/* SEARCH */}

              <div className="relative w-full lg:max-w-lg">

                <Search
                  size={18}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  placeholder="Search order ID, customer or email..."
                  value={search}
                  onChange={event =>
                    setSearch(event.target.value)
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-10
                    pr-10
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-indigo-100
                  "
                />

                {search && (

                  <button
                    onClick={() => setSearch("")}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      hover:text-slate-700
                    "
                  >

                    <X size={16} />

                  </button>

                )}

              </div>


              {/* FILTER */}

              <div className="flex items-center gap-3">

                <div className="relative">

                  <select
                    value={statusFilter}
                    onChange={event =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                    className="
                      h-11
                      appearance-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-4
                      pr-10
                      text-sm
                      font-medium
                      text-slate-700
                      outline-none
                      transition
                      focus:border-indigo-500
                      focus:ring-2
                      focus:ring-indigo-100
                    "
                  >

                    <option value="All">
                      All Statuses
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Processing">
                      Processing
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                  <ChevronDown
                    size={16}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                </div>


                <div className="
                  hidden
                  rounded-xl
                  bg-slate-100
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-600
                  sm:block
                ">

                  {filteredOrders.length}{" "}

                  {filteredOrders.length === 1
                    ? "order"
                    : "orders"}

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================== */}

          {loading && (

            <div className="divide-y divide-slate-100">

              {[1, 2, 3, 4, 5].map(
                item => (

                  <div
                    key={item}
                    className="
                      flex
                      items-center
                      gap-4
                      px-5
                      py-5
                    "
                  >

                    <div className="
                      h-10
                      w-10
                      animate-pulse
                      rounded-full
                      bg-slate-200
                    " />

                    <div className="flex-1 space-y-2">

                      <div className="
                        h-4
                        w-32
                        animate-pulse
                        rounded
                        bg-slate-200
                      " />

                      <div className="
                        h-3
                        w-52
                        animate-pulse
                        rounded
                        bg-slate-100
                      " />

                    </div>

                    <div className="
                      h-8
                      w-20
                      animate-pulse
                      rounded-lg
                      bg-slate-100
                    " />

                  </div>

                )
              )}

            </div>

          )}


          {/* =================================================
              EMPTY
          ================================================== */}

          {!loading &&
            filteredOrders.length === 0 && (

              <div className="
                flex
                min-h-[380px]
                flex-col
                items-center
                justify-center
                px-6
                text-center
              ">

                <div className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-100
                  text-slate-400
                ">

                  <ShoppingCart size={30} />

                </div>

                <h3 className="
                  mt-4
                  text-base
                  font-semibold
                  text-slate-900
                ">

                  No orders found

                </h3>

                <p className="
                  mt-1
                  max-w-sm
                  text-sm
                  text-slate-500
                ">

                  Try changing your search or status filter.

                </p>

              </div>

            )}


          {/* =================================================
              DESKTOP TABLE
          ================================================== */}

          {!loading &&
            filteredOrders.length > 0 && (

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead>

                    <tr className="
                      border-b
                      border-slate-200
                      bg-slate-50/70
                    ">

                      <th className="
                        px-5
                        py-3.5
                        text-left
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      ">
                        Order
                      </th>

                      <th className="
                        px-5
                        py-3.5
                        text-left
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      ">
                        Customer
                      </th>

                      <th className="
                        px-5
                        py-3.5
                        text-left
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      ">
                        Items
                      </th>

                      <th className="
                        px-5
                        py-3.5
                        text-left
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      ">
                        Amount
                      </th>

                      <th className="
                        px-5
                        py-3.5
                        text-left
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      ">
                        Status
                      </th>

                      <th className="
                        px-5
                        py-3.5
                        text-left
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      ">
                        Date
                      </th>

                      <th className="
                        px-5
                        py-3.5
                        text-right
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      ">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {filteredOrders.map(
                      order => (

                        <tr
                          key={order.Id}
                          className="
                            transition
                            hover:bg-slate-50/70
                          "
                        >


                          {/* ORDER */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-indigo-50
                                text-indigo-600
                              ">

                                <Hash size={17} />

                              </div>

                              <div>

                                <p className="
                                  font-semibold
                                  text-slate-900
                                ">

                                  #{order.Id}

                                </p>

                                <p className="
                                  text-xs
                                  text-slate-400
                                ">

                                  Order

                                </p>

                              </div>

                            </div>

                          </td>


                          {/* CUSTOMER */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-slate-100
                                text-sm
                                font-bold
                                text-slate-600
                              ">

                                {getInitials(
                                  order.UserName
                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="
                                  font-semibold
                                  text-slate-900
                                ">

                                  {order.UserName}

                                </p>

                                <p className="
                                  max-w-[190px]
                                  truncate
                                  text-xs
                                  text-slate-400
                                ">

                                  {order.Email}

                                </p>

                              </div>

                            </div>

                          </td>


                          {/* ITEMS */}

                          <td className="px-5 py-4">

                            <div className="
                              inline-flex
                              items-center
                              gap-2
                              text-sm
                              text-slate-600
                            ">

                              <Package
                                size={16}
                                className="text-slate-400"
                              />

                              {order.ItemCount}

                              {order.ItemCount === 1
                                ? " item"
                                : " items"}

                            </div>

                          </td>


                          {/* AMOUNT */}

                          <td className="px-5 py-4">

                            <p className="
                              font-bold
                              text-slate-900
                            ">

                              {formatPrice(
                                order.TotalAmount
                              )}

                            </p>

                          </td>


                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <StatusBadge
                              status={order.Status}
                            />

                          </td>


                          {/* DATE */}

                          <td className="px-5 py-4">

                            <div className="
                              flex
                              items-center
                              gap-2
                              text-sm
                              text-slate-500
                            ">

                              <CalendarDays
                                size={15}
                                className="text-slate-400"
                              />

                              {formatDate(
                                order.CreatedAt
                              )}

                            </div>

                          </td>


                          {/* ACTION */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end">

                              <button
                                onClick={() =>
                                  viewOrder(
                                    order.Id
                                  )
                                }
                                title="View order"
                                className="
                                  inline-flex
                                  h-9
                                  items-center
                                  gap-2
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  px-3
                                  text-xs
                                  font-semibold
                                  text-slate-600
                                  transition
                                  hover:border-indigo-200
                                  hover:bg-indigo-50
                                  hover:text-indigo-600
                                "
                              >

                                <Eye size={15} />

                                View

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}


          {/* =================================================
              MOBILE CARDS
          ================================================== */}

          {!loading &&
            filteredOrders.length > 0 && (

              <div className="
                divide-y
                divide-slate-100
                md:hidden
              ">

                {filteredOrders.map(
                  order => (

                    <div
                      key={order.Id}
                      className="p-4"
                    >

                      <div className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      ">

                        <div className="
                          flex
                          min-w-0
                          items-center
                          gap-3
                        ">

                          <div className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-indigo-50
                            text-indigo-600
                          ">

                            <ShoppingCart
                              size={19}
                            />

                          </div>

                          <div className="min-w-0">

                            <p className="
                              font-bold
                              text-slate-900
                            ">

                              #{order.Id}

                            </p>

                            <p className="
                              truncate
                              text-sm
                              text-slate-500
                            ">

                              {order.UserName}

                            </p>

                          </div>

                        </div>


                        <button
                          onClick={() =>
                            viewOrder(
                              order.Id
                            )
                          }
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            text-slate-500
                            hover:bg-indigo-50
                            hover:text-indigo-600
                          "
                        >

                          <Eye size={16} />

                        </button>

                      </div>


                      <div className="
                        mt-4
                        grid
                        grid-cols-2
                        gap-3
                      ">

                        <div>

                          <p className="
                            text-xs
                            text-slate-400
                          ">
                            Amount
                          </p>

                          <p className="
                            mt-1
                            font-bold
                            text-slate-900
                          ">

                            {formatPrice(
                              order.TotalAmount
                            )}

                          </p>

                        </div>


                        <div>

                          <p className="
                            text-xs
                            text-slate-400
                          ">
                            Items
                          </p>

                          <p className="
                            mt-1
                            font-semibold
                            text-slate-700
                          ">

                            {order.ItemCount}

                            {order.ItemCount === 1
                              ? " item"
                              : " items"}

                          </p>

                        </div>

                      </div>


                      <div className="
                        mt-4
                        flex
                        items-center
                        justify-between
                      ">

                        <StatusBadge
                          status={order.Status}
                        />

                        <span className="
                          text-xs
                          text-slate-400
                        ">

                          {formatDate(
                            order.CreatedAt
                          )}

                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

        </div>

      </div>


      {/* =====================================================
          ORDER DETAIL MODAL
      ====================================================== */}

      {(selectedOrder || loadingOrder) && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-4
            backdrop-blur-sm
          "
          onMouseDown={event => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeOrder();

            }

          }}
        >

          <div className="
            flex
            max-h-[92vh]
            w-full
            max-w-3xl
            flex-col
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
          ">


            {/* MODAL HEADER */}

            <div className="
              flex
              items-center
              justify-between
              border-b
              border-slate-200
              px-5
              py-4
              sm:px-6
            ">

              <div>

                {loadingOrder ? (

                  <>

                    <div className="
                      h-5
                      w-32
                      animate-pulse
                      rounded
                      bg-slate-200
                    />

                    <div className="
                      mt-2
                      h-3
                      w-48
                      animate-pulse
                      rounded
                      bg-slate-100
                    />

                  </>

                ) : (

                  <>

                    <div className="
                      flex
                      items-center
                      gap-3
                    ">

                      <div className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-indigo-50
                        text-indigo-600
                      ">

                        <ShoppingCart
                          size={19}
                        />

                      </div>

                      <div>

                        <h2 className="
                          text-lg
                          font-bold
                          text-slate-900
                        ">

                          Order #
                          {selectedOrder?.order?.Id}

                        </h2>

                        <p className="
                          text-sm
                          text-slate-500
                        ">

                          {formatDateTime(
                            selectedOrder?.order?.CreatedAt
                          )}

                        </p>

                      </div>

                    </div>

                  </>

                )}

              </div>


              <button
                onClick={closeOrder}
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >

                <X size={20} />

              </button>

            </div>


            {/* MODAL CONTENT */}

            {loadingOrder ? (

              <div className="
                flex
                min-h-[400px]
                flex-col
                items-center
                justify-center
              ">

                <Loader2
                  size={30}
                  className="
                    animate-spin
                    text-indigo-600
                  "
                />

                <p className="
                  mt-3
                  text-sm
                  text-slate-500
                ">

                  Loading order details...

                </p>

              </div>

            ) : (

              <div className="
                overflow-y-auto
                p-5
                sm:p-6
              ">


                {/* CUSTOMER + STATUS */}

                <div className="
                  grid
                  gap-4
                  lg:grid-cols-2
                ">


                  {/* CUSTOMER */}

                  <div className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    p-4
                  ">

                    <div className="
                      mb-3
                      flex
                      items-center
                      gap-2
                    ">

                      <User
                        size={17}
                        className="text-indigo-600"
                      />

                      <h3 className="
                        text-sm
                        font-bold
                        text-slate-900
                      ">

                        Customer

                      </h3>

                    </div>


                    <div className="
                      flex
                      items-center
                      gap-3
                    ">

                      <div className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-indigo-100
                        text-sm
                        font-bold
                        text-indigo-700
                      ">

                        {getInitials(
                          selectedOrder?.order?.UserName
                        )}

                      </div>


                      <div className="min-w-0">

                        <p className="
                          font-semibold
                          text-slate-900
                        ">

                          {selectedOrder?.order?.UserName}

                        </p>

                        <div className="
                          mt-1
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          text-slate-500
                        ">

                          <Mail size={13} />

                          {selectedOrder?.order?.Email}

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* STATUS */}

                  <div className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    p-4
                  ">

                    <div className="
                      mb-3
                      flex
                      items-center
                      justify-between
                    ">

                      <div className="
                        flex
                        items-center
                        gap-2
                      ">

                        <Truck
                          size={17}
                          className="text-indigo-600"
                        />

                        <h3 className="
                          text-sm
                          font-bold
                          text-slate-900
                        ">

                          Order Status

                        </h3>

                      </div>

                      <StatusBadge
                        status={
                          selectedOrder?.order?.Status
                        }
                      />

                    </div>


                    <div className="relative">

                      <select
                        value={
                          selectedOrder?.order?.Status
                        }
                        disabled={updatingStatus}
                        onChange={event =>
                          updateStatus(
                            selectedOrder.order.Id,
                            event.target.value
                          )
                        }
                        className="
                          h-11
                          w-full
                          appearance-none
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-4
                          pr-10
                          text-sm
                          font-medium
                          text-slate-700
                          outline-none
                          focus:border-indigo-500
                          focus:ring-2
                          focus:ring-indigo-100
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Processing">
                          Processing
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>

                      </select>

                      <ChevronDown
                        size={16}
                        className="
                          pointer-events-none
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      {updatingStatus && (

                        <Loader2
                          size={16}
                          className="
                            absolute
                            right-9
                            top-1/2
                            -translate-y-1/2
                            animate-spin
                            text-indigo-600
                          "
                        />

                      )}

                    </div>

                  </div>

                </div>


                {/* ORDER ITEMS */}

                <div className="mt-6">

                  <div className="
                    mb-3
                    flex
                    items-center
                    justify-between
                  ">

                    <div className="
                      flex
                      items-center
                      gap-2
                    ">

                      <Package
                        size={18}
                        className="text-indigo-600"
                      />

                      <h3 className="
                        text-base
                        font-bold
                        text-slate-900
                      ">

                        Order Items

                      </h3>

                    </div>

                    <span className="
                      text-sm
                      text-slate-500
                    ">

                      {selectedOrder?.items?.length || 0}

                      {" "}

                      {selectedOrder?.items?.length === 1
                        ? "item"
                        : "items"}

                    </span>

                  </div>


                  <div className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                  ">

                    {selectedOrder?.items?.map(
                      (item, index) => (

                        <div
                          key={item.Id}
                          className={`
                            flex
                            items-center
                            justify-between
                            gap-4
                            p-4
                            ${
                              index !==
                              selectedOrder.items.length - 1
                                ? "border-b border-slate-100"
                                : ""
                            }
                          `}
                        >

                          <div className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                          ">

                            <div className="
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-slate-100
                              text-slate-500
                            ">

                              <Package size={18} />

                            </div>


                            <div className="min-w-0">

                                                          <p className="
                                                            truncate
                                                            font-semibold
                                                            text-slate-900
                                                          ">

                                                            {item.ProductName}

                                                          </p>

                                                          {item.StoreName && (
                                                                                          <p className="mt-0.5 text-[10px] text-slate-400">
                                                                                            {item.StoreName}{item.VendorName ? ` • ${item.VendorName}` : ""}
                                                                                          </p>
                                                                                        )}

                                                          <p className="
                                                            mt-1
                                                            text-xs
                                                            text-slate-500
                                                          ">

                                                            {item.Quantity}

                                                            {" × "}

                                                            {formatPrice(
                                                              item.Price
                                                            )}

                                                            </p>

                                                            {item.Status && (
                                                            <span className={`mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                                              item.Status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                              item.Status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                              'bg-amber-100 text-amber-700'
                                                            }`}>
                                                              {item.Status}
                                                            </span>
                                                            )}

                                                        </div>

                          </div>


                          <p className="
                            shrink-0
                            font-bold
                            text-slate-900
                          ">

                            {formatPrice(
                              item.Subtotal
                            )}

                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>


                {/* TOTAL */}

                <div className="
                  mt-5
                  rounded-2xl
                  bg-slate-900
                  p-5
                  text-white
                ">

                  <div className="
                    flex
                    items-center
                    justify-between
                  ">

                    <div>

                      <p className="
                        text-sm
                        text-slate-400
                      ">

                        Total Order Value

                      </p>

                      <p className="
                        mt-1
                        text-xs
                        text-slate-500
                      ">

                        Including all order items

                      </p>

                    </div>


                    <p className="
                      text-2xl
                      font-bold
                    ">

                      {formatPrice(
                        selectedOrder?.order?.TotalAmount
                      )}

                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


export default Orders;

// import {
//   useEffect,
//   useState
// } from "react";

// import {
//   Search,
//   Eye,
//   X,
//   ShoppingCart
// } from "lucide-react";

// import api from "../services/api";


// function Orders() {

//   const [orders, setOrders] =
//     useState([]);

//   const [search, setSearch] =
//     useState("");

//   const [statusFilter, setStatusFilter] =
//     useState("All");

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   const [selectedOrder, setSelectedOrder] =
//     useState(null);

//   const [loadingOrder, setLoadingOrder] =
//     useState(false);


//   // ==========================================
//   // FETCH ORDERS
//   // ==========================================

//   useEffect(() => {

//     fetchOrders();

//   }, []);


//   async function fetchOrders() {

//     try {

//       setLoading(true);
//       setError("");

//       const response =
//         await api.get("/orders");

//       setOrders(response.data);

//     } catch (error) {

//       console.error(error);

//       setError(
//         "Unable to load orders."
//       );

//     } finally {

//       setLoading(false);

//     }

//   }


//   // ==========================================
//   // VIEW ORDER
//   // ==========================================

//   async function viewOrder(orderId) {

//     try {

//       setLoadingOrder(true);
//       setError("");

//       const response =
//         await api.get(
//           `/orders/${orderId}`
//         );

//       setSelectedOrder(
//         response.data
//       );

//     } catch (error) {

//       console.error(error);

//       setError(
//         "Unable to load order details."
//       );

//     } finally {

//       setLoadingOrder(false);

//     }

//   }


//   // ==========================================
//   // CLOSE
//   // ==========================================

//   function closeOrder() {

//     setSelectedOrder(null);

//   }


//   // ==========================================
//   // UPDATE STATUS
//   // ==========================================

//   async function updateStatus(
//     orderId,
//     status
//   ) {

//     try {

//       await api.put(
//         `/orders/${orderId}/status`,
//         {
//           status
//         }
//       );

//       await fetchOrders();


//       if (selectedOrder) {

//         await viewOrder(orderId);

//       }

//     } catch (error) {

//       console.error(error);

//       setError(
//         error.response?.data?.message ||
//         "Unable to update order."
//       );

//     }

//   }


//   // ==========================================
//   // FILTER
//   // ==========================================

//   const filteredOrders =
//     orders.filter((order) => {

//       const text =
//         search.toLowerCase();


//       const matchesSearch =
//         order.Id
//           .toString()
//           .includes(text)

//         ||

//         order.UserName
//           .toLowerCase()
//           .includes(text)

//         ||

//         order.Email
//           .toLowerCase()
//           .includes(text);


//       const matchesStatus =
//         statusFilter === "All" ||
//         order.Status === statusFilter;


//       return (
//         matchesSearch &&
//         matchesStatus
//       );

//     });


//   // ==========================================
//   // FORMAT MONEY
//   // ==========================================

//   function formatPrice(amount) {

//     return new Intl.NumberFormat(
//       "en-IN",
//       {
//         style: "currency",
//         currency: "INR",
//         maximumFractionDigits: 0
//       }
//     ).format(amount);

//   }


//   // ==========================================
//   // FORMAT DATE
//   // ==========================================

//   function formatDate(date) {

//     return new Date(date)
//       .toLocaleDateString(
//         "en-IN",
//         {
//           day: "2-digit",
//           month: "short",
//           year: "numeric"
//         }
//       );

//   }


//   return (
//     <div>

//       {/* ======================================
//           HEADER
//       ======================================= */}

//       <div className="page-header">

//         <div>

//           <h1>
//             Orders
//           </h1>

//           <p>
//             Manage customer orders
//           </p>

//         </div>

//       </div>


//       {/* ======================================
//           ERROR
//       ======================================= */}

//       {error && (

//         <div className="error-banner">

//           {error}

//           <button
//             onClick={() =>
//               setError("")
//             }
//           >
//             <X size={16} />
//           </button>

//         </div>

//       )}


//       {/* ======================================
//           CARD
//       ======================================= */}

//       <div className="dashboard-card">

//         {/* TOOLBAR */}

//         <div className="orders-toolbar">

//           <div className="product-search">

//             <Search size={18} />

//             <input
//               type="text"
//               placeholder="Search orders or customers..."
//               value={search}
//               onChange={(event) =>
//                 setSearch(
//                   event.target.value
//                 )
//               }
//             />

//           </div>


//           <select
//             className="status-filter"
//             value={statusFilter}
//             onChange={(event) =>
//               setStatusFilter(
//                 event.target.value
//               )
//             }
//           >

//             <option value="All">
//               All Statuses
//             </option>

//             <option value="Pending">
//               Pending
//             </option>

//             <option value="Processing">
//               Processing
//             </option>

//             <option value="Completed">
//               Completed
//             </option>

//             <option value="Cancelled">
//               Cancelled
//             </option>

//           </select>


//           <div className="product-count">

//             {filteredOrders.length}
//             {" "}
//             order
//             {filteredOrders.length !== 1
//               ? "s"
//               : ""}

//           </div>

//         </div>


//         {/* ====================================
//             LOADING
//         ===================================== */}

//         {loading && (

//           <div className="empty-state">

//             <ShoppingCart size={40} />

//             <p>
//               Loading orders...
//             </p>

//           </div>

//         )}


//         {/* ====================================
//             EMPTY
//         ===================================== */}

//         {!loading &&
//           filteredOrders.length === 0 && (

//             <div className="empty-state">

//               <ShoppingCart size={40} />

//               <h3>
//                 No orders found
//               </h3>

//               <p>
//                 Try changing your search
//                 or status filter.
//               </p>

//             </div>

//           )}


//         {/* ====================================
//             TABLE
//         ===================================== */}

//         {!loading &&
//           filteredOrders.length > 0 && (

//             <div className="table-wrapper">

//               <table>

//                 <thead>

//                   <tr>

//                     <th>
//                       Order
//                     </th>

//                     <th>
//                       Customer
//                     </th>

//                     <th>
//                       Items
//                     </th>

//                     <th>
//                       Amount
//                     </th>

//                     <th>
//                       Status
//                     </th>

//                     <th>
//                       Date
//                     </th>

//                     <th>
//                       Action
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {filteredOrders.map(
//                     (order) => (

//                       <tr
//                         key={order.Id}
//                       >

//                         <td>

//                           <strong>
//                             #{order.Id}
//                           </strong>

//                         </td>


//                         <td>

//                           <div className="product-name">

//                             <div className="user-avatar">

//                               {order.UserName
//                                 .charAt(0)
//                                 .toUpperCase()}

//                             </div>

//                             <div>

//                               <strong>
//                                 {order.UserName}
//                               </strong>

//                               <div className="table-subtext">
//                                 {order.Email}
//                               </div>

//                             </div>

//                           </div>

//                         </td>


//                         <td>

//                           {order.ItemCount}

//                           {" "}

//                           {order.ItemCount === 1
//                             ? "item"
//                             : "items"}

//                         </td>


//                         <td>

//                           <strong>
//                             {formatPrice(
//                               order.TotalAmount
//                             )}
//                           </strong>

//                         </td>


//                         <td>

//                           <span
//                             className={
//                               `order-status ${order.Status.toLowerCase()}`
//                             }
//                           >
//                             {order.Status}
//                           </span>

//                         </td>


//                         <td>
//                           {formatDate(
//                             order.CreatedAt
//                           )}
//                         </td>


//                         <td>

//                           <button
//                             className="icon-button edit"
//                             title="View order"
//                             onClick={() =>
//                               viewOrder(
//                                 order.Id
//                               )
//                             }
//                           >

//                             <Eye
//                               size={17}
//                             />

//                           </button>

//                         </td>

//                       </tr>

//                     )
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           )}

//       </div>


//       {/* ======================================
//           ORDER DETAIL MODAL
//       ======================================= */}

//       {selectedOrder && (

//         <div
//           className="modal-overlay"
//           onMouseDown={(event) => {

//             if (
//               event.target ===
//               event.currentTarget
//             ) {
//               closeOrder();
//             }

//           }}
//         >

//           <div className="modal order-modal">

//             <div className="modal-header">

//               <div>

//                 <h2>
//                   Order #{selectedOrder.order.Id}
//                 </h2>

//                 <p>
//                   Order details and items
//                 </p>

//               </div>


//               <button
//                 className="modal-close"
//                 onClick={closeOrder}
//               >
//                 <X size={20} />
//               </button>

//             </div>


//             {loadingOrder ? (

//               <div className="empty-state">

//                 Loading...

//               </div>

//             ) : (

//               <div className="order-details">

//                 {/* CUSTOMER */}

//                 <div className="order-section">

//                   <h3>
//                     Customer
//                   </h3>

//                   <div className="customer-detail">

//                     <div className="user-avatar">

//                       {selectedOrder.order.UserName
//                         .charAt(0)
//                         .toUpperCase()}

//                     </div>

//                     <div>

//                       <strong>
//                         {selectedOrder.order.UserName}
//                       </strong>

//                       <p>
//                         {selectedOrder.order.Email}
//                       </p>

//                     </div>

//                   </div>

//                 </div>


//                 {/* STATUS */}

//                 <div className="order-section">

//                   <h3>
//                     Status
//                   </h3>

//                   <select
//                     className="status-select"
//                     value={
//                       selectedOrder
//                         .order
//                         .Status
//                     }
//                     onChange={(event) =>
//                       updateStatus(
//                         selectedOrder.order.Id,
//                         event.target.value
//                       )
//                     }
//                   >

//                     <option value="Pending">
//                       Pending
//                     </option>

//                     <option value="Processing">
//                       Processing
//                     </option>

//                     <option value="Completed">
//                       Completed
//                     </option>

//                     <option value="Cancelled">
//                       Cancelled
//                     </option>

//                   </select>

//                 </div>


//                 {/* ITEMS */}

//                 <div className="order-section">

//                   <h3>
//                     Order Items
//                   </h3>


//                   <div className="order-items">

//                     {selectedOrder.items.map(
//                       (item) => (

//                         <div
//                           className="order-item"
//                           key={item.Id}
//                         >

//                           <div>

//                             <strong>
//                               {item.ProductName}
//                             </strong>

//                             <p>
//                               {item.Quantity}
//                               {" × "}
//                               {formatPrice(
//                                 item.Price
//                               )}
//                             </p>

//                           </div>


//                           <strong>

//                             {formatPrice(
//                               item.Subtotal
//                             )}

//                           </strong>

//                         </div>

//                       )
//                     )}

//                   </div>

//                 </div>


//                 {/* TOTAL */}

//                 <div className="order-total">

//                   <span>
//                     Total
//                   </span>

//                   <strong>
//                     {formatPrice(
//                       selectedOrder
//                         .order
//                         .TotalAmount
//                     )}
//                   </strong>

//                 </div>

//               </div>

//             )}

//           </div>

//         </div>

//       )}

//     </div>
//   );
// }

// export default Orders;

// import { ShoppingCart } from "lucide-react";

// function Orders() {
//   return (
//     <div>

//       <div className="page-header">

//         <div>
//           <h1>Orders</h1>

//           <p>
//             Manage customer orders
//           </p>
//         </div>

//       </div>

//       <div className="dashboard-card">

//         <div className="empty-state">

//           <ShoppingCart size={40} />

//           <h3>
//             Orders Management
//           </h3>

//           <p>
//             Orders will be connected to the
//             backend API next.
//           </p>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Orders;
