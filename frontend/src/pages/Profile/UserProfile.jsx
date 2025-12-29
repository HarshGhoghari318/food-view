import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../style/profile.css";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/auth/user/me", {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => {
    fetchUser();
  }, []);



  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/api/auth/user/logout", {
        withCredentials: true,
      });
      navigate("/user/login");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <main className="center">
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="center">
        <p>Please log in to view your profile.</p>
        <button onClick={() => navigate('/user/login')}>Go to Login</button>
      </main>
    );
  }

return (
  <main className="profile-page-dark">
    {/* TOP BAR */}
    <header className="profile-topbar-dark">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>
      <span className="topbar-name">Profile</span>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </header>

    {/* PROFILE CONTENT */}
    <section className="profile-body">
      <img
        className="profile-avatar-large"
        src={
          user.Image ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        alt={user.fullName}
      />

      <div className="profile-details">
        <h2>{user.fullName}</h2>
        <p className="profile-email">{user.email}</p>
        <p>{user.gender}</p>
        <p>Following: {user.Following?.length || 0}</p>
      </div>
    </section>
  </main>
);

}

export default UserProfile