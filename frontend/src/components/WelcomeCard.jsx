function WelcomeCard({ user }) {
return ( <section className="welcome-card"> <div> <span className="welcome-label">
WELCOME BACK </span>

    <h1>
      Hello, {user?.name}! 👋
    </h1>

    <p>
      Select your grades below and calculate
      your semester GPA.
    </p>
  </div>

  <div className="user-avatar">
    {user?.name?.charAt(0).toUpperCase()}
  </div>
</section>

);
}

export default WelcomeCard;
