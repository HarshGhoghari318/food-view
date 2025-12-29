import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../style/profile.css";

function PartnerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [partner, setPartner] = useState(state?.partner || null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPartner, setPartnerRole] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const viewerRef = useRef(null);
  const handleLogout = async ()=> {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/auth/foodpartner/logout",
        { withCredentials: true }
      );
    navigate("/food-partner/login")
    } catch (err) {
      console.error(err);
    }

  }

  const fetchPartner = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/api/auth/foodpartner/${id}`,
        { withCredentials: true }
      );

      setPartner(res.data.partner);
      setVideos(res.data.foodItems || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const getPartnerMe = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/getpartnerFtoken/me",
        { withCredentials: true }
      );
      console.log(res);
      setPartnerRole(res.data.partner);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchPartner();
  }, [id]);
  useEffect(() => {
    getPartnerMe();
  }, []);

  useEffect(() => {
    if (!isViewerOpen) return;

    const vids = viewerRef.current?.querySelectorAll("video");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.isIntersecting ? entry.target.play() : entry.target.pause()
        );
      },
      { threshold: 0.7 }
    );

    vids?.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [isViewerOpen]);

  /* ================= LOADER ================= */
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

  /* ================= NO DATA ================= */
  if (!partner) {
    return (
      <main className="center">
        <p>Profile not available</p>
        <button onClick={() => navigate(-1)}>Back</button>
      </main>
    );
  }

  return (
    <main className="profile-page-dark">
      {/* TOP BAR */}
      <header className="profile-topbar-dark">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>

        <span className="topbar-name">{partner.name}</span>

        {isPartner && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      {/* PROFILE HEADER */}
      <section className="partner-header">
        <img
          className="profile-avatar-large"
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt={partner.name}
        />

        <div className="partner-meta">
          <h2>{partner.name}</h2>
          <p className="muted">{partner.email}</p>
          <p className="muted">{partner.address}</p>
        </div>
      </section>

      {/* REELS SECTION */}
      <section className="profile-posts">
        <h4 className="section-title">Reels</h4>

        {videos.length === 0 ? (
          <p className="muted">No reels yet</p>
        ) : (
          <div className="reels-grid">
            {videos.map((v, index) => (
              <div
                key={v._id}
                className="reel-thumb"
                onClick={() => {
                  setStartIndex(index);
                  setIsViewerOpen(true);
                }}
              >
                <video src={v.video} muted />
                <span className="reel-play">▶</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FLOATING CREATE BUTTON */}
      {isPartner && (
        <button
          className="create-reel-btn"
          onClick={() => navigate("/create-food")}
        >
          + Create Reel
        </button>
      )}

      {/* FULLSCREEN VIEWER */}
      {isViewerOpen && (
        <div className="reels-modal">
          <button
            className="close-reels"
            onClick={() => setIsViewerOpen(false)}
          >
            ✕
          </button>

          <div
            ref={viewerRef}
            className="reels-scroll"
            style={{ transform: `translateY(-${startIndex * 100}vh)` }}
          >
            {videos.map((v) => (
              <div key={v._id} className="reel-full">
                <video src={v.video} loop muted playsInline />
                <div className="reel-caption">
                  <h5>{v.name}</h5>
                  <p>{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default PartnerProfile;
