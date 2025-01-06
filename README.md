1. controllers/
    HTTP 요청을 처리하는 함수들을 포함합니다.
    각 컨트롤러는 비즈니스 로직(service)과 데이터 모델(model)을 호출합니다.
    예: authController.js에서 로그인/회원가입 처리.
2. models/
    데이터베이스 테이블과 매핑되는 ORM 모델을 정의합니다.
    Sequelize를 사용하는 경우 각 모델은 스키마와 관계를 포함합니다.
    예: user.js에서 사용자 테이블 정의.
3. routes/
    API 엔드포인트를 정의합니다.
    컨트롤러 함수를 호출하는 역할을 합니다.
    예: authRoutes.js에서 /auth/signup과 같은 라우트 정의.
4. services/
    비즈니스 로직을 처리하는 파일들입니다.
    컨트롤러와 모델 간의 중간 레이어 역할을 합니다.
    예: paymentService.js에서 결제 검증 로직.
5. middlewares/
    요청과 응답을 처리하는 공통 미들웨어를 작성합니다.
    authMiddleware.js: 인증 처리(JWT 검증).
    errorHandler.js: 공통 에러 처리.
6. config/
    프로젝트 설정과 환경 변수 관리.
    database.js: Sequelize DB 설정.
    env.js: .env 파일에서 환경 변수를 로드.
7. utils/
    공통적으로 사용되는 유틸리티 함수들을 저장.
    예: 날짜 변환, 데이터 검증 등.
8. public/
    정적 파일을 저장하는 디렉토리입니다.
    이미지, CSS, JS 파일 등을 포함.
9. app.js
    Express 애플리케이션의 진입점.
    미들웨어 설정, 라우트 연결, 서버 실행.


### Auth

- 회원가입
    - RavenMatching (가명) 서비스에 직접 가입
        - **Nodemailer 사용 + redis로 인증번호 관리**
            - signin:이메일 : 인증번호  ~
            - TTL 30분
    - GCP를 통한 구글 로그인
- 로그인
    - RavenMatching (가명) 서비스에 직접 로그인
    - Oauth2 로 간접 로그인
- 비밀번호 까먹음
    - 이메일로 토큰 보내고 해당 토큰 입력시 비밀번호 재 등록
        - **Nodemailer**
        - signin:이메일 : 인증번호  ~
        - TTL 30분

### 메인 페이지

- 뭐 딱히 기능은 없음

### 마이 페이지

- 내 정보
    - 내 정보 조회
    - 내 정보 수정
    - 비밀번호 변경
    - 회원 탈퇴
- 결제
    - 플랜 관리
        - 플랜 구독중이면 해당 정보
        - 아니면 없다고
    - 플랜 결제
        - PayPal API 호출
    - 결제 중단
        - 중단

### 메칭

- 메칭
    - 등록
        - Buyer : 로그인한 유저 정보 + 취급 품목 + 추가 요구사항 작성
        - Seller : 로그인한 유저 정보 + 취급 품목 + 추가 요구사항 작성
- 검색
    - 메칭 등록한 사람들 정보 출력
    - 어필
        - 사람들중 거래하고싶은 사람에게 ~~하는거
- 쪽지
    - 1:1
        - 그냥 쪽지임
- 신고
    - 등록
        - user, admin
    - 조회
        - user는 본인이 등록한 신고 목록만
        - admin은 전체 다
    - 수락/거절
        - admin
    - 신고 처리
        - 3회 피 신고시 : 쪽지로 경고 발송
        - 5회 피 신고시 : 플랜 환불 없이 정지 3일
        - 10회 피 신고시 : 플랜 환불 없이 영구정지
    - 정지
        - 신고와 별개로 admin의 정지 권한
        - 피 정지 id, 기간 입력시 해당 기간동안 로그인 불가

### 문의

- 등록
    - user만 가능
- 조회
    - user는 내가 등록한 문의만 가능
    - admin은 다 조회
- 수정
    - user는 내가 등록한 문의만 가능
- 삭제
    - user는 내가 등록한 문의만 가능
- 답변
    - admin만 가능

### 공지

- 등록
    - admin만 가능
- 조회
    - 전체 가능
- 수정
    - admin중 등록자만 가능
- 삭제
    - admin중 등록자만 가능
