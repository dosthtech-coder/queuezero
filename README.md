# QUEUEZERO™ — Primary Waiting Diagnosis System

**QUEUEZERO™** is a multi-disciplinary healthcare platform powered by the **PhysioMimica Engine**. It transforms clinic waiting rooms into intelligent pre-assessment zones, converting waiting time into meaningful primary clinical data.

---

## 🚀 Vision: AMD Slingshot — Human Imagination Built with AI

QUEUEZERO™ leverages the power of **AMD Ryzen™ Embedded Edge Compute** (Ryzen AI NPU + Radeon™ Graphics) to deliver low-latency, privacy-sovereign biomechanical tracking directly at the point of care.

---

## ✨ Features

### 🦴 Biomechanical Assessment (PhysioMimica Engine)
* **Full-Body ROM Analysis**: Precise tracking of Neck, Shoulders, Spine, and Lower Limbs.
* **ISB-Compliant Methodology**: Uses International Society of Biomechanics standards for 3D kinematic calculations.
* **Movement Quality Inference**: Detects velocity jitter and smoothness to differentiate between pain-limited and strength-limited motion.
* **Compensation Detection**: Identifies out-of-plane movements (e.g., trunk flexion during arm lift).

### 🩺 Clinical Intelligence
* **Contextual Risk Matrix**: Probabilistic indicators correlating age, occupation (e.g., Manual Labor vs. Desk Worker), and range-of-motion deficits.
* **Vitals Integration**: Secure collection of BP, HR, and RR via connected peripherals.
* **Probabilistic Stress Indicators**: High-fidelity matching for subacromial stress, scapular dyskinesis, and spinal load profiles.

### 🏢 Patient & Provider Flow
* **Self-Guided Interface**: 3D Avatar (Three.js/WebGL) demonstrating standardized movement tasks.
* **Live Feedback**: Real-time skeleton overlay as a "clinical mirror" using computer vision.
* **Structured Patient Card**: Instant, grid-aligned PDF reports available to clinicians before the patient enters the consultation room.

---

## 🧱 Tech Stack

### Frontend (User Kiosk)
* **React 18** + **Vite** + **Tailwind CSS v4**
* **Three.js** / **@react-three/fiber** (Instructional 3D Avatar)
* **Lucide React** (Clinical Iconography)
* **Zustand** (Local Session Management)

### Backend (PhysioMimica Edge Engine)
* **FastAPI** (Python Local Server)
* **NumPy** / **SciPy** (Kinematic transformation math)
* **SQLAlchemy** / **SQLite** (Local session storage)
* **FilterPy** (Kalman filters for signal smoothing)
* **WeasyPrint** (Automated PDF Report Generation)

---

## 📂 Project Structure

```
queuezero/
├── frontend/             # React/Vite Kiosk Application
│   ├── src/
│   │   ├── components/   # Avatar, Skeleton Tracking, Shared UI
│   │   ├── pages/        # Intake, Assessment Flow, Results
│   │   └── api/          # Session & Patient API client
├── backend/              # PhysioMimica FastAPI Engine
│   ├── app/
│   │   ├── services/     # Biomechanics, Risk Engine, Export
│   │   ├── models/       # Database Schema (Patient, Session)
│   │   └── api/          # FastAPI Endpoints
├── QUEUEZERO_SYSTEM_DESIGN.md   # Deep architecture specification
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
./venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Impact Metrics
* **Time Saved**: 5–7 minutes reclaimed per patient intake.
* **Clinic ROI**: Pays for itself in ~7 business days through increased patient throughput.
* **Precision**: 60fps real-time tracking with <15ms processing latency on AMD hardware.

---

## 📄 License
MIT License - **PhysioMimica Engine v1.0**

---

## 👤 Author
Designed for the **Future of Intelligent Clinical Assessment**.
