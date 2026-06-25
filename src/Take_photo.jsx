import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import styles from "./Take_photo.module.css";

export default function Take_photo(){
	const location = useLocation();
	const navigate = useNavigate();
	const webcamRef = useRef(null);
	const captureAreaRef = useRef(null);
	
	// props로 받은 주민 정보
	const villager = location.state?.villager;
	const cuts = location.state?.cuts;
	
	const [capturedImages, setCapturedImages] = useState([]);
	const [countdown, setCountdown] = useState(7); // 7초 카운트다운
	const [currentCut, setCurrentCut] = useState(0);
	const [isComplete, setIsComplete] = useState(false);

	// 사진 캡처(주민 + 웹캠) 함수
	const capturePhoto = useCallback(async () => {
		try {
			if (!webcamRef.current) {
				console.error("웹캠이 아직 준비되지 않았습니다.");
				return;
			}

			const webcamImage = webcamRef.current.getScreenshot();
			if (!webcamImage) return console.error("웹캠 이미지 캡처 실패");

			const villagerImg = new Image();
			villagerImg.crossOrigin = "anonymous";
			villagerImg.src = `https://animalcrossing-photo.onrender.com/image-proxy${new URL(villager.image_url).pathname}`;
			await new Promise((res) => (villagerImg.onload = res));

			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			canvas.width = 640;
			canvas.height = 480;

			// 웹캠 이미지 좌우 반전
			const webcamFrame = new Image();
			webcamFrame.src = webcamImage;
			await new Promise((res) => (webcamFrame.onload = res));

			ctx.save();
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(webcamFrame, 0, 0, canvas.width, canvas.height);
			ctx.restore(); // 원래 좌표계 복원

			// 주민 이미지 영역(화면 오른쪽 절반) 
			const overlayWidth = canvas.width / 2;
			const overlayHeight = canvas.height;

			// CSS 기준 비율 적용
			const villagerWidth = overlayWidth * 0.9;  // max-width: 90%
			const villagerHeight = overlayHeight * 0.8; // max-height: 80%

			// 중앙 정렬
			const villagerX = canvas.width / 2 + (overlayWidth - villagerWidth) / 2;
			const villagerY = (overlayHeight - villagerHeight) / 2;

			ctx.drawImage(villagerImg, villagerX, villagerY, villagerWidth, villagerHeight);

			const finalImage = canvas.toDataURL("image/jpeg", 0.9);

			setCapturedImages((prev) => {
			const newImages = [...prev, finalImage];
			if (newImages.length >= cuts) {
				setIsComplete(true);
				setTimeout(() => {
				navigate("/sticker", { state: { villager, images: newImages, cuts } });
				}, 1000);
			} else {
				setCountdown(7);
				setCurrentCut(newImages.length);
			}
			return newImages;
			});
		} catch (error) {
			console.error("캡처 실패:", error);
		}
	}, [villager, cuts, navigate]);


	// 7초 카운트다운 및 자동 촬영
	useEffect(() => {
		if (!isComplete && countdown > 0) {
			const timer = setTimeout(() => {
				setCountdown((prev) => prev - 1);
			}, 1000);
			return () => clearTimeout(timer);
		} else if (!isComplete && countdown === 0) {
			capturePhoto();
		}
	}, [countdown, isComplete, capturePhoto]);

	if (!villager || !cuts) {
		return (
		<div className={styles.container}>
			<p>주민 정보 또는 컷 정보를 찾을 수 없습니다.</p>
			<button onClick={() => navigate(-1)} className={styles.backButton}>
			돌아가기
			</button>
		</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.webcamWrapper} ref={captureAreaRef}>
				<p className={styles.villagerName}>{villager.name}</p>
				<Webcam
					ref={webcamRef}
					className={styles.webcam}
					audio={false}
					onUserMedia={() => setCountdown(7)}
					screenshotFormat="image/jpeg"
					videoConstraints={{ facingMode: "user" }}
				/>

				<div className={styles.villagerOverlay}>
					<img src={`/image-proxy${new URL(villager.image_url).pathname}`}
						alt={villager.name}
						crossOrigin="anonymous" />
				</div>

				{!isComplete && countdown > 0 && (<div className={styles.countdown}>{countdown}</div>)}

				{isComplete && <div className={styles.complete}>촬영 완료!</div>}
				
				<div className={styles.captureInfo}> {/* 남은 컷 수 */}
					{currentCut} / {cuts}
				</div>
			</div>
		</div>
	)
}