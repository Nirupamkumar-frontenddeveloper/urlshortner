TinyLink – URL Shortener


Features
• Shorten long URLs
• Optional custom short code
• Prevents duplicate codes
• 302 redirect using /:code
• Auto click counting
• Delete links
• Stats page for each link
• Fully responsive (desktop + mobile)
• Dark/Light theme toggle
• Auto-refresh dashboard


Tech Stack

Next.js (Pages Router)
Node.js
PostgreSQL (Neon)
pg database client
Plain CSS
Vercel Deployment
Dependencies
"dependencies": {
"next": "14.1.0",
"react": "18.2.0",
"react-dom": "18.2.0",
"pg": "^8.11.3"
},
"devDependencies": {
"autoprefixer": "^10.4.16",
"postcss": "^8.4.31",
"tailwindcss": "^3.3.3"
}


How to Run Locally

Install dependencies:
npm install
Set environment variable:
DATABASE_URL=your_neon_postgres_connection_string

Start development server:
npm run dev
Open in browser:
http://localhost:3000