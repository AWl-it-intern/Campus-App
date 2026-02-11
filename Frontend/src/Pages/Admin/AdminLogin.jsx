// import React from "react"; 

const AdminLogin = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle login logic here
    console.log("Login submitted");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#003329] to-[#00988D] p-4">
      <div className="w-full max-w-md bg-[#003329] rounded-2xl shadow-2xl p-8 border border-[#00988D]/40">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#66D095]">Admin Login</h1>
          <p className="text-sm text-[#66D095]/70">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-1 text-[#E6FFF6]">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[#00261F] text-[#E6FFF6] 
                         border border-[#00988D]/40 focus:outline-none focus:ring-2 
                         focus:ring-[#66D095] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#E6FFF6]">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#00261F] text-[#E6FFF6] 
                         border border-[#00988D]/40 focus:outline-none focus:ring-2 
                         focus:ring-[#66D095] focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-[#003329] 
                       bg-[#66D095] hover:bg-[#00988D] hover:text-white 
                       transition-all active:scale-[0.98]"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-[#66D095]/70">
          © {new Date().getFullYear()} Admin Panel
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
