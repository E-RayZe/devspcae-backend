🚀 DevSpace Ngrok Setup Guide
1️⃣ Start Tunnel
Backend server (Port 5000) chalaane ke baad, naya terminal kholo aur ye command chalao:

Bash

# Agar local installed hai

ngrok http 5000

# Agar error aaye "not recognized" toh npx use karo

npx ngrok http 5000
2️⃣ Update Frontend API URL
Terminal mein jo Forwarding URL milega (https://...), usse copy karo aur niche wali file mein update karo:

File: devspace-frontend/constants/api.tsx

TypeScript
export const API_URL = "https://TUMHARA_NGROK_URL.ngrok-free.dev/api";
3️⃣ Bypass Browser Warning (Essential)
Mobile app mein JSON Parse Error na aaye, isliye backend mein ye header hona zaroori hai.

File: devspace-backend/src/app.js

JavaScript
// app.use(cors()) ke Just neeche ye add karo:
app.use((req, res, next) => {
res.setHeader('ngrok-skip-browser-warning', 'true');
next();
});
4️⃣ Troubleshooting Checklist
URL Change: Yaad rakhna, agar tunnel restart kiya toh URL badal jayega. Code mein update karna padega.

Auth Error: Agar login issue aaye toh check karo ki backend terminal mein MongoDB connected show ho raha hai ya nahi.

Cache Issue: Frontend update karne ke baad agar purana IP dikhaye, toh npx expo start -c use karo.
