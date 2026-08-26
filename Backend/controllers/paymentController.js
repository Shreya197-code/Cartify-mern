const Stripe = require('stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

/**
 * Create Stripe Checkout Session
 * Recalculates product prices from database to prevent client price tampering.
 */
const createCheckoutSession = async (req, res) => {
    try {
        const { items, address } = req.body;

        if (!items || items.length === 0 || !address) {
            return res.status(400).json({ success: false, message: 'Cart items and shipping address are required' });
        }

        // Fetch products and verify live prices
        const itemIds = items.map(item => item.productId || item._id);
        const products = await Product.find({ _id: { $in: itemIds } });

        if (products.length !== items.length) {
            return res.status(400).json({ success: false, message: 'One or more products in cart were not found' });
        }

        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        let totalAmount = 0;
        const verifiedItems = [];
        const stripeLineItems = [];

        for (const item of items) {
            const pId = (item.productId || item._id).toString();
            const product = productMap.get(pId);
            const quantity = Number(item.quantity) || 1;

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${product.name}" only has ${product.stock} items in stock.`
                });
            }

            const itemPrice = Number(product.price);
            totalAmount += itemPrice * quantity;

            verifiedItems.push({
                productId: product._id,
                quantity,
                price: itemPrice
            });

            stripeLineItems.push({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: product.name,
                        images: product.imageUrl ? [product.imageUrl] : [],
                        description: product.description ? product.description.substring(0, 100) : undefined
                    },
                    unit_amount: Math.round(itemPrice * 100) // Stripe expects smallest currency unit (paise / cents)
                },
                quantity
            });
        }

        // Create pending Order in database
        const order = new Order({
            user: req.user._id,
            items: verifiedItems,
            totalAmount,
            address,
            paymentStatus: 'pending',
            paymentProvider: 'stripe',
            status: 'pending'
        });

        await order.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // Check if Stripe key is available
        if (!process.env.STRIPE_SECRET_KEY) {
            // Development fallback if Stripe key is not yet set
            return res.status(200).json({
                success: true,
                orderId: order._id,
                message: 'Order created in pending state. (STRIPE_SECRET_KEY not configured)',
                url: `${frontendUrl}/orders?orderId=${order._id}&status=pending`
            });
        }

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: stripeLineItems,
            client_reference_id: order._id.toString(),
            customer_email: req.user.email,
            metadata: {
                orderId: order._id.toString(),
                userId: req.user._id.toString()
            },
            success_url: `${frontendUrl}/orders?payment=success&orderId=${order._id}`,
            cancel_url: `${frontendUrl}/checkout?payment=cancelled&orderId=${order._id}`
        });

        order.providerSessionId = session.id;
        await order.save();

        return res.status(200).json({
            success: true,
            orderId: order._id,
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Checkout Session Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create payment session',
            error: error.message
        });
    }
};

/**
 * Handle Stripe Webhooks
 * Signature-verified webhook that is the ONLY place Order.paymentStatus becomes 'paid'.
 */
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
        return res.status(500).send('Stripe credentials not configured');
    }

    let event;
    const stripe = getStripe();

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error(`⚠️ Webhook signature verification failed:`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle checkout session completed
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata?.orderId || session.client_reference_id;

        if (orderId) {
            try {
                const order = await Order.findById(orderId).populate('user', 'username email');
                if (order && order.paymentStatus !== 'paid') {
                    order.paymentStatus = 'paid';
                    order.paymentId = session.payment_intent || session.id;
                    await order.save();

                    // Decrement stock for ordered items
                    for (const item of order.items) {
                        await Product.findByIdAndUpdate(item.productId, {
                            $inc: { stock: -item.quantity }
                        });
                    }

                    // Send order confirmation email
                    if (order.user && order.user.email) {
                        const emailContent = `Dear ${order.user.username || 'Customer'},

Thank you for your payment! Your order #${order._id} has been confirmed.

Total Paid: ₹${order.totalAmount}
Payment ID: ${order.paymentId}

We will notify you when your items are on the way!

Warm regards,
Cartify Team`;
                        sendEmail(order.user.email, 'Payment Confirmed - Order #' + order._id, emailContent).catch(err => {
                            console.error('Failed to send payment confirmation email:', err.message);
                        });
                    }
                }
            } catch (error) {
                console.error('Error processing order post-payment:', error);
            }
        }
    }

    return res.status(200).json({ received: true });
};

module.exports = {
    createCheckoutSession,
    handleWebhook
};
