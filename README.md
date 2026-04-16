# AI-dentifier 🔍

AI-dentifier is a high-performance, premium object detection web application built with **Next.js 16** and **Hugging Face Transformers.js**. It utilizes Facebook's **DEtection TRansformer (DETR)** model to identify and localize objects in images directly on your local machine using WebAssembly and ONNX Runtime.

**Repository:** [https://github.com/JasonRandazza/aidentifier](https://github.com/JasonRandazza/aidentifier)

![AI-dentifier Preview](https://github.com/facebookresearch/detr/raw/master/.github/DETR.png)

## ✨ Features
- **Local Inference**: Runs AI models natively on your server/machine—no constant cloud API costs or latency.
- **Premium UI**: Dark-mode glassmorphism design with dynamic bounding box overlays.
- **Interactive Controls**: Filter detected objects by category with real-time feedback.
- **Responsive Design**: Fast and fluid experience across desktop and mobile.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- A [Hugging Face Free Access Token](https://huggingface.co/settings/tokens) (required for the initial model download).

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/JasonRandazza/aidentifier.git
cd aidentifier
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and add your Hugging Face API key:
```env
HF_APIKEY="your_huggingface_token_here"
```

### 3. Run the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤖 How it Works

### Local Object Detection
Instead of sending your images to an external cloud API for every request, this app uses the `@huggingface/transformers` library to run the **`facebook/detr-resnet-50`** model.

- **Initial Run**: The first time you analyze an image, the app will download the model files (~160MB) into a local `.cache/` directory.
- **Subsequent Runs**: Detection is nearly instantaneous as the model is served from your local storage.
- **Privacy**: Your images are processed on your local server environment and never shared with 3rd parties.

---

## 🛠 Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **AI Engine**: [Transformers.js](https://huggingface.co/docs/transformers.js/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Repository Structure
- `src/app/api/route.ts`: The backend logic for local AI inference.
- `src/app/page.tsx`: The main interactive dashboard and bounding box rendering logic.
- `.cache/`: (Ignored by Git) Stores the AI model binaries locally.

---

## 📄 License
This project was modernized from the LearnWeb3 sophomore AI tutorial. Feel free to use and modify!
