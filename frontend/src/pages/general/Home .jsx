import React, { useEffect, useRef, useState } from 'react';
import '../../style/reels.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const feedRef = useRef(null);
  const videoRefs = useRef(new Map());
  const currentPlaying = useRef(null);

  const [videos, setVideos] = useState([]);

  const [playIndicator, setPlayIndicator] = useState({});

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);

  const GetData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/food/getfoods",
        { withCredentials: true }
      );
      const foods = response.data.foods || [];
      setVideos(foods.map(f => ({ ...f, _liked: Boolean((currentUser && currentUser._id) && f.likes?.some ? f.likes.some(l => String(l._id || l) === String(currentUser._id)) : false), likesCount: f.likes?.length || 0, commentsCount: f.comments?.length || 0, shares: f.shares || 0 })));
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/auth/user/me', { withCredentials: true });
      setCurrentUser(res.data.user);
      // mark liked flags on currently loaded videos
      setVideos(prev => prev.map(v => ({ ...v, _liked: Boolean(v.likes?.some ? v.likes.some(l => String(l._id || l) === String(res.data.user._id)) : false) })));
    } catch (err) {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    GetData();
    fetchCurrentUser();
  }, []);

 
  useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const toPlay =
          visible.length && visible[0].intersectionRatio >= 0.6
            ? visible[0].target
            : null;

        videoRefs.current.forEach(video => {
          if (video === toPlay) {
            if (currentPlaying.current !== video) {
              currentPlaying.current = video;
              video.play().catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0.25, 0.5, 0.75, 1] }
    );

    const vids = feedRef.current?.querySelectorAll('.reel-video') || [];
    vids.forEach((v, i) => {
      videoRefs.current.set(i, v);
      observer.observe(v);
    });

    return () => {
      observer.disconnect();
      videoRefs.current.clear();
    };
  }, [videos]);

  
  



  const handleViewProfile = (partnerIdOrItem) => {
    if (!partnerIdOrItem) return;

    // accept either the partner id or the whole item
    let id = null;
    let partner = null;

    if (typeof partnerIdOrItem === 'object') {
      const item = partnerIdOrItem;
      id = item.foodPartnerId?._id || item.foodPartnerId;
      partner = item.foodPartnerId || null;
    } else {
      id = partnerIdOrItem;
      const first = videos.find(v => String(v.foodPartnerId?._id || v.foodPartnerId) === String(id));
      partner = first?.foodPartnerId || null;
    }

    const partnerVideos = videos.filter(v => String(v.foodPartnerId?._id || v.foodPartnerId) === String(id));

    if (!id) {
      
      if (partnerIdOrItem && typeof partnerIdOrItem === 'object') {
        const synthetic = { name: partnerIdOrItem.foodPartnerName || partnerIdOrItem.name || 'Partner' };
        navigate(`/profile/unknown`, { state: { partner: synthetic, partnerVideos: [partnerIdOrItem] } });
      }
      return;
    }

    navigate(`/profile/${id}`, { state: { partner, partnerVideos } });
  };


  const togglePlay = (idx, e) => {
    e.stopPropagation();
    const video = videoRefs.current.get(idx);
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      currentPlaying.current = video;
      setPlayIndicator(prev => ({ ...prev, [idx]: 'play' }));
    } else {
      video.pause();
      setPlayIndicator(prev => ({ ...prev, [idx]: 'pause' }));
    }

    setTimeout(() => {
      setPlayIndicator(prev => ({ ...prev, [idx]: null }));
    }, 600);
  };

  const toggleFollow = async (partnerId, e) => {
    if (e) e.stopPropagation();
    if (!partnerId) return;
    try {
      const res = await axios.post(`http://localhost:3000/api/auth/user/follow/${partnerId}`, {}, { withCredentials: true });
      setCurrentUser(prev => ({ ...prev, Following: res.data.following }));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/user/login');
      } else {
        console.error('Follow error', err);
      }
    }
  };

  const handleLike = async (foodId, idx, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await axios.post(`http://localhost:3000/api/food/${foodId}/like`, {}, { withCredentials: true });
      const liked = res.data.liked;
      const likesCount = res.data.likesCount;
      setVideos(prev => prev.map(v => (String(v._id) === String(foodId) ? { ...v, likesCount, _liked: liked } : v)));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/user/login');
      } else {
        console.error('Like error', err);
      }
    }
  };

  const handleComment = async (foodId, e) => {
    if (e) e.stopPropagation();
    const text = window.prompt('Add a comment:');
    if (!text) return;
    try {
      const res = await axios.post(`http://localhost:3000/api/food/${foodId}/comment`, { text }, { withCredentials: true });
      const commentsCount = res.data.commentsCount;
      // update local item
      setVideos(prev => prev.map(v => (String(v._id) === String(foodId) ? { ...v, commentsCount } : v)));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/user/login');
      } else {
        console.error('Comment error', err);
      }
    }
  };

  const handleShare = async (food, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await axios.post(`http://localhost:3000/api/food/${food._id}/share`, {}, { withCredentials: true });
      const shares = res.data.shares;
      setVideos(prev => prev.map(v => (String(v._id) === String(food._id) ? { ...v, shares } : v)));

      const shareUrl = `${window.location.origin}/share/food/${food._id}`;
      const shareData = { title: food.name || 'Food', text: food.description || '', url: shareUrl };

      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard');
      } else {
        prompt('Copy this link to share:', shareUrl);
      }
    } catch (err) {
      console.error('Share error', err);
    }
  };

  const openReelAt = (idx) => {
    const reels = feedRef.current?.querySelectorAll('.reel') || [];
    if (!reels[idx]) return;
    reels[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const v = videoRefs.current.get(idx);
      if (v) {
        v.play().catch(() => {});
        currentPlaying.current = v;
      }
    }, 450);
  };

  return (
    <main className="reels-page">

      {/* <section className="reels-grid" aria-label="Explore reels">
        {videos.map((item, idx) => (
          <div key={item._id || idx} className="grid-item" onClick={() => openReelAt(idx)}>
            <video className="grid-video" src={item.video} muted playsInline preload="metadata" />
            <div className="grid-overlay">
              <div className="grid-play">▶</div>
              <div className="grid-count">{Math.floor((idx + 1) * 3.4)}k</div>
            </div>
          </div>
        ))}
      </section> */}

      <section className="reels-feed" ref={feedRef}>
        {videos.map((item, idx) => { 
          const partnerId = item.foodPartnerId?._id || item.foodPartnerId;
          const isFollowing = currentUser?.Following?.some(f => String(f) === String(partnerId));
          return (
          <article
            key={item._id}
            className="reel"
            onClick={() => setMenuOpen(null)}
          >
            <video
              className="reel-video"
              src={item.video}
              muted
              loop
              playsInline
              preload="metadata"
              onClick={(e) => togglePlay(idx, e)}
            />

            <div className="reel-overlay">
              <div className="reel-content">
                <div className="reel-profile" onClick={(e) => { e.stopPropagation(); handleViewProfile(item); }}>
                  <img
                    className="reel-avatar"
                    src={`https://i.pravatar.cc/60?u=${item.foodPartnerId?._id}`}
                    alt="avatar"
                  />
                  <div>
                    <div className="reel-name">
                      {item.foodPartnerId?.name || 'Unknown'}
                    </div>
                  </div>

                  
                </div>

                <p className="reel-description">
                  {item.description || 'No description'}
                </p>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="reel-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile(item);
                  }}
                >
                  View profile
                </button>

                <button
                  className={`reel-btn follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleFollow(partnerId, e); }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                </div>
              </div>

              <div className="reel-actions">
                <div className="reel-action-group">
                  <button className={`reel-action ${item._liked ? 'liked' : ''}`} onClick={(e) => handleLike(item._id, idx, e)} aria-label="Like">
                    ❤️
                  </button>
                  <div className="reel-action__count">{item.likesCount ?? item.likes?.length ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button className="reel-action" onClick={(e) => handleComment(item._id, e)} aria-label="Comment">💬</button>
                  <div className="reel-action__count">{item.commentsCount ?? item.comments?.length ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button className="reel-action" onClick={(e) => handleShare(item, e)} aria-label="Share">🔗</button>
                  <div className="reel-action__count">{item.shares ?? 0}</div>
                </div>
              </div>

              {playIndicator[idx] && (
                <div className={`reel-play-indicator ${playIndicator[idx]}`}>
                  {playIndicator[idx] === 'play' ? '▶' : '⏸'}
                </div>
              )}
            </div>
          </article>
        )})}
      </section>
    </main>
  );
}
