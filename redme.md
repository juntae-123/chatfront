# Chat Application

## 프로젝트 개요
본 프로젝트는 **실시간 채팅 애플리케이션**입니다.  
Next.js + Tailwind CSS 기반 프론트엔드와 Spring Boot + Redis 기반 백엔드로 구현했으며, JWT 인증과 FCM 알림 기능까지 포함되어 있습니다.

### 주요 특징
- **실시간 채팅**
  - WebSocket 기반
  - 채팅방 생성, 삭제, 참여자 관리
- **사용자 인증**
  - JWT 기반 로그인/회원가입
  - 토큰 자동 갱신 지원
- **알림 기능**
  - FCM(푸시 알림) 연동
  - 브라우저 알림 지원
- **데이터 저장**
  - MySQL (채팅 메시지 및 방 정보)
  - Redis (실시간 메시지 전달, 멀티 서버 지원)

## 기술 스택
| 구분 | 기술 |
|------|------|
| Frontend | Next.js, TypeScript, Tailwind CSS, Zustand |
| Backend | Spring Boot, Spring Security, JWT, WebSocket, Redis, MySQL |
| DevOps / 기타 | Firebase Cloud Messaging, Docker(Optional) |

## 주요 기능 화면

- 채팅방 목록 페이지
- 실시간 채팅 화면
- 입장/퇴장 알림
- FCM 푸시 알림
- JWT 로그인/회원가입
- 멀티 서버 환경에서 Redis Pub/Sub 활용 가능

## 작성자
- 이름: 박준태
- GitHub: https://github.com/
- 이메일: qkrwnsxo9@naver.com

## 환경 변수 (.env)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key



채팅방 목록 페이지


실시간 채팅 화면


입장/퇴장 알림

FCM 푸시 알림

JWT 로그인/회원가입

멀티 서버 환경에서 Redis Pub/Sub 활용 가능

작성자

이름: 박 준태

GitHub: https://github.com/

이메일: qkrwnsxo9@naver.com