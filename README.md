# 🧠 Traffic Sense AI — Intelligent Real-Time Traffic Monitoring System

> **Traffic Sense AI** is a research-driven, full-stack system built for **real-time multi-stream traffic analysis**, powered by enhanced YOLO variants — including our custom **YOLO-FDE (Feature Dynamic Enhanced)** model.  
> Designed to deliver **live vehicle detection, counting, analytics, and model benchmarking**, this platform merges deep learning, computer vision, and full-stack engineering into one seamless solution.

---

## 🚀 Example Visuals


![Home Preview](./frontend/images/home_preview.png)
![Dashboard Preview](./frontend/images/dashboard_preview.png)

---

## 🚦 Overview

Traffic Sense AI allows users to run **simultaneous object detection** across up to 4 video sources — whether live streams, YouTube links, or uploaded videos — all through an intuitive web dashboard.

It features:
- **Multi-model YOLO integration** (YOLOv8, YOLOv8-FDD, FDIDH, DySample, and our proposed YOLO-FDE).
- **Live real-time inference and MJPEG streaming** using Flask.
- **Interactive performance analytics dashboard** with mAP and loss comparisons.
- **Fully persistent sessions** with SQLite backend and RESTful API.
- **Clean, reactive frontend** using React + TypeScript + TailwindCSS.

---

## 🧩 Key Features

| Category | Description |
|-----------|--------------|
| 🚘 **Real-time Inference** | Run up to 4 concurrent live or offline video detections. |
| 🎥 **Video Input Support** | Supports RTSP, HTTP, YouTube (via `yt-dlp`), or local uploads. |
| 📊 **Analytics Dashboard** | Displays saved sessions, model performance charts, and statistics. |
| 🧠 **YOLO-FDE Architecture** | Integrates FDIDH, DWR, DySample, and Post-SPPF Attention modules. |
| 💾 **Session Management** | Save inference results to an SQLite database via Flask backend. |
| 🧱 **Model Comparison** | Benchmark YOLOv8-FDE vs YOLOv8, FDIDH+DWR, DySample, etc. |
| 🧮 **Lightweight Yet Accurate** | Achieves **0.9242 mAP@50** at only **2.69M params** and **3.5 GFLOPs**. |

---

## 🧬 Architecture Overview

<div align="center">
  
  ![YOLOv8-FDE Architecture](./frontend/public/images/yolov8_fde_architecture.png)
  
  <em>Figure: YOLOv8-FDE architecture with integrated FDIDH, DWR, DySample, and Post-SPPF Attention modules.</em>

</div>

The proposed **YOLO-FDE** introduces dynamic feature interaction and adaptive sampling for enhanced detection accuracy and generalization.  
It outperforms other YOLOv8 variants on the **UA-DETRAC** dataset, with the best **mAP@50–95 = 0.8159** while maintaining minimal computational overhead.

