import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../../style/reels.css';
import axios from 'axios';

function PartnerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [partner, setPartner] = useState(state?.partner ?? null);
  const [videos, setVideos] = useState((state?.partnerVideos ?? []).map(v => ({ ...v, likesCount: v.likes?.length || 0, commentsCount: v.comments?.length || 0, shares: v.shares || 0 })));
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!partner) {
          const res = await axios.get(`http://localhost:3000/api/auth/foodpartner/${id}`);
          setPartner(res.data.partner);
          setVideos(res.data.foodItems.map(v => ({ ...v, likesCount: v.likes?.length || 0, commentsCount: v.comments?.length || 0, shares: v.shares || 0 })));
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/auth/user/me', { withCredentials: true });
        setCurrentUser(res.data.user);
        setIsFollowing(res.data.user.Following?.some(f => String(f) === String(id)));
      } catch (err) {
        setCurrentUser(null);
        setIsFollowing(false);
      }
    };

    fetchData();
    fetchUser();
  }, [id]);

  const toggleFollow = async () => {
    if (!partner?._id) return;
    try {
      const res = await axios.post(`http://localhost:3000/api/auth/user/follow/${partner._id}`, {}, { withCredentials: true });
      setIsFollowing(res.data.following.includes(partner._id));
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/user/login');
      console.error(err);
    }
  };

  const handleLike = async (foodId, idx) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/food/${foodId}/like`, {}, { withCredentials: true });
      setVideos(prev => prev.map((v, i) => (String(v._id) === String(foodId) ? { ...v, likesCount: res.data.likesCount, _liked: res.data.liked } : v)));
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/user/login');
      console.error(err);
    }
  };

  const handleComment = async (foodId) => {
    const text = window.prompt('Add a comment:');
    if (!text) return;
    try {
      const res = await axios.post(`http://localhost:3000/api/food/${foodId}/comment`, { text }, { withCredentials: true });
      setVideos(prev => prev.map(v => (String(v._id) === String(foodId) ? { ...v, commentsCount: res.data.commentsCount } : v)));
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/user/login');
      console.error(err);
    }
  };

  const handleShare = async (food) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/food/${food._id}/share`, {}, { withCredentials: true });
      setVideos(prev => prev.map(v => (String(v._id) === String(food._id) ? { ...v, shares: res.data.shares } : v)));

      const shareUrl = `${window.location.origin}/share/food/${food._id}`;
      if (navigator.share) {
        await navigator.share({ title: food.name || 'Food', text: food.description || '', url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard');
      } else {
        prompt('Copy this link to share:', shareUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!partner) {
    return (
      <main style={{height:'100dvh', display:'grid', placeItems:'center', background:'var(--color-bg)'}}>
        <div style={{textAlign:'center'}}>
          <h3>Profile not available</h3>
          <p>Open a profile from the feed to view it here.</p>
          <button onClick={() => navigate(-1)} style={{marginTop:12}}>Back to feed</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{minHeight:'100dvh', background:'var(--color-bg)'}}>
      <header style={{display:'flex', alignItems:'center', gap:12, padding:16}}>
        <button onClick={() => navigate(-1)} style={{padding:8}}>Back</button>
        <h2 style={{margin:0}}>{partner.name}</h2>
      </header>

      <section style={{padding:16}}>
        <div style={{display:'flex', gap:16, alignItems:'center'}}>
          <img src={`https://i.pravatar.cc/120?u=${partner._id || partner.name}`} alt={`${partner.name} avatar`} style={{width:96,height:96,borderRadius:999}} />
          <div>
            <div style={{fontWeight:800, fontSize:20}}>{partner.name}</div>
            {partner.contactName && <div style={{color:'var(--muted)', marginTop:6}}>{partner.contactName}</div>}
            {partner.email && <div style={{marginTop:8}}>{partner.email}{partner.phone ? ` · ${partner.phone}` : ''}</div>}
            {partner.address && <div style={{marginTop:8}}>{partner.address}</div>}
            <div style={{marginTop:12}}>
              <button className="reel-btn" onClick={toggleFollow}>{isFollowing ? 'Following' : 'Follow'}</button>
            </div>
          </div>
        </div>

        <hr style={{margin:'18px 0'}} />

        <h3>Posts</h3>
        {videos.length === 0 ? (
          <div>No reels yet</div>
        ) : (
          <div style={{display:'grid', gap:12, marginTop:12}}>
            {videos.map((v, i) => (
              <div key={v._id || i} style={{background:'#000', borderRadius:8, overflow:'hidden'}}>
                <video src={v.video} controls style={{width:'100%', height:240, objectFit:'cover'}} />
                <div style={{padding:12}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                    <div>
                      <div style={{color:'#fff', fontWeight:700}}>{v.name}</div>
                      <div style={{color:'#ddd'}}>{v.description}</div>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'center'}}>
                      <button className={`reel-action ${v._liked ? 'liked' : ''}`} onClick={() => handleLike(v._id, i)}>❤️</button>
                      <div style={{color:'#fff'}}>{v.likesCount ?? 0}</div>
                      <button className="reel-action" onClick={() => handleComment(v._id)}>💬</button>
                      <div style={{color:'#fff'}}>{v.commentsCount ?? 0}</div>
                      <button className="reel-action" onClick={() => handleShare(v)}>🔗</button>
                      <div style={{color:'#fff'}}>{v.shares ?? 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default PartnerProfile
