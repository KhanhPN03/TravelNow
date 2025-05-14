# TravelNow Project

TravelNow is a comprehensive travel management application that includes mobile, web, and server components. This project is designed to provide an easy and seamless experience for managing and booking tours.

## Project Structure

```
.gitignore
.vscode/
client-mobile/
client-web/
server/
server_AI/
```

### Key Components:
- **client-mobile**: Mobile application built with React Native.
- **client-web**: Web application built with React.
- **server**: Backend API built with Node.js and Express.
- **server_AI**: AI-related resources and services.

---

## Prerequisites

Before starting, ensure you have the following installed:
- **Node.js**: >= 14.x
- **npm**: >= 6.x
- **Expo CLI**: For running the mobile app
- **MongoDB**: For backend database
- **Git**: For version control

---

## Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KhanhPN03/TravelNow.git
cd TravelNow
```

### 2. Install and Run Each Component

#### **Client Mobile**
1. Navigate to the `client-mobile` directory:
   ```bash
   cd client-mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the mobile app:
   ```bash
   npm start
   ```
   Use the Expo Go app on your mobile device to scan the QR code and run the app.

#### **Client Web**
1. Navigate to the `client-web` directory:
   ```bash
   cd client-web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the web application:
   ```bash
   npm start
   ```
   Open your browser and navigate to [http://localhost:4000](http://localhost:3000).

#### **Server**
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and configure the environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/travelnow
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The server will run at [http://localhost:5000](http://localhost:5000).

#### **Server AI**
1. Navigate to the `server_AI` directory:
   ```bash
   cd server_AI
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the AI server:
   ```bash
   python a.py
   ```
   The AI server will run at [http://localhost:9999](http://localhost:5001).

---

## Usage

1. **Login**: Use admin or user credentials to log in.
2. **Manage Users**: Admins can manage user details via the admin dashboard.
3. **Book Tours**: Users can search and book tours.
4. **Manage Tours**: Tour guides can manage the tours they are responsible for.
5. **Refund Requests**: Users can request refunds for bookings.

---

## Notes

- Ensure MongoDB is running before starting the server.
- If you encounter any issues, check the `.env` configuration and ensure all dependencies are installed.

---

## Contact

For any questions or support, please contact us at travelnow.co@gmail.com