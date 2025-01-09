const axios = require('axios');
const Subscription = require('../models/subscription');
const { PAYPAL_API, PAYPAL_CLIENT_ID, PAYPAL_SECRET } = require('../config/paypal');

// PayPal 인증 토큰 요청
const getPayPalToken = async () => {
    const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
        auth: {
            username: PAYPAL_CLIENT_ID,
            password: PAYPAL_SECRET,
        },
    });
    return response.data.access_token;
};

// 결제 생성
exports.createPayment = async (req, res) => {
    const { total, currency } = req.body; // 금액 및 통화 값 동적 처리
    try {
        const token = await getPayPalToken();

        const { data } = await axios.post(`${PAYPAL_API}/v1/payments/payment`, {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            transactions: [
                {
                    amount: {
                        total: total || '90.00', // 기본값 설정
                        currency: currency || 'USD', // 기본값 설정
                    },
                    description: 'RavenMatching Subscription Plan - 1 Month',
                },
            ],
            redirect_urls: {
                return_url: `http://localhost:${PORT}/success`,
                cancel_url: `http://localhost:${PORT}/cancel`,
            },
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const approvalUrl = data.links.find((link) => link.rel === 'approval_url').href;
        res.json({ approvalUrl });
    } catch (error) {
        console.error('Payment creation error:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to create payment. Please try again later.');
    }
};
// 결제 승인 처리
exports.executePayment = async (req, res) => {
    const { paymentId, PayerID } = req.query;

    try {
        const token = await getPayPalToken();

        const { data } = await axios.post(`${PAYPAL_API}/v1/payments/payment/${paymentId}/execute`, {
            payer_id: PayerID,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // 결제 상태 확인
        if (data.state !== 'approved') {
            return res.status(400).send('Payment not approved. Please try again.');
        }

        // 구독 종료일 계산 (30일 후)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // 명확한 날짜 계산

        // 구독 정보 저장
        await Subscription.create({
            userId: req.user.id, // 사용자 ID가 제대로 설정되어 있는지 확인 필요
            plan: 'premium',
            status: 'active',
            startDate,
            endDate,
            paymentId: data.id,
            payerId: data.payer.payer_info.payer_id,
        });

        res.send('Payment successful and subscription activated.');
    } catch (error) {
        console.error('Payment execution error:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to execute payment. Please try again later.');
    }
};