# 찍어봐요 동물의 숲

동물의 숲 주민과 함께 사진을 촬영하고, 스티커로 꾸민 뒤 이메일로 전송할 수 있는 웹 기반 사진 촬영 서비스입니다.

---

## 📅 개발 기간

* 2025.08 ~ 2025.11

## 👥 개발 인원

* 3명

## 🛠 기술 스택

* Frontend: React
* Backend: Node.js, Express
* Database: MySQL

---

## ✨ 주요 기능

* API를 통해 불러온 동물의 숲 주민과 함께 사진 촬영
* 다양한 스티커를 활용한 사진 꾸미기
* 이메일 입력을 통한 사진 전송
* 갤러리에서 촬영한 사진 확인

---

## 🙋‍♀️ 기여 내용

* Webcam을 이용한 사용자 사진 촬영 기능 구현
* Canvas를 활용한 사용자 사진과 주민 이미지 합성 기능 구현
* 스티커가 적용된 사진을 EmailJS를 통해 이메일로 전송하는 기능 구현

---

## 🚀 실행 매뉴얼

### 1. 패키지 설치

프로젝트 루트 폴더에서 아래 명령어 실행

```bash
npm install
```



### 2. 프론트엔드 실행 (개발 서버)

```bash
npm run dev
```

* 기본 실행 주소: [http://localhost:5173](http://localhost:5173)



### 3. 백엔드 실행 (API 서버)

```bash
cd src
npm run start:api
```

* Express 기반 서버 실행
* MySQL 데이터베이스와 연동

---

## 🗄 데이터베이스 설정 (MySQL)

MySQL 콘솔 또는 GUI 툴에서 아래 쿼리를 실행합니다.

```sql
CREATE DATABASE IF NOT EXISTS photos_db;
USE photos_db;

CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255),
    character_name VARCHAR(100),
    created_at DATETIME
);
```

---

## 🔐 환경 변수 설정 (.env)

프로젝트 루트 폴더에 `.env` 파일을 생성한 후 아래 값을 설정하세요.

### API

```env
NOOKIPEDIA_API_KEY=YOUR_NOOKIPEDIA_API_KEY
```

### Database

```env
DB_HOST=YOUR_DB_HOST
DB_USER=YOUR_DB_USER
DB_PASS=YOUR_DB_PASS
DB_NAME=photos_db
```

### Email

```env
VITE_EMAILJS_PUBLIC_KEY=YOUR_EMAILJS_PUBLIC_KEY
```

---

## 🌐 사용 API

* Nookipedia API : 동물의 숲 주민 데이터 조회
* EmailJS : 사진 이메일 전송
