import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import styles from "./photo.module.css";
import startbtn from "./img/start_button.png";

function Twophoto() {
  const [villager, setVillager] = useState(null);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path, { state: { villager, cuts: 2 } }); // 주민 정보와 컷 수 전달
  };

  const fetchVillager = async () => {
    try {
      const response = await axios.get("https://animalcrossing-photo.onrender.com/api/villagers", {
        headers: {
          "X-API-KEY": "e25f17a9-12b3-4033-8f59-da299adfe32a",
          "Accept-Version": "1.0.0",
        },
      });
      const data = response.data;
      const randomVillager = data[Math.floor(Math.random() * data.length)];
      setVillager(randomVillager);
    } catch (err) {
      console.error("주민 데이터를 불러오지 못했습니다:", err);
    }
  };

  useEffect(() => {
    fetchVillager();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.webcamArea}>
        <div className={styles.webcamWrapper}>
          {villager && <p className={styles.villagerName}>{villager.name}</p>}{" "}
          {/* 이름이 웹캠 바로 위 */}
          <Webcam
            className={styles.webcam}
            audio={false}
            videoConstraints={{ facingMode: "user" }}
          />
          {villager && (
            <div className={styles.villagerOverlay}>
              <img src={`https://animalcrossing-photo.onrender.com/image-proxy${new URL(villager.image_url).pathname}`}
                  alt={villager.name} />
            </div>
          )}
        </div>

        <button
          className={styles.button}
          onClick={() => handleNavigate("/take-photo")}>
          <img src={startbtn} alt="Start" />
        </button>
      </div>
    </div>
  );  
}

export default Twophoto;