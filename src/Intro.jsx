import "./intro.css";
import { useNavigate } from "react-router-dom";
import takePhotoImg from "./img/take_a_photo.png";
import galleryPhotoImg from "./img/gallery_photo.png";
import bgm from "./mp3/모여봐요 동물의 숲 메인 테마 - game theme.mp3";
import { useRef } from "react";

export default function Intro() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const playMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(bgm);
      audioRef.current.loop = true; // 무한 반복
      audioRef.current.volume = 0.5;
    }
    audioRef.current.play().catch((err) => {
      console.log("음악 재생 실패:", err);
    });
  };

  const handleNavigate = (path) => {
    playMusic();
    navigate(path);
  };

  return (
    <div className="intro-container">
      <div className="button-wrapper">
        <button className="photo-btn" onClick={() => handleNavigate("/choose-photo")}>
          <img src={takePhotoImg} alt="사진찍으러가기 버튼 사진" />
        </button>
        <button className="photo-btn" onClick={() => handleNavigate("/gallery")}>
          <img src={galleryPhotoImg} alt="갤러리 버튼 사진" />
        </button>
      </div>
    </div>
  );
}
