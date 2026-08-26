const Product = require('../models/Product');
const Order = require('../models/Order');
const {
    embedText,
    cosineSimilarity,
    chatComplete,
    generateProductDescription,
    summarizeReviews
} = require('../services/ai/aiService');

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'in', 'on', 'for', 'with', 'is', 'and', 'to', 'of', 'show', 'me', 
    'find', 'want', 'looking', 'give', 'buy', 'get', 'need', 'i', 'some', 'any', 'my', 
    'what', 'which', 'who', 'where', 'how', 'can', 'you', 'please', 'tell', 'about', 'recommend', 'items', 'products'
]);

const CATEGORY_SYNONYMS = {
    Fashion: ['outfit', 'dress', 'clothes', 'clothing', 'wear', 'kurta', 'hoodie', 'apparel', 'festive', 'traditional', 'ethnic', 'shirt', 'jacket', 'anarkali', 'attire', 'suit', 'pajama', 'diwali', 'wedding'],
    Footwear: ['shoes', 'sneakers', 'kicks', 'running', 'boots', 'sandals', 'footwear', 'loafers', 'jutti', 'mojari'],
    Accessories: ['watch', 'watches', 'sunglasses', 'shades', 'glasses', 'wallet', 'belt', 'jewelry', 'timepiece'],
    Electronics: ['phone', 'iphone', 'laptop', 'computer', 'macbook', 'mouse', 'camera', 'gadget', 'tech', 'device'],
    Audio: ['headphone', 'headphones', 'earphone', 'earbuds', 'speaker', 'audio', 'sound', 'music', 'anc', 'noise'],
    'Home & Kitchen': ['mug', 'coffee', 'cup', 'kitchen', 'home', 'kettle', 'bottle', 'smart mug']
};

/**
 * Extract meaningful keywords from a query
 */
const extractKeywords = (query) => {
    return query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 1 && !STOP_WORDS.has(word));
};

/**
 * Match categories based on synonym dictionary
 */
const getMatchedCategories = (queryLower) => {
    const matched = [];
    for (const [cat, syns] of Object.entries(CATEGORY_SYNONYMS)) {
        if (syns.some(syn => queryLower.includes(syn))) {
            matched.push(cat);
        }
    }
    return matched;
};

/**
 * Score catalog products against a user query
 */
const scoreProductsForQuery = async (query, products) => {
    const queryLower = query.toLowerCase();
    const keywords = extractKeywords(query);
    const matchedCategories = getMatchedCategories(queryLower);
    const queryEmbedding = await embedText(query);

    return products.map(product => {
        let score = 0;
        const prodName = (product.name || '').toLowerCase();
        const prodDesc = (product.description || '').toLowerCase();
        const prodCat = (product.category || '').toLowerCase();

        // 1. Category match boost
        if (matchedCategories.some(c => c.toLowerCase() === prodCat)) {
            score += 0.45;
        }

        // 2. Keyword exact matches
        let keywordHits = 0;
        for (const kw of keywords) {
            if (prodName.includes(kw)) keywordHits += 0.35;
            else if (prodDesc.includes(kw)) keywordHits += 0.20;
            else if (prodCat.includes(kw)) keywordHits += 0.25;
        }
        score += keywordHits;

        // 3. Vector Embedding similarity
        if (product.embedding && product.embedding.length > 0) {
            const cosineSim = cosineSimilarity(queryEmbedding, product.embedding);
            score += cosineSim * 0.4;
        }

        return {
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            imageUrl: product.imageUrl,
            rating: product.rating,
            numReviews: product.numReviews,
            score: Number(score.toFixed(3))
        };
    });
};

/**
 * Semantic Product Search
 * Performs vector similarity search with keyword search fallback
 */
const semanticSearch = async (req, res) => {
    try {
        const query = req.query.q || req.body.query || '';
        if (!query.trim()) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        const products = await Product.find({}).select('+embedding');
        const scoredProducts = await scoreProductsForQuery(query, products);

        // Filter and sort by highest similarity
        const filtered = scoredProducts
            .filter(p => p.score >= 0.25)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12);

        res.status(200).json({
            success: true,
            results: filtered,
            fallback: filtered.length === 0
        });

    } catch (error) {
        console.error('Semantic Search Error:', error);
        res.status(500).json({ success: false, message: 'Semantic search failed', error: error.message });
    }
};

/**
 * RAG Shopping Assistant Chatbot
 * Grounded in live MongoDB catalog & user's own orders
 */
const assistantChat = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ success: false, message: 'Messages array is required' });
        }

        const lastMessage = messages[messages.length - 1].content || '';

        // Retrieve scored catalog context
        const allProducts = await Product.find({}).select('+embedding');
        const scored = await scoreProductsForQuery(lastMessage, allProducts);

        // Only include products that meet the relevance threshold
        const catalogContext = scored
            .filter(p => p.score >= 0.28)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);

        // Retrieve user orders context (auth-scoped)
        let orderContext = [];
        if (req.user) {
            orderContext = await Order.find({ user: req.user.id })
                .populate('items.productId', 'name price')
                .sort({ createdAt: -1 })
                .limit(3);
        }

        const response = await chatComplete({
            messages,
            catalogContext,
            orderContext
        });

        res.status(200).json({
            success: true,
            ...response
        });

    } catch (error) {
        console.error('Assistant Chat Error:', error);
        res.status(500).json({ success: false, message: 'Shopping assistant encountered an error', error: error.message });
    }
};

/**
 * Admin Product Description Drafting
 */
const generateDescription = async (req, res) => {
    try {
        const { name, category, specs } = req.body;
        if (!name || !category || !specs) {
            return res.status(400).json({ success: false, message: 'Product name, category, and specs are required' });
        }

        const description = await generateProductDescription({ name, category, specs });
        res.status(200).json({ success: true, description });

    } catch (error) {
        console.error('AI Description Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate description', error: error.message });
    }
};

/**
 * Product Review Summarizer (Pros & Cons)
 */
const getReviewSummary = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const summaryData = await summarizeReviews(product.reviews);
        res.status(200).json({ success: true, ...summaryData });

    } catch (error) {
        console.error('Review Summary Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate review summary', error: error.message });
    }
};

module.exports = {
    semanticSearch,
    assistantChat,
    generateDescription,
    getReviewSummary
};
