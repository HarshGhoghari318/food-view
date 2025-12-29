import React, { useEffect, useRef, useState } from "react";
import "../../style/reels.css";
import "../../style/reelsNav.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReelsBottomNav from "./BottomNav";

export default function Reels() {
  const feedRef = useRef(null);
  const videoRefs = useRef(new Map());
  const currentPlaying = useRef(null);

  const [videos, setVideos] = useState([]);

  const [playIndicator, setPlayIndicator] = useState({});

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  // Comment modal state
  const [commentFoodId, setCommentFoodId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const GetData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/food/getfoods",
        { withCredentials: true }
      );
      const foods = response.data.foods || [];
      setVideos(
        foods.map((f) => ({
          ...f,
          _liked: Boolean(
            currentUser && currentUser._id && f.likes?.some
              ? f.likes.some(
                  (l) => String(l._id || l) === String(currentUser._id)
                )
              : false
          ),
          likesCount: f.likes?.length || 0,
          commentsCount: f.comments?.length || 0,
          shares: f.shares || 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/auth/user/me", {
        withCredentials: true,
      });
      setCurrentUser(res.data.user);
      // mark liked & saved flags on currently loaded videos
      setVideos((prev) =>
        prev.map((v) => ({
          ...v,
          _liked: Boolean(
            v.likes?.some
              ? v.likes.some(
                  (l) => String(l._id || l) === String(res.data.user._id)
                )
              : false
          ),
          _saved: Boolean(
            (v.savedBy && v.savedBy.some)
              ? v.savedBy.some((s) => String(s) === String(res.data.user._id))
              : (res.data.user && res.data.user.savedReels)
              ? res.data.user.savedReels.some((id) => String(id) === String(v._id))
              : false
          ),
        }))
      );
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
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const toPlay =
          visible.length && visible[0].intersectionRatio >= 0.6
            ? visible[0].target
            : null;

        videoRefs.current.forEach((video) => {
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

    const vids = feedRef.current?.querySelectorAll(".reel-video") || [];
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

    if (typeof partnerIdOrItem === "object") {
      const item = partnerIdOrItem;
      id = item.foodPartnerId?._id || item.foodPartnerId;
      partner = item.foodPartnerId || null;
    } else {
      id = partnerIdOrItem;
      const first = videos.find(
        (v) => String(v.foodPartnerId?._id || v.foodPartnerId) === String(id)
      );
      partner = first?.foodPartnerId || null;
    }

    const partnerVideos = videos.filter(
      (v) => String(v.foodPartnerId?._id || v.foodPartnerId) === String(id)
    );

    if (!id) {
      if (partnerIdOrItem && typeof partnerIdOrItem === "object") {
        const synthetic = {
          name:
            partnerIdOrItem.foodPartnerName ||
            partnerIdOrItem.name ||
            "Partner",
        };
        navigate(`/profile/unknown`, {
          state: { partner: synthetic, partnerVideos: [partnerIdOrItem] },
        });
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
      setPlayIndicator((prev) => ({ ...prev, [idx]: "play" }));
    } else {
      video.pause();
      setPlayIndicator((prev) => ({ ...prev, [idx]: "pause" }));
    }

    setTimeout(() => {
      setPlayIndicator((prev) => ({ ...prev, [idx]: null }));
    }, 600);
  };

  const toggleFollow = async (partnerId, e) => {
    if (e) e.stopPropagation();
    if (!partnerId) return;
    try {
      const res = await axios.post(
        `http://localhost:3000/api/auth/user/follow/${partnerId}`,
        {},
        { withCredentials: true }
      );
      setCurrentUser((prev) => ({ ...prev, Following: res.data.following }));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/user/login");
      } else {
        console.error("Follow error", err);
      }
    }
  };

  const handleLike = async (foodId, idx, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await axios.post(
        `http://localhost:3000/api/food/like/${foodId}`,
        {},
        { withCredentials: true }
      );
      const liked = res.data.liked;
      const likesCount = res.data.likesCount;
      setVideos((prev) =>
        prev.map((v) =>
          String(v._id) === String(foodId)
            ? { ...v, likesCount, _liked: liked }
            : v
        )
      );
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/user/login");
      } else {
        console.error("Like error", err);
      }
    }
  };

  const fetchComments = async (foodId) => {
    setCommentLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/food/comments/${foodId}`, {
        withCredentials: true,
      });
      // show newest comments first (reverse server order)
      const list = res.data.comments || [];
      const reversed = list.slice().reverse();
      setComments(reversed);
      return reversed;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/user/login');
      } else {
        console.error('Fetch comments error', err);
      }
      return [];
    } finally {
      setCommentLoading(false);
    }
  };

  const openComment = async (foodId, e) => {
    if (e) e.stopPropagation();
    setCommentFoodId(foodId);
    setIsCommentOpen(true);
    await fetchComments(foodId);
    // focus input once comments are loaded
    setTimeout(() => commentInputRef.current?.focus(), 80);
  };

  const submitComment = async (e) => {
    e?.stopPropagation();
    if (!commentText || !commentText.trim()) return;
    try {
      setCommentSubmitting(true);
      const res = await axios.post(
        `http://localhost:3000/api/food/comment/${commentFoodId}`,
        { text: commentText.trim() },
        { withCredentials: true }
      );

      // re-fetch comments and update UI/count
      const refreshed = await fetchComments(commentFoodId);
      const newCount = res.data.commentsCount ?? refreshed.length;

      setVideos((prev) =>
        prev.map((v) =>
          String(v._id) === String(commentFoodId) ? { ...v, commentsCount: newCount } : v
        )
      );

      setCommentText("");
      // focus to input again
      setTimeout(() => commentInputRef.current?.focus(), 60);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/user/login');
      } else {
        console.error('Submit comment error', err);
        alert(err.response?.data?.message || 'Failed to submit comment');
      }
    } finally {
      setCommentSubmitting(false);
    }
  };

  const closeComments = () => {
    setIsCommentOpen(false);
    setCommentFoodId(null);
    setComments([]);
    setCommentText("");
  };

  const handleShare = async (food, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await axios.post(
        `http://localhost:3000/api/food/share/${food._id}`,
        {},
        { withCredentials: true }
      );
      const shares = res.data.shares;
      setVideos((prev) =>
        prev.map((v) =>
          String(v._id) === String(food._id) ? { ...v, shares } : v
        )
      );

      const shareUrl = `${window.location.origin}/share/food/${food._id}`;
      const shareData = {
        title: food.name || "Food",
        text: food.description || "",
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert("Share link copied to clipboard");
      } else {
        prompt("Copy this link to share:", shareUrl);
      }
    } catch (err) {
      console.error("Share error", err);
    }
  };

 

  const openReelAt = (idx) => {
    const reels = feedRef.current?.querySelectorAll(".reel") || [];
    if (!reels[idx]) return;
    reels[idx].scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const v = videoRefs.current.get(idx);
      if (v) {
        v.play().catch(() => {});
        currentPlaying.current = v;
      }
    }, 450);
  };

  return (
    <>
      <main className="reels-page">
      
        <section className="reels-feed" ref={feedRef}>
          {videos.map((item, idx) => {
            const partnerId = item.foodPartnerId?._id || item.foodPartnerId;
            const isFollowing = currentUser?.Following?.some(
              (f) => String(f) === String(partnerId)
            );
            return (
              <article
                key={item._id}
                className="reel"
                onClick={() => {}}
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
                    <div
                      className="reel-profile"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(item);
                      }}
                    >
                      <img
                        className="reel-avatar"
                        src={
                          "data:image/jpeg;base64,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"
                        }
                        alt="avatar"
                      />
                      <div>
                        <div className="reel-name">
                          {item.foodPartnerId?.name || "Unknown"}
                        </div>
                      </div>
                    </div>

                    <p className="reel-description">
                      {item.description || "No description"}
                    </p>

                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
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
                        className={`reel-btn follow-btn ${
                          isFollowing ? "following" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollow(partnerId, e);
                        }}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>

                  <div className="reel-actions">
                    <div className="reel-action-group">
                      <button
                        className={`reel-action ${item._liked ? "liked" : ""}`}
                        onClick={(e) => handleLike(item._id, idx, e)}
                        aria-label="Like"
                      >
                        ❤️
                      </button>
                      <div className="reel-action__count">
                        {item.likesCount ?? item.likes?.length ?? 0}
                      </div>
                    </div>

                    <div className="reel-action-group">
                      <button
                        className="reel-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openComment(item._id, e);
                        }}
                      >
                        💬
                      </button>

                      <div className="reel-action__count">
                        {item.commentsCount ?? item.comments?.length ?? 0}
                      </div>
                    </div>

                    <div className="reel-action-group">
                      <button
                        className="reel-action"
                        onClick={(e) => handleShare(item, e)}
                        aria-label="Share"
                      >
                        🔗
                      </button>
                      <div className="reel-action__count">
                        {item.shares ?? 0}
                      </div>
                    </div>
                    
                  </div>

                  {playIndicator[idx] && (
                    <div
                      className={`reel-play-indicator ${playIndicator[idx]}`}
                    >
                      {playIndicator[idx] === "play" ? "▶" : "⏸"}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>
{isCommentOpen && (
  <div className="comment-overlay" onClick={closeComments}>
    <div className="comment-panel" onClick={(e) => e.stopPropagation()}>
      
      {/* Header */}
      <div className="comment-header">
        <h3>Comments</h3>
        <button className="comment-close-btn" onClick={closeComments}>✕</button>
      </div>

      {/* Body */}
      <div className="comment-body">
        {commentLoading ? (
          <div className="comments-placeholder">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="comments-placeholder">No comments yet</div>
        ) : (
          comments.map((c) => (
            <div className="comment-item" key={c._id}>
              <div className="comment-username">
                {c.user?.fullName || c.user?.email || "User"}
              </div>
              <div className="comment-text">{c.text}</div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="comment-input-bar">
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitComment(e)}
        />
        <button onClick={submitComment}>Send</button>
      </div>
    </div>
  </div>
)}



      <ReelsBottomNav />
    </>
  );
}
