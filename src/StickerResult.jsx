import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./sticker.css";
import { toPng } from 'html-to-image';

// 분리된 파일 import
import { stickerSources } from "./stickerData.js";
import Sticker from "./sticker.jsx";
import { useStickerInteraction } from "./useSticker.js"; 

// 메인 컴포넌트가 사용하는 이미지
import bgImg from "./img/background_sticker.png";
import finishBtn from "./img/finish_button.png";

// 원본 스티커 데이터에 isSource: true 속성을 추가하여 복사본과 구분
const initialStickersWithSource = stickerSources.map(s => ({
    ...s,
    isSource: true, // 오른쪽 패널에 고정된 스티커임을 표시
}));

export default function StickerResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const images = state?.images || [];
  const cuts = state?.cuts || images.length || 4; 

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  
  const villagerName = state?.villager?.name || "주민 없음";

  const stickerFrameRef = useRef(null); 
  
  
  const { 
    stickers, 
    activeStickerId, 
    setActiveStickerId,
    handleStickerClickAndDrag, // 이름 변경 반영
    handleStickerDoubleClick,  // 더블 클릭 핸들러 추가
    handleResizeMouseDown, 
    handleRotateMouseDown 
  } = useStickerInteraction(initialStickersWithSource, stickerFrameRef); // isSource가 포함된 데이터 전달
  
  
  const uploadImageToServer = async (imageDataUrl, characterName) => {
  console.log(`서버(${BASE_URL}/upload)에 [${characterName}] 이미지 업로드 시도...`);
      
  const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageDataUrl,      // Base64 이미지 데이터
        character: characterName  // 캐릭터 이름
      })
    });
      
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
      
    return response.json();
  };

  const handleFinish = async () => {
    setActiveStickerId(null);
    if (!stickerFrameRef.current) return;
    
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      // 첫 번째 캡처 — 원본 크기로 DB 업로드
      const originalImage = await toPng(stickerFrameRef.current, {
        quality: 0.95,
        backgroundColor: null,
        skipFonts: true,
      });

      await uploadImageToServer(originalImage, villagerName);

      // 두 번째 캡처 — 리사이즈/자른 버전
      const resizedImage = await toPng(stickerFrameRef.current, {
        quality: 0.95,
        width: 420,   // 가로 크기
        height: 650,  // 세로 크기
        backgroundColor: null,
        skipFonts: true,
      });

      // Send 페이지로 이동 (리사이즈 버전 전달)
      navigate("/send", { state: { image: resizedImage } });

    } catch (error) {
      console.error("이미지 캡처/업로드 실패:", error);
    }
  };


  const containerStyle = {
    backgroundImage: `url(${bgImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="sticker-container" style={containerStyle}>
      <div className="sticker-frame" ref={stickerFrameRef}>
        <div className="photo-slot photo-slot-left">
          <div className={`photo-grid grid-${cuts}`}>
            {images.map((src, idx) => (<img key={idx} src={src} alt={`cut-${idx}`} className="user-photo" />))}
          </div>
        </div>
          <div className="right-panel"></div>
        
        {stickers.map(sticker => (
          <Sticker
            key={sticker.id}
            sticker={sticker}
            isActive={activeStickerId === sticker.id}
            onInteractionStart={handleStickerClickAndDrag} // props 이름 변경
            onDoubleClick={handleStickerDoubleClick}        // 더블 클릭 이벤트 연결
            onResizeStart={handleResizeMouseDown}
            onRotateStart={handleRotateMouseDown}
          />
        ))}
        
        <button className="finish-btn finish-right-bottom-sand" onClick={handleFinish}>
          <img src={finishBtn} alt="finish" />
        </button>
      </div>
    </div>
  );
}