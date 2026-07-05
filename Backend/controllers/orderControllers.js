const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

// Create Order
const createOrder = async (req, res) => {
    try {
        const {
            items,
            totalAmount,
            address,
            paymentId
        } = req.body;

        // Validation
        if (
            !items ||
            items.length === 0 ||
            !totalAmount ||
            !address
        ) {
            return res.status(400).json({
                message: 'Invalid order data'
            });
        }

        // Create Order
        const order = new Order({
            user: req.user.id,
            items,
            totalAmount,
            address,
            paymentId
        });

        await order.save();

        // Send Confirmation Email
    const message = `
Dear ${req.user.username},

Thank you for shopping with Cartify.

Your order has been placed successfully and is now being processed.

Order Details:
--------------------------------
Order ID: ${order._id}
Total Amount: ₹${totalAmount}
Payment ID: ${paymentId || 'Cash on Delivery'}
--------------------------------

Shipping Address:
${address}

We will notify you once your order has been shipped.

Thank you for choosing Cartify.

Best Regards,
Cartify Team
`;

        try {
            await sendEmail(
                req.user.email,
                'Order Confirmation',
                message
            );
        } catch (err) {
            console.log('Email failed:', err.message);
        }

        return res.status(201).json({
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error creating order',
            error: error.message
        });
    }
};

module.exports = {
    createOrder
};

//My orders
const myOrders = async (req, res) => {
    try {
        console.log("req.user =", req.user);

        const orders = await Order
            .find({ user: req.user.id });

        console.log("orders =", orders);

        return res.status(200).json(orders);

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

//all orders
const getOrders = async (req, res) => {
    try {

        const orders = await Order
            .find({})
            .populate('user', 'username email role');

        return res.status(200).json(orders);

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error fetching orders',
            error: error.message
        });
    }
};
//update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        order.status = status;

        await order.save();

        return res.status(200).json({
            message: 'Order status updated',
            order
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error updating order status',
            error: error.message
        });
    }
};



module.exports={
    createOrder,
    myOrders,
    getOrders,
    updateOrderStatus,
};