For detailed research methodology and ablation studies, refer to our extended repository:  
👉 **[YOLO-FEE: Feature Enhanced Extensions of YOLOv8](https://github.com/pnihal6/YOLO-FEE)**

---

## 📈 Model Performance (UA-DETRAC Subset)

| Model | Params (M) | GFLOPs | Precision | Recall | mAP@50 | mAP@50–95 |
|--------|-------------|--------|------------|---------|---------|------------|
| YOLOv8-N (Baseline) | 3.01 | 4.10 | 0.8689 | 0.8315 | 0.9090 | 0.7680 |
| YOLOv8-FDIDH + DWR | 13.57 | 12.50 | 0.9056 | 0.8319 | 0.9003 | 0.7603 |
| YOLOv8-FDIDH + DySample | 21.19 | 15.00 | 0.8676 | 0.8310 | 0.8980 | 0.7207 |
| YOLOv8-FDD | 16.56 | 40.02 | 0.8433 | 0.7919 | 0.8717 | 0.6797 |
| **YOLOv8-FDE (Proposed)** | **2.69** | **3.50** | **0.9077** | **0.8806** | **0.9242** | **0.8159** |

---

## ⚙️ Tech Stack

**Machine Learning / CV**
- PyTorch  
- Ultralytics YOLOv8  
- YOLO-FDE (Custom Architecture)  
- Supervision  
- OpenCV  
- NumPy  
- Matplotlib  

**Backend**
- Flask  
- Flask-CORS  
- SQLAlchemy  
- SQLite  
- Werkzeug  
- `yt-dlp` for YouTube video streams  
- Threading & OS Path Utilities  

**Frontend**
- React + TypeScript  
- TailwindCSS  
- Framer Motion  
- Recharts  
- React Router  
- Lucide Icons  

**Utilities**
- Fetch API  
- LocalStorage API  
- Concurrent Development (Flask + Vite)

---

## 🧠 Research & Methodology

Traffic Sense AI is grounded in deep architectural refinements introduced in **YOLO-FDE (Feature Dynamic Enhanced)**.  
The model integrates four critical modules:
1. **FDIDH** — Enables deformable feature interaction between classification and regression heads.  
2. **DySample** — Dynamically learns offset-based sampling for high-resolution localization.  
3. **DWR** — Uses dilation-wise residuals for efficient multi-scale context expansion.  
4. **Post-SPPF Attention** — Amplifies discriminative cues under occlusion and illumination variance.

---

## 🧮 Results Summary

- **+6.4% mAP@50–95** improvement vs YOLOv8 baseline.  
- **~33% fewer parameters** with superior accuracy.  
- **Significant FPS gain** (3.5 GFLOPs only).  
- **Robust under poor lighting, occlusion, and dense traffic.**  
- Deployed successfully in **real-time (RTX 4060)** at **>240 FPS**.

---

## 🧑‍💻 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/pnihal6/Traffic-Sense-AI.git
cd Traffic-Sense-AI
```

### 2. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 4. Run both frontend and backend together
```bash
npm start
```

This uses **concurrently** to start Flask + React simultaneously.

---



### 🅰 FDE Architecture 

![YOLO-FDE Architecture](./frontend/images/yolov8_fde_architecture.png)



---

## 🔗 Related Work & Research

For in-depth architecture details, ablation studies, and other YOLO variants, visit the companion repository:  
👉 **[YOLO-FEE: Feature Experimentation and Enhancement](https://github.com/pnihal6/YOLO-FEE)**

---

## 👨‍💻 Authors

**Team Traffic Sense AI**  
- **Priyadarshi Nihal** — Full Stack ML Engineer (Team Lead)
- **Dev Tailor** — Full Stack Developer  
- **Pratyush Dubey** — AI & ML Engineer  
- **Dattatrey** — Frontend Developer  
- **Shivalik Mathur** — Backend Developer  

**Supervisor:**  
🎓 *Dr. I. Jasmine Selvakumari Jeya*, Assistant Dean, VIT Bhopal University

---

## 🧾 License

This project is released under the **MIT License**.  
Feel free to use, modify, and cite with attribution to the original authors and research team.

---

## ❤️ Acknowledgments

We deeply thank our mentor, Dr. Jasmine, for her guidance, and the VIT Bhopal for support.  
Credits to **Ultralytics**, **Supervision**, and **YOLOv8** open-source communities for their foundational contributions.

---

## 📜 Citation

If you use this work or YOLO-FDE in your research, please cite:

```
@software{TrafficSenseAI2025,
  title={Traffic Sense AI: Real-Time Multi-Stream Traffic Monitoring using YOLO-FDE},
  author={Priyadarshi Nihal, Dev Tailor, Pratyush Dubey, Dattatrey, Shivalik Mathur},
  year={2025},
  institution={VIT Bhopal University},
  url={https://github.com/pnihal6/Traffic-Sense-AI}
}
```

---



## 🏁 Summary

Traffic Sense AI represents a fusion of **research-grade deep learning and production-grade engineering**, enabling scalable, intelligent, and real-time traffic surveillance with YOLO-FDE at its core.  

> *Smarter Cities, Safer Roads — Powered by Intelligent Vision.*
