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
