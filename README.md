# **Prompt Nexus 🚀**

Welcome to Prompt Nexus, a full-stack MERN application that uses the power of Google's Gemini AI to transform your simple ideas into detailed, powerful prompts for various creative needs. This is a complete SaaS (Software as a Service) application featuring user authentication, a credit-based usage system, and a fully integrated payment gateway.

## **✨ Features**

* **Secure User Authentication:** Complete user registration with email verification (via Resend), secure login with password hashing (bcryptjs), and session management using JSON Web Tokens (JWT).  
* **Professional Landing Page:** A modern, welcoming landing page for new users.  
* **Dynamic Dashboard:** A personalized hub for users, displaying key stats like remaining credits, total prompts generated, and current plan. It features a clean, intuitive UI with a dropdown user menu and a sliding "Recent Activity" feed.  
* **Multi-Type AI Generation:** Create prompts for a variety of needs:  
  * **Images:** For AI art generators like Midjourney or DALL-E.  
  * **Text:** For story starters and creative writing.  
  * **Video:** For scene descriptions and video AIs.  
  * **Website UI:** For generative UI/UX tools.  
  * **Code:** For functions and code snippets.  
* **Credit & Subscription System:**  
  * Users receive a starting balance of free credits upon signup.  
  * Each prompt generation costs credits, encouraging users to upgrade.  
  * A daily cron job on the server resets credits for subscribed users.  
* **Payment Gateway:** Fully integrated with **Razorpay** in test mode, allowing users to purchase credit packs and upgrade their plan.  
* **Complete Account Management:** A dedicated profile page where users can update their name, securely change their password, and view their subscription status.  
* **Prompt History:** A sliding sidebar on the generator page allows users to view their entire creation history.

## **🛠️ Tech Stack**

* **Frontend:** React, Vite, React Router DOM, Axios  
* **Backend:** Node.js, Express.js  
* **Database:** MongoDB (with Mongoose)  
* **AI:** Google Gemini API  
* **Payments:** Razorpay  
* **Email:** Resend  
* **Styling:** Plain CSS with a professional, modern design.

## **🚀 Getting Started**

### **Prerequisites**

* Node.js (v18.x or higher is recommended)  
* A MongoDB Atlas account and connection string.  
* API keys for Google Gemini, Razorpay (Test Mode), and Resend.

### **Installation & Setup**

1. **Clone the repository:**  
   git clone https://github.com/HL2303/Prompt-Nexus.git  
   cd Prompt-Nexus

2. **Setup Backend:**  
   cd Backend  
   npm install

   Create a .env file in the Backend folder and add your secret keys:  
   ATLAS\_URI=your\_mongodb\_connection\_string  
   GEMINI\_API\_KEY=your\_gemini\_api\_key  
   JWT\_SECRET=your\_super\_secret\_random\_string  
   RAZORPAY\_KEY\_ID=your\_razorpay\_key\_id  
   RAZORPAY\_KEY\_SECRET=your\_razorpay\_key\_secret  
   RESEND\_API\_KEY=your\_resend\_api\_key

   Then, start the backend server:  
   node server.js

3. **Setup Frontend:**  
   \# From the root project folder (Prompt-Nexus)  
   npm install

   Create a .env file in the **root** folder and add your public Razorpay Key ID:  
   VITE\_RAZORPAY\_KEY\_ID=your\_public\_razorpay\_key\_id

   Then, start the frontend development server:  
   npm run dev

   Your application will be running at http://localhost:5173.