import React, { useState, useEffect } from 'react';
import './Gallery.css';
import HomeImg from "./img/home_button.png";
import { useNavigate } from 'react-router-dom';

export default function Gallery() {
  const [stickers, setStickers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleDelete = async (id) => {
    if (!confirm('정말 이 사진을 삭제하시겠어요?')) return;

    const prevStickers = stickers;
    setStickers(prev => prev.filter(p => Number(p.id) !== Number(id)));

    try {
      const res = await fetch(`${BASE_URL}/photos/${id}`, { method: 'DELETE' });

      if (res.ok) {
        return;
      }

      if (res.status === 404) {
        console.warn(`삭제 대상 없음 (id: ${id}) — 서버가 404를 반환했습니다.`);
        alert('이미 삭제되었거나 존재하지 않는 사진입니다.');
        return;
      }

      const txt = await res.text();
      throw new Error(`삭제 실패: ${res.status} ${txt}`);
    } catch (err) {
      console.error('사진 삭제 중 오류:', err);
      // rollback UI
      setStickers(prev => {
        // if item is already back in prev (unlikely), avoid duplicates
        const exists = prev.some(p => Number(p.id) === Number(id));
        if (exists) return prev;
        const restored = prevStickers.find(p => Number(p.id) === Number(id));
        return restored ? [restored, ...prev] : prev;
      });
      alert('사진 삭제 실패');
    }
  };

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        // 데이터 요청
        const response = await fetch(`${BASE_URL}/photos`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 변수 저장
        const data = await response.json();
        
        // 실제 저장
        setStickers(data); 
        
      } catch (error) {
        console.error("갤러리 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

    fetchGalleryData();
  }, []); 

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    // ...
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // 로딩 중일 때
  if (isLoading) {
    return <div className="gallery-container"><h2>갤러리 로딩 중...</h2></div>;
  }

  // 로딩 완료 후
  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <button className="home-btn" onClick={() => handleNavigate("/")}>
          <img src={HomeImg} alt="홈(인트로) 버튼 사진" />
        </button>
      </div>

      <div className="gallery-grid">
        {stickers.map((item) => (
          <div key={item.id} className="gallery-item"> 
            
            {/* DB 링크로 사진 표시 - 가운데에 스티커 사진이 보이도록 래퍼로 감쌈 */}
            <div className="image-wrapper">
              <img src={item.imageUrl} alt={`${item.characterName || item.character} 스티커`} className="gallery-image" />
            </div>
            
            <div className="gallery-info">
              {/* DB의 캐릭터 이름 */}
              <h3 className="character-name">{item.characterName || item.character}</h3>
              {/* DB의 날짜 */}
              <p className="created-date">{formatDate(item.createdAt)}</p>
              <button className="delete-photo-btn" onClick={() => handleDelete(item.id)} style={{marginTop:8, background:'#e74c3c', color:'#fff', border:'none', padding:'6px 10px', borderRadius:6, cursor:'pointer'}}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}