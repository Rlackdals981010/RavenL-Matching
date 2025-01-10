const axios = require('axios');
const Subscription = require('../models/subscription'); // 구독 관리
const Payment = require('../models/payment'); // 결제 세션
const { PAYPAL_API, PAYPAL_CLIENT_ID, PAYPAL_SECRET } = require('../config/paypal');

// PayPal 인증 토큰 요청
const getPayPalToken = async () => {
    try {
        const response = await axios.post(
            `${PAYPAL_API}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                auth: {
                    username: PAYPAL_CLIENT_ID,
                    password: PAYPAL_SECRET,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Failed to fetch PayPal token:', error.message);
        throw new Error('PayPal token retrieval failed.');
    }
};

// 제품 생성 (구독 상품을 등록하는 )
exports.createProduct = async (req, res) => {
    try {
        const role = req.user.role;

        // 관리자 권한 확인
        if (role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to create a product.' });
        }

        // 요청 본문에서 제품 정보 가져오기
        const { name, description, type = 'SERVICE', category = 'SOFTWARE' } = req.body;

        // 필수 필드 검증
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required.' });
        }

        // PayPal 인증 토큰 요청
        const token = await getPayPalToken();

        // PayPal Products API 호출
        const { data } = await axios.post(
            `${PAYPAL_API}/v1/catalogs/products`,
            {
                name,          // 제품 이름
                description,   // 제품 설명
                type,          // 제품 유형 (기본값: SERVICE)
                category,      // 제품 카테고리 (기본값: SOFTWARE)
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // 성공적으로 생성된 product_id 반환
        res.status(201).json({
            message: 'Product created successfully.',
            productId: data.id,
            productDetails: {
                name,
                description,
                type,
                category,
            },
        });
    } catch (error) {
        console.error('Product creation error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to create product.' });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to create a plan.' });
        }

        const {
            productId,
            name = 'Monthly Subscription Plan', // 기본값 설정
            description = 'Monthly subscription to RavenMatching', // 기본값 설정
            price = '90.00', // 기본값 설정
            currency = 'USD', // 기본값 설정
            interval_unit = 'MONTH',
            interval_count = 1,
            total_cycles = 0, // 무제한 반복
        } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        const token = await getPayPalToken();

        const { data } = await axios.post(
            `${PAYPAL_API}/v1/billing/plans`,
            {
                product_id: productId,
                name,
                description,
                billing_cycles: [
                    {
                        frequency: {
                            interval_unit,
                            interval_count,
                        },
                        tenure_type: 'REGULAR',
                        sequence: 1,
                        total_cycles,
                        pricing_scheme: {
                            fixed_price: {
                                value: price,
                                currency_code: currency,
                            },
                        },
                    },
                ],
                payment_preferences: {
                    auto_bill_outstanding: true,
                    setup_fee_failure_action: 'CONTINUE',
                    payment_failure_threshold: 3,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        res.json({
            message: 'Plan created successfully.',
            planId: data.id,
            planDetails: {
                name,
                description,
                price,
                currency,
                interval_unit,
                interval_count,
                total_cycles,
            },
        });
    } catch (error) {
        console.error('Plan creation error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to create plan.' });
    }
};

// 구독 생성
exports.createSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const { planId } = req.body; // 요청에서 플랜 ID 받음
        const token = await getPayPalToken();

        const { data } = await axios.post(
            `${PAYPAL_API}/v1/billing/subscriptions`,
            {
                plan_id: planId,
                application_context: {
                    brand_name: 'RavenMatching',
                    user_action: 'SUBSCRIBE_NOW',
                    return_url: `http://localhost:${process.env.PORT || 5000}/payment/subscription/success`,
                    cancel_url: `http://localhost:${process.env.PORT || 5000}/payment/subscription/cancel`,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const approvalUrl = data.links.find((link) => link.rel === 'approve').href;

        // 구독 ID와 사용자 ID를 DB에 저장
        await Payment.create({
            userId,
            paymentId: data.id,
            status: 'pending',
        });

        res.json({ approvalUrl });
    } catch (error) {
        console.error('Subscription creation error:', error.response.data);
        res.status(500).json({ message: 'Failed to create subscription.' });
    }
};

// 구독 성공 처리
exports.executeSubscription = async (req, res) => {
    const { subscription_id } = req.query;

    try {
        // 결제 정보 확인 (Payment 테이블에서 조회)
        const payment = await Payment.findOne({ where: { paymentId: subscription_id } });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // PayPal 토큰 요청
        const token = await getPayPalToken();

        // PayPal 구독 상태 확인
        const { data } = await axios.get(
            `${PAYPAL_API}/v1/billing/subscriptions/${subscription_id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (data.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Subscription is not active.' });
        }

        // Payment 상태를 승인으로 업데이트
        payment.status = 'approved';
        await payment.save();

        // Subscription 테이블에 구독 정보 추가
        const startDate = new Date(data.billing_info.last_payment.time);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);

        await Subscription.create({
            userId: payment.userId,
            plan: 'premium', // 플랜 이름 또는 ID
            status: 'active',
            startDate,
            endDate,
            paymentId: subscription_id,
            payerId: data.subscriber.payer_id,
        });

        res.json({ message: 'Subscription activated successfully.' });
    } catch (error) {
        console.error('Subscription execution error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to execute subscription.' });
    }
};

// 구독 취소 처리
exports.cancelSubscription = async (req, res) => {
    const { subscription_id } = req.query;

    try {
        // 결제 정보 확인 (Payment 테이블에서 조회)
        const payment = await Payment.findOne({ where: { paymentId: subscription_id } });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // PayPal 토큰 요청
        const token = await getPayPalToken();

        // PayPal 구독 취소 요청
        await axios.post(
            `${PAYPAL_API}/v1/billing/subscriptions/${subscription_id}/cancel`,
            { reason: 'User requested to cancel the subscription.' },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Payment 상태를 취소로 업데이트
        payment.status = 'canceled';
        await payment.save();

        // Subscription 상태를 취소로 업데이트
        await Subscription.update(
            { status: 'canceled' },
            { where: { paymentId: subscription_id } }
        );

        res.json({ message: 'Subscription canceled successfully.' });
    } catch (error) {
        console.error('Subscription cancellation error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to cancel subscription.' });
    }
};

// 구독 갱신 중단
exports.pauseSubscription = async (req, res) => {
    try {
        const userId = req.user.id; // 로그인한 사용자 ID 가져오기

        // Subscription 테이블에서 해당 사용자의 활성 구독 조회
        const subscription = await Subscription.findOne({
            where: {
                userId,
                status: 'ACTIVE', // 활성 상태의 구독만 조회
            },
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Active subscription not found for this user.' });
        }

        const subscription_id = subscription.paymentId; // Subscription ID 추출

        const token = await getPayPalToken();

        // PayPal 구독 갱신 중단 요청
        await axios.post(
            `${PAYPAL_API}/v1/billing/subscriptions/${subscription_id}/suspend`,
            { reason: 'User requested to pause subscription.' },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Subscription 상태를 'canceled'로 업데이트
        await Subscription.update(
            { status: 'CANCELED' },
            { where: { paymentId: subscription_id } }
        );

        res.json({ message: 'Subscription renewal paused successfully.' });
    } catch (error) {
        console.error('Pause subscription error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to pause subscription.' });
    }
};

// 구독 재활성화
exports.resumeSubscription = async (req, res) => {
    try {
        const userId = req.user.id; // 로그인한 사용자 ID 가져오기

        // Subscription 테이블에서 해당 사용자의 중단된 구독 조회
        const subscription = await Subscription.findOne({
            where: {
                userId,
                status: 'CANCELED', // 중단된 상태의 구독만 조회
            },
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Paused subscription not found for this user.' });
        }

        const subscription_id = subscription.paymentId; // Subscription ID 추출
        const token = await getPayPalToken();

        // PayPal 구독 재활성화 요청
        await axios.post(
            `${PAYPAL_API}/v1/billing/subscriptions/${subscription_id}/activate`,
            { reason: 'User requested to resume subscription.' },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Subscription 상태를 'active'로 업데이트
        await Subscription.update(
            { status: 'ACTIVE' },
            { where: { paymentId: subscription_id } }
        );

        res.json({ message: 'Subscription resumed successfully.' });
    } catch (error) {
        console.error('Resume subscription error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to resume subscription.' });
    }
};

// 구독 상태 조회
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user.id; // 로그인한 사용자 ID 가져오기

        // Subscription 테이블에서 해당 사용자의 구독 조회
        const subscription = await Subscription.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']], // 가장 최근 구독을 가져옴
        });

        if (!subscription) {
            return res.status(404).json({ message: 'No subscription found for this user.' });
        }

        const subscription_id = subscription.paymentId; // PayPal 구독 ID 추출
        const token = await getPayPalToken();

        // PayPal에서 구독 상태 조회
        const { data } = await axios.get(
            `${PAYPAL_API}/v1/billing/subscriptions/${subscription_id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // 응답 반환
        res.json({
            plan: subscription.plan,
            localStatus: subscription.status, // 로컬 DB 상태
            paypalStatus: data.status, // PayPal 상태
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            subscriptionId: subscription_id,
        });
    } catch (error) {
        console.error('Get subscription status error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to get subscription status.' });
    }
};