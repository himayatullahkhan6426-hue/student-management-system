import Header from "./Header";
import WelcomeCard from "./WelcomeCard";
import GPACalculator from "./GPACalculator";

function Dashboard({ user, handleLogout }) {
return ( <main className="dashboard-page"> <Header handleLogout={handleLogout} />

  <WelcomeCard user={user} />

  <GPACalculator user={user} />
</main>

);
}

export default Dashboard;
