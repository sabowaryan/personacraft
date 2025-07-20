# PersonaCraft

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E=18-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-blue)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

## 🎯 Overview

**PersonaCraft** is an innovative platform for generating marketing personas, combining the power of Google Gemini’s large language model with Qloo Taste AI™’s cultural intelligence. Instantly transform a marketing brief into detailed, authentic, and actionable personas in under 60 seconds.

---

## 🚀 Key Features

- **Ultra-realistic persona generation** using hybrid AI (Gemini + Qloo)
- **Authentic cultural data**: music, movies, brands, lifestyle preferences
- **Professional exports**: PDF, CSV, JSON
- **Modern UI**: Tailwind CSS 4, responsive, smooth animations
- **Integrated analytics**: quality scores, trends, optimization insights

---

## 📦 Installation

### Prerequisites

- Node.js >= 18
- npm >= 9
- Access to Gemini and Qloo APIs (API keys required)

### Steps

```bash
git clone <repo-url>
cd personacraft
npm install
```

---

## 🔑 API Configuration

Create a `.env.local` file at the project root:

```env
GEMINI_API_KEY=YourGeminiKey
QLOO_API_KEY=YourQlooKey
```

---

## ▶️ Running the App

**Development:**
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

**Production:**
```bash
npm run build
npm start
```

---

## 🧑‍💻 Usage Example

1. Go to the home page.
2. Fill in the marketing brief form.
3. Click “Generate” to create a detailed persona.
4. Analyze, export (PDF, CSV, JSON), or share the generated persona.

---

## 🗂️ Project Structure

- `app/` : Next.js pages (frontend & API routes)
- `components/` : Reusable UI components
- `lib/` : API integration, business logic, utilities
- `hooks/` : Custom React hooks
- `public/` : Static assets
- `docs/` : Technical documentation

---

## 🧠 Architecture & Technologies

- **Next.js 15** (App Router)
- **Strict TypeScript**
- **Tailwind CSS 4**
- **Google Gemini API**
- **Qloo Taste AI™ API**
- **PDF/CSV/JSON export**
- **Integrated tests & documentation**

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a branch (`feature/my-feature`)
3. Commit your changes
4. Open a Pull Request

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) if available.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

- Email: contact@personacraft.com
- GitHub Issues

---

## 💡 About

PersonaCraft demonstrates advanced integration of a large language model (Google Gemini) and the Qloo Taste AI™ API for generating culturally grounded marketing personas.  
For questions, suggestions, or partnership inquiries, please contact us!

---