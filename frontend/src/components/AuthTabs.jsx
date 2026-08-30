function AuthTabs({ page, setPage, setMessage }) {
return ( <div className="auth-tabs">
<button
type="button"
className={page === "login" ? "active" : ""}
onClick={() => {
setPage("login");
setMessage("");
}}
>
Login </button>

  <button
    type="button"
    className={page === "register" ? "active" : ""}
    onClick={() => {
      setPage("register");
      setMessage("");
    }}
  >
    Register
  </button>
</div>

);
}

export default AuthTabs;
