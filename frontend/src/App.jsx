import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

function App() {
const [page, setPage] = useState("login");
const [user, setUser] = useState(null);

const handleLogout = () => {
setUser(null);
setPage("login");
};

if (page === "admin") {

if (!user || user.is_admin !== 1) {
setPage("login");
return null;
}

return ( <AdminDashboard
   setPage={setPage}
   setUser={setUser}
 />
);
}



if (page === "software") {
return ( <Dashboard
     user={user}
     handleLogout={handleLogout}
   />
);
}

return ( <main className="auth-page"> <section className="auth-container">
{page === "login" ? ( <Login
         setPage={setPage}
         setUser={setUser}
       />
) : ( <Register setPage={setPage} />
)} </section> </main>
);
}

export default App;
