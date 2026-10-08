import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users as UsersIcon,
  X,
  ShieldCheck,
  User,
  Mail,
  CalendarDays,
  UserRound,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

import api from "../services/api";


function Users() {

  const emptyForm = {
    name: "",
    email: "",
    role: "user",
    password: ""
  };

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showPassword, setShowPassword] = useState(false);


  // =========================================================
  // FETCH USERS
  // =========================================================

  useEffect(() => {
    fetchUsers();
  }, []);


  async function fetchUsers() {

    try {

      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data);

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to load users."
      );

    } finally {

      setLoading(false);

    }
  }


  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleChange(event) {

    const {
      name,
      value
    } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }


  // =========================================================
  // ADD USER
  // =========================================================

  function openAddModal() {

    setEditingUser(null);
    setForm(emptyForm);
    setShowPassword(false);
    setError("");
    setModalOpen(true);
  }


  // =========================================================
  // EDIT USER
  // =========================================================

  function openEditModal(user) {

    setEditingUser(user);

    setForm({
      name: user.Name || "",
      email: user.Email || "",
      role: user.Role || "user",
      password: ""
    });

    setShowPassword(false);
    setError("");
    setModalOpen(true);
  }


  // =========================================================
  // CLOSE MODAL
  // =========================================================

  function closeModal() {

    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setShowPassword(false);
    setError("");
  }


  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit(event) {

    event.preventDefault();

    try {

      setSaving(true);
      setError("");

      const name = form.name.trim();
      const email = form.email.trim();

      if (!name || !email) {

        setError(
          "Name and email are required."
        );

        return;
      }

      if (!editingUser && !form.password) {

        setError(
          "Password is required for a new user."
        );

        return;
      }

      if (!email.includes("@")) {

        setError(
          "Please enter a valid email."
        );

        return;
      }


      // -------------------------------------------------------
      // CREATE
      // -------------------------------------------------------

      if (!editingUser) {

        await api.post(
          "/users",
          {
            name,
            email,
            password: form.password,
            role: form.role
          }
        );

      }


      // -------------------------------------------------------
      // UPDATE
      // -------------------------------------------------------

      else {

        await api.put(
          `/users/${editingUser.Id}`,
          {
            name,
            email,
            role: form.role
          }
        );

      }


      closeModal();

      await fetchUsers();

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to save user."
      );

    } finally {

      setSaving(false);

    }
  }


  // =========================================================
  // DELETE
  // =========================================================

  async function deleteUser(user) {

    const confirmed = window.confirm(
      user.Role === "admin"
        ? `Delete admin "${user.Name}"?`
        : `Delete "${user.Name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");

      await api.delete(
        `/users/${user.Id}`
      );

      await fetchUsers();

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to delete user."
      );
    }
  }


  // =========================================================
  // FILTER
  // =========================================================

  const filteredUsers = useMemo(() => {

    const searchText =
      search.toLowerCase().trim();

    return users.filter(user => {

      const matchesSearch =
        !searchText ||
        user.Name?.toLowerCase().includes(searchText) ||
        user.Email?.toLowerCase().includes(searchText) ||
        user.Role?.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "all" ||
        user.Role?.toLowerCase() === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });

  }, [
    users,
    search,
    roleFilter
  ]);


  // =========================================================
  // STATISTICS
  // =========================================================

  const totalUsers = users.length;

  const adminUsers =
    users.filter(
      user =>
        user.Role?.toLowerCase() === "admin"
    ).length;
  const vendorUsers =
    users.filter(
      user =>
        user.Role?.toLowerCase() === "vendor"
    ).length;
  const normalUsers =
    users.filter(
      user =>
        user.Role?.toLowerCase() === "user"
    ).length;


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


  // =========================================================
  // AVATAR
  // =========================================================

  function getInitials(name = "") {

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase();
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">

                <UsersIcon size={22} />

              </div>

              <div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Users
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage dashboard users, roles and access.
                </p>

              </div>

            </div>

          </div>


          <button
            onClick={openAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >

            <Plus size={18} />

            Add User

          </button>

        </div>


        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && !modalOpen && (

          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

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
            STATISTICS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">


          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Users
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalUsers}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <UsersIcon size={21} />
              </div>

            </div>

          </div>


          {/* ADMINS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Administrators
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {adminUsers}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ShieldCheck size={21} />
              </div>

            </div>

          </div>


          {/* VENDORS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Vendors
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {vendorUsers}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User size={21} />
              </div>
            </div>
          </div>

          {/* NORMAL USERS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Regular Users
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {normalUsers}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <User size={21} />
              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            USERS CARD
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


          {/* TOOLBAR */}

          <div className="border-b border-slate-200 p-4 sm:p-5">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">


              {/* SEARCH */}

              <div className="relative w-full lg:max-w-md">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search by name, email or role..."
                  value={search}
                  onChange={event =>
                    setSearch(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />

                {search && (

                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>

                )}

              </div>


              {/* FILTER */}

              <div className="flex items-center gap-3">

                <select
                  value={roleFilter}
                  onChange={event =>
                    setRoleFilter(event.target.value)
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >

                  <option value="all">
                    All Roles
                  </option>

                  <option value="admin">
                    Administrators
                  </option>
                  <option value="vendor">
                    Vendors
                  </option>
                  <option value="user">
                    Users
                  </option>

                </select>


                <div className="hidden rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 sm:block">

                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1
                    ? "user"
                    : "users"}

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================== */}

          {loading && (

            <div className="divide-y divide-slate-100">

              {[1, 2, 3, 4].map(item => (

                <div
                  key={item}
                  className="flex items-center gap-4 px-5 py-5"
                >

                  <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />

                  <div className="flex-1 space-y-2">

                    <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />

                    <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />

                  </div>

                  <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />

                </div>

              ))}

            </div>

          )}


          {/* =================================================
              EMPTY
          ================================================== */}

          {!loading &&
            filteredUsers.length === 0 && (

              <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                  <UsersIcon size={30} />

                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  No users found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">

                  {search || roleFilter !== "all"
                    ? "Try changing your search or filter."
                    : "Create your first dashboard user to get started."}

                </p>

                {!search &&
                  roleFilter === "all" && (

                    <button
                      onClick={openAddModal}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >

                      <Plus size={17} />

                      Add User

                    </button>

                  )}

              </div>

            )}


          {/* =================================================
              DESKTOP TABLE
          ================================================== */}

          {!loading &&
            filteredUsers.length > 0 && (

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-slate-200 bg-slate-50/70">

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Created
                      </th>

                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {filteredUsers.map(user => (

                      <tr
                        key={user.Id}
                        className="transition hover:bg-slate-50/70"
                      >


                        {/* USER */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">

                              {getInitials(user.Name)}

                            </div>

                            <div>

                              <p className="font-semibold text-slate-900">
                                {user.Name}
                              </p>

                              <p className="text-xs text-slate-400">
                                ID #{user.Id}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* EMAIL */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <Mail
                              size={15}
                              className="text-slate-400"
                            />

                            {user.Email}

                          </div>

                        </td>


                        {/* ROLE */}

                        <td className="px-5 py-4">

                          {user.Role === "admin" ? (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">

                              <ShieldCheck size={13} />

                              Admin

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">

                              <User size={13} />

                              User

                            </span>

                          )}

                        </td>


                        {/* DATE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm text-slate-500">

                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            {formatDate(user.CreatedAt)}

                          </div>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openEditModal(user)
                              }
                              title="Edit user"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >

                              <Pencil size={16} />

                            </button>


                            <button
                              onClick={() =>
                                deleteUser(user)
                              }
                              title="Delete user"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >

                              <Trash2 size={16} />

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}


          {/* =================================================
              MOBILE CARDS
          ================================================== */}

          {!loading &&
            filteredUsers.length > 0 && (

              <div className="divide-y divide-slate-100 md:hidden">

                {filteredUsers.map(user => (

                  <div
                    key={user.Id}
                    className="p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">

                          {getInitials(user.Name)}

                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-semibold text-slate-900">
                            {user.Name}
                          </p>

                          <p className="truncate text-sm text-slate-500">
                            {user.Email}
                          </p>

                        </div>

                      </div>


                      <div className="flex gap-1">

                        <button
                          onClick={() =>
                            openEditModal(user)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                        >

                          <Pencil size={16} />

                        </button>

                        <button
                          onClick={() =>
                            deleteUser(user)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >

                          <Trash2 size={16} />

                        </button>

                      </div>

                    </div>


                    <div className="mt-4 flex items-center justify-between">

                      {user.Role === "admin" ? (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700">

                          <ShieldCheck size={13} />

                          Admin

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">

                          <User size={13} />

                          User

                        </span>

                      )}

                      <span className="text-xs text-slate-400">

                        {formatDate(user.CreatedAt)}

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

        </div>

      </div>


      {/* =====================================================
          MODAL
      ====================================================== */}

      {modalOpen && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={event => {

            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">


            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                    {editingUser
                      ? <Pencil size={19} />
                      : <UserRound size={19} />}

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">

                      {editingUser
                        ? "Edit User"
                        : "Add New User"}

                    </h2>

                    <p className="mt-0.5 text-sm text-slate-500">

                      {editingUser
                        ? "Update account details and role."
                        : "Create a new dashboard user account."}

                    </p>

                  </div>

                </div>

              </div>


              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <X size={20} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >


              {/* FORM ERROR */}

              {error && (

                <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  <span>
                    {error}
                  </span>

                  <button
                    type="button"
                    onClick={() => setError("")}
                  >

                    <X size={16} />

                  </button>

                </div>

              )}


              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="relative">

                  <UserRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

              </div>


              {/* PASSWORD */}

              {!editingUser && (

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Password

                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          previous => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >

                      {showPassword
                        ? <EyeOff size={17} />
                        : <Eye size={17} />}

                    </button>

                  </div>

                  <p className="mt-2 text-xs text-slate-400">

                    Password authentication can be upgraded to bcrypt on the backend.

                  </p>

                </div>

              )}


              {/* ROLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  User Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >

                  <option value="user">
                    User
                  </option>

                  <option value="admin">
                    Administrator
                  </option>
                  <option value="vendor">
                    Vendor
                  </option>

                </select>

              </div>


              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;




// import { useEffect, useState } from "react";
// import { Users as UsersIcon, Shield, User, X } from "lucide-react";
// import api from "../services/api";

// function Users() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function loadUsers() {
//       try {
//         setLoading(true);
//         setError("");
//         const response = await api.get("/users");
//         setUsers(response.data);
//       } catch (error) {
//         console.error(error);
//         setError("Unable to retrieve user directory. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadUsers();
//   }, []);

//   return (
//     <div className="p-6 max-w-7xl mx-auto space-y-6">
//       {/* ========================================
//           HEADER
//       ========================================= */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Directory</h1>
//           <p className="text-sm text-gray-500 mt-1">Review accounts and assigned organizational roles</p>
//         </div>
//       </div>

//       {/* ========================================
//           ERROR BANNER
//       ========================================= */}
//       {error && (
//         <div className="flex items-center justify-between rounded-md bg-red-50 p-4 border border-red-200">
//           <p className="text-sm text-red-700 font-medium">{error}</p>
//           <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
//             <X size={18} />
//           </button>
//         </div>
//       )}

//       {/* ========================================
//           USERS TABLE INTERFACE CARD
//       ========================================= */}
//       <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//         {/* TOOLBAR */}
//         <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
//           <div className="text-sm text-gray-600 font-medium">
//             {users.length} registered user{users.length !== 1 ? "s" : ""}
//           </div>
//         </div>

//         {/* LOADING STATE */}
//         {loading && (
//           <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
//             <UsersIcon size={48} className="animate-pulse text-indigo-500" />
//             <p className="text-sm font-medium text-gray-500">Loading user metadata...</p>
//           </div>
//         )}

//         {/* EMPTY STATE */}
//         {!loading && users.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-20 text-center px-4">
//             <UsersIcon size={48} className="text-gray-300 mb-3" />
//             <h3 className="text-base font-semibold text-gray-900">No users registered</h3>
//             <p className="text-sm text-gray-500 mt-1 max-w-xs">
//               There are currently no standard accounts available inside the database module.
//             </p>
//           </div>
//         )}

//         {/* TABLE DATA */}
//         {!loading && users.length > 0 && (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
//                   <th className="py-3 px-5 w-24">ID</th>
//                   <th className="py-3 px-5">Name</th>
//                   <th className="py-3 px-5">Email Address</th>
//                   <th className="py-3 px-5 text-center w-40">System Role</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
//                 {users.map((user) => (
//                   <tr key={user.Id} className="hover:bg-gray-50/70 transition">
//                     <td className="py-4 px-5 font-mono text-xs text-gray-400">#{user.Id}</td>
//                     <td className="py-4 px-5 font-semibold text-gray-900">
//                       <div className="flex items-center gap-2">
//                         <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase text-xs">
//                           {user.Name ? user.Name.charAt(0) : "U"}
//                         </div>
//                         {user.Name}
//                       </div>
//                     </td>
//                     <td className="py-4 px-5 text-gray-600">{user.Email}</td>
//                     <td className="py-4 px-5 text-center">
//                       {user.Role?.toLowerCase() === "admin" ? (
//                         <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
//                           <Shield size={12} />
//                           Admin
//                         </span>
//                       ) : (
//                         <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
//                           <User size={12} />
//                           User
//                         </span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Users;


// import {
//   useEffect,
//   useState
// } from "react";

// import api from "../services/api";

// function Users() {

//   const [users, setUsers] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   useEffect(() => {

//     async function loadUsers() {

//       try {

//         const response =
//           await api.get("/users");

//         setUsers(response.data);

//       } catch (error) {

//         console.error(error);

//       } finally {

//         setLoading(false);
//       }
//     }

//     loadUsers();

//   }, []);

//   if (loading) {
//     return <p>Loading users...</p>;
//   }

//   return (
//     <div>

//       <h1>Users</h1>

//       <table>

//         <thead>

//           <tr>
//             <th>ID</th>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Role</th>
//           </tr>

//         </thead>

//         <tbody>

//           {users.map(user => (

//             <tr key={user.Id}>

//               <td>
//                 {user.Id}
//               </td>

//               <td>
//                 {user.Name}
//               </td>

//               <td>
//                 {user.Email}
//               </td>

//               <td>
//                 {user.Role}
//               </td>

//             </tr>

//           ))}

//         </tbody>

//       </table>

//     </div>
//   );
// }

// export default Users;



// import { Users as UsersIcon } from "lucide-react";

// function Users() {
//   return (
//     <div>

//       <div className="page-header">

//         <div>
//           <h1>Users</h1>

//           <p>
//             Manage registered users
//           </p>
//         </div>

//       </div>

//       <div className="dashboard-card">

//         <div className="empty-state">

//           <UsersIcon size={40} />

//           <h3>
//             Users Management
//           </h3>

//           <p>
//             User management will be connected
//             to the API next.
//           </p>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Users;