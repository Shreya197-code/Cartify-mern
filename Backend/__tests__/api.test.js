const request = require('supertest');
const app = require('../index');
const { embedText, cosineSimilarity, chatComplete } = require('../services/ai/aiService');

describe('Cartify Production Hardening & Core API Tests', () => {
    describe('GET /health & /api/v1/health', () => {
        it('should return 200 OK with service status and uptime', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.service).toBe('Cartify API');
            expect(res.body.uptime).toBeDefined();
        });

        it('should return 200 on /api/v1/health', async () => {
            const res = await request(app).get('/api/v1/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
        });
    });

    describe('Security Headers', () => {
        it('should include Helmet security headers', async () => {
            const res = await request(app).get('/health');
            expect(res.headers['x-dns-prefetch-control']).toBeDefined();
            expect(res.headers['x-frame-options']).toBeDefined();
        });
    });

    describe('Request Validation on Auth Routes', () => {
        it('should return 400 with validation errors when registering with empty body', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({});
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Validation failed');
            expect(res.body.errors).toBeDefined();
        });

        it('should return 400 with invalid email on login', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'not-an-email', password: '123' });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('AI Service Layer', () => {
        it('should generate fallback normalized vector embedding', async () => {
            const vec = await embedText('wireless bluetooth headphones');
            expect(Array.isArray(vec)).toBe(true);
            expect(vec.length).toBeGreaterThan(0);
        });

        it('should calculate cosine similarity correctly', () => {
            const vecA = [1, 0, 0];
            const vecB = [1, 0, 0];
            const vecC = [0, 1, 0];

            expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
            expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
        });

        it('should answer shopping assistant questions with live catalog grounding', async () => {
            const catalog = [
                { _id: '1', name: 'Ultra Wireless Headset', price: 1499, category: 'Audio', stock: 15 }
            ];
            const result = await chatComplete({
                messages: [{ role: 'user', content: 'Show me audio products' }],
                catalogContext: catalog
            });

            expect(result.reply).toBeDefined();
            expect(result.suggestedProducts.length).toBeGreaterThan(0);
        });
    });
});
