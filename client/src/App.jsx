import React, { useEffect, useState } from "react";
import "./App.css";

const tg = window.Telegram?.WebApp;

export default function App() {
  const telegramUser = tg?.initDataUnsafe?.user;

  const [userCoins, setUserCoins] = useState(0);
  const [listeningTime, setListeningTime] = useState(0);
  const [showCoinAnim, setShowCoinAnim] = useState(false);

  const [leaderboard, setLeaderboard] = useState([
    { id: "1", name: "Alex", coins: 12 },
    { id: "2", name: "Maria", coins: 9 },
    { id: "3", name: "John", coins: 7 }
  ]);

  /* ================= TELEGRAM INIT ================= */

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    if (telegramUser) {
      setLeaderboard(prev => {
        const exists = prev.find(u => u.id === telegramUser.id.toString());
        if (exists) return prev;

        return [
          ...prev,
          {
            id: telegramUser.id.toString(),
            name: telegramUser.first_name,
            coins: 0
          }
        ];
      });
    }
  }, []);

  /* ================= LISTENING TIMER ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setListeningTime(prev => {
        const newTime = prev + 1;

        // earn 1 coin every 120 seconds
        if (newTime > 0 && newTime % 120 === 0) {
          earnCoin();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const earnCoin = () => {
    setUserCoins(prev => prev + 1);
    setShowCoinAnim(true);

    setLeaderboard(prev =>
      prev.map(u =>
        u.id === telegramUser?.id.toString()
          ? { ...u, coins: u.coins + 1 }
          : u
      )
    );

    setTimeout(() => setShowCoinAnim(false), 1200);
  };

  /* ================= SORT LEADERBOARD ================= */

  const sortedLeaderboard = [...leaderboard].sort(
    (a, b) => b.coins - a.coins
  );

  /* ================= UI ================= */

  return (
    <div className="app-container">
      {/* ================= PROFILE ================= */}
      <div className="profile-header">
        <div className="profile-avatar-container">
          {telegramUser?.photo_url ? (
            <img
              src={telegramUser.photo_url}
              alt="avatar"
              className="profile-avatar-img"
            />
          ) : (
            <div className="profile-avatar-placeholder">👤</div>
          )}

          <div className="profile-camera-btn">📷</div>
        </div>

        <div className="profile-name-center">
          {telegramUser?.first_name || "Guest"}
        </div>
        <div className="profile-username-center">
          @{telegramUser?.username || "telegram_user"}
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="profile-stats-3col">
        <div className="stat-card">
          <div className="stat-number">{userCoins}</div>
          <div className="stat-label">Coins</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Math.floor(listeningTime / 60)}
          </div>
          <div className="stat-label">Minutes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{sortedLeaderboard.length}</div>
          <div className="stat-label">Users</div>
        </div>
      </div>

      {/* ================= LEADERBOARD ================= */}
      <div className="leaderboard">
        {sortedLeaderboard.map((user, index) => {
          const isMe =
            telegramUser &&
            user.id === telegramUser.id.toString();

          return (
            <div
              key={user.id}
              className={`leaderboard-item ${isMe ? "me" : ""}`}
            >
              <div className="leaderboard-left">
                <div className="leaderboard-rank">
                  #{index + 1}
                </div>
                <div className="leaderboard-name">
                  {user.name}
                  {isMe && (
                    <span className="me-badge">YOU</span>
                  )}
                </div>
              </div>

              <div className="leaderboard-coins">
                {user.coins} 🪙
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MINI PLAYER ================= */}
      <div className="mini-player">
        <button className="mini-player-btn">▶</button>
        <div style={{ marginLeft: 12 }}>
          Listening… earn coins every 2 min
        </div>
      </div>

      {/* ================= COIN ANIMATION ================= */}
      {showCoinAnim && (
        <div className="coin-float">🪙 +1</div>
      )}

      {/* ================= BOTTOM NAV ================= */}
      <div className="bottom-nav">
        <div>🏠</div>
        <div>🎧</div>
        <div>🏆</div>
        <div>👤</div>
      </div>
    </div>
  );
}
