# Cartify

Cartify is a full-stack MERN e-commerce application built with React 19, Express 5, and MongoDB. It includes core shopping features such as product catalog filtering, cart persistence, Cash on Delivery, Stripe checkout, order tracking, and an admin dashboard. It also integrates Google Gemini to provide a shopping assistant chatbot, vector-based semantic product search, automated customer review summaries, and an admin product description generator.

## Features

### Authentication
- User registration with 6-digit email OTP verification via Nodemailer
- User login with JSON Web Tokens (JWT)
- Password reset flow via email link
- Protected routes and role-based access control (`user` and `admin`)

### Products
- Paginated product catalog with category and price range filters
- Keyword search across product name, description, and category
- Sorting by price (asc/desc), average rating, review count, and newest
- Product detail pages with image gallery and verified customer reviews
- Review submissions restricted to verified buyers who purchased the item

### Cart & Orders
- Shopping cart managed with Redux Toolkit and persisted to `localStorage`
- Real-time cart quantity adjustments and price calculations
- Multi-step checkout with delivery address capture
- Order history page for authenticated users to track order status
- Automatic inventory decrement upon order placement

### Payments
- **Cash on Delivery (COD):** Direct order placement without external credentials
- **Stripe Checkout:** Hosted checkout sessions with Stripe webhook verification to update order payment status

### Admin
- Analytics dashboard showing total revenue, order count, and user metrics
- Product CRUD interface with image uploads to Cloudinary via Multer
- Order fulfillment status management (pending, processing, shipped, delivered)

### AI Features
- **Shopping Assistant:** Chatbot built with Gemini 1.5 Flash that references store catalog data and user order history
- **Semantic Search:** Conceptual search using `text-embedding-004` and cosine similarity, with local math fallback
- **Review Summaries:** Automated pros and cons sentiment breakdown on product pages
- **Description Generator:** Admin tool to generate draft product descriptions from name, category, and bullet specs

## Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Redux Toolkit, React Router 7, Tailwind CSS, React Toastify |
| **Backend** | Node.js (18+), Express 5, Helmet, express-rate-limit, Zod |
| **Database** | MongoDB, Mongoose 9 |
| **Authentication** | JWT (jsonwebtoken), bcryptjs, Nodemailer |
| **AI** | Google Gemini (`gemini-1.5-flash`, `text-embedding-004`) |
| **Storage** | Cloudinary, Multer |
| **Payments** | Stripe, Cash on Delivery |

## Project Structure

```text
Cartify/
├── Backend/
│   ├── config/          # MongoDB connection and Cloudinary setup
│   ├── controllers/     # Route controllers (auth, products, orders, ai, admin)
│   ├── middleware/      # Auth, rate limiting, upload, and error handlers
│   ├── models/          # Mongoose models (User, Product, Order)
│   ├── routes/          # Express route definitions
│   ├── services/        # AI integration and fallback embedding logic
│   ├── validators/      # Zod input validation schemas
│   ├── __tests__/       # Jest API test suite
│   ├── seedProducts.js  # Database seed script
│   └── index.js         # Express app entry point & SPA static server
├── frontend/
│   ├── public/          # Static assets, SVG logo, and redirect files
│   ├── src/
│   │   ├── components/  # Navbar, Product cards, AI Chat Assistant
│   │   ├── pages/       # Home, Shop, ProductDetail, Cart, Checkout, Admin
│   │   ├── redux/       # Redux store and cart slice
│   │   └── App.jsx      # Root routing component
│   └── vercel.json      # Vercel SPA routing rewrite config
├── render.yaml          # Render Blueprint deployment specification
└── package.json         # Root scripts for multi-package management
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- A local MongoDB instance or a free MongoDB Atlas connection string

### Installation

Clone the repository and install dependencies for both the backend and frontend:

```bash
git clone https://github.com/Shreya197-code/Cartify-mern.git
cd Cartify-mern
npm run install:all
```

### Environment Variables

Create a `.env` file in the `Backend` directory:

```bash
cp Backend/.env.example Backend/.env
```

Configure the following variables in `Backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/cartify-mern

# Authentication
JWT_SECRET=your_jwt_secret_key

# Email (Nodemailer for OTP verification)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary (Media upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI (Optional - Gemini API key from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key

# Stripe (Optional test keys for online card payments)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

> **Note:** The Gemini API key and Stripe keys are optional for running the app locally. If omitted, the AI features use built-in local math fallbacks, and the checkout supports Cash on Delivery.

### Run Locally

Start both the backend and frontend concurrently with one command:

```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/v1
- **Health Check:** http://localhost:5000/health

## Database Seeding

To populate MongoDB with sample products, categories, and review data:

```bash
node Backend/seedProducts.js
```

## Testing

Run the backend test suite:

```bash
npm test
```

This runs Jest tests covering API health endpoints, Helmet security headers, Zod validation errors, and AI fallback math.

## Deployment

### Render All-in-One Deployment (Primary)

The repository includes a [render.yaml](render.yaml) Blueprint configured to build the React frontend and serve it directly through Express 5 on Render's free tier.

1. Push your repository to GitHub.
2. In the Render Dashboard, select **New** > **Blueprint**.
3. Connect your `Cartify-mern` repository.
4. Render detects `render.yaml` and configures:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Enter your environment variables (`MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`, `CLOUDINARY_*`, `GEMINI_API_KEY`) when prompted (`JWT_SECRET` is generated automatically).
6. Click **Apply** to deploy.

### Decoupled Deployment (Alternative)

If you prefer deploying the frontend and backend separately:
- **Frontend on Vercel:** Deploy the `frontend/` directory. The included `frontend/vercel.json` ensures client-side routes do not 404 on refresh.
- **Backend on Render or Railway:** Deploy `Backend/` as a Node.js web service and set `FRONTEND_URL` to your frontend domain.

## Screenshots

<!-- Add screenshots of the home page, shop, product details, cart/checkout, and admin dashboard here. -->

## Author

**Shreya Sah**
- GitHub: [https://github.com/Shreya197-code](https://github.com/Shreya197-code)

## License

This project is licensed under the ISC License.
