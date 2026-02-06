# CareAxis-SpineLogic
CareAxis: A "Dual-Brain" Clinical Intelligence Layer powered by Gemini 3. Features System 1/System 2 agentic orchestration, native multimodal reasoning for spine MRI analysis, and a self-correcting Vector RAG memory loop.


# 🏥 CareAxis (Neuro-Vision Engine)

![Status](https://img.shields.io/badge/Status-Prototype-blue) ![Stack](https://img.shields.io/badge/AI-Gemini_1.5_Pro_%26_Flash-magenta) ![Memory](https://img.shields.io/badge/Memory-Vector_RAG-green) ![Hackathon](https://img.shields.io/badge/Gemini_3_Hackathon-Submission-orange)

> **The "Dual-Brain" Agentic Architecture for High-Stakes Spine Diagnostics.** > *Not just a wrapper—a self-correcting Clinical Operating System.*

---

## ⚡ Executive Summary
**CareAxis** solves the "Black Box" problem in medical AI. Unlike standard chatbots that hallucinate or forget context, CareAxis uses a **System 1 / System 2** architecture to mimic a human clinical team. It splits reasoning into two specialized agents—**Radix** (Text Triage) and **Voxel** (Visual Reasoning)—and connects them with a **"Golden Loop"** of institutional memory.

If a doctor disagrees with a diagnosis, CareAxis doesn't just apologize; it **learns**. The feedback is embedded into a Vector Database, creating a permanent "rule" that guides all future inferences.

## 🧠 The Dual-Brain Architecture

### 1. The Radix Agent (System 1)
* **Model:** **Gemini 3** (Optimized for Latency)
* **Role:** The "Reflex." It processes patient history, symptoms, and risk factors in milliseconds.
* **Function:** Structures the chaotic clinical notes into a strict diagnostic context *before* the image is even loaded.

### 2. The Voxel Agent (System 2)
* **Model:** **Gemini 3** (Optimized for Reasoning Depth)
* **Role:** The "Reasoning." It performs **Native Multimodal Inference**.
* **Function:** It doesn't just "detect objects." It analyzes the MRI scan *through the lens* of the Radix Agent's hypothesis. It actively hunts for visual evidence to confirm or refute the specific clinical suspicion.

### 3. The Golden Loop (Institutional Memory)
* **Tech:** **ChromaDB (Vector RAG)**
* **Role:** The "Wisdom."
* **Function:** When a doctor submits a correction, the system generates a vector embedding of the error. On every subsequent run, the agents perform a semantic search to check: *"Have we made a mistake like this before?"* allowing the system to self-correct in real-time without fine-tuning.

---

## 🏆 Why This Wins (Technical Highlights)

| Feature | Standard AI Wrapper | 🏥 CareAxis System |
| :--- | :--- | :--- |
| **Multimodality** | Stitched (OCR + Text Model) | **Native Cross-Modal Reasoning** (Pixels & Text in one Vector Space) |
| **Memory** | Stateless (Amnesia on refresh) | **Vector-Augmented RAG** (Learns from Doctor Feedback) |
| **Reasoning** | Zero-Shot ("What is this?") | **Chain-of-Thought** (Inventory $\to$ Critic $\to$ Diagnosis) |
| **Safety** | Unstructured Text | **FHIR-Ready JSON** (Strict Schema Enforcement) |
| **Cost/Speed** | Single Expensive Model | **Tiered Orchestration** (Flash for Speed, Pro for Depth) |

---

## 🛠️ Tech Stack

* **AI Core:** Google Gemini 1.5 Pro & Gemini 1.5 Flash
* **Backend:** Python (FastAPI) for AI Logic, Node.js (Express) for App Data
* **Frontend:** React, TypeScript, TailwindCSS
* **Memory/RAG:** ChromaDB (Vector Store)
* **Database:** MongoDB (Patient Records)
* **Orchestration:** LangChain (Prompt Management)

---

## 🚀 Key Workflows

### The "Triage-to-Vision" Pipeline
1.  **Ingest:** Doctor uploads raw notes + MRI Scans.
2.  **Radix (Flash):** Instantly parses notes, flags "L5-S1 Radiculopathy" risk.
3.  **Bridge:** Constructs a JSON context payload.
4.  **Voxel (Pro):** Receives the scan + the context. *("Look specifically at L5-S1 for compression.")*
5.  **Audit:** Voxel checks the Vector DB for past missed diagnoses.
6.  **Output:** Generates a structured clinical report with citations.

### The "Learning Loop"
1.  Doctor clicks **"Disagree"** and types: *"This isn't a herniation; it's a synovial cyst."*
2.  System captures this text and the image context.
3.  **Embedding:** Converts the rule into a vector.
4.  **Injection:** The next time a similar visual pattern appears, the prompt automatically injects: *RAM Warning: Check for synovial cysts.*

---


---

## 💿 Installation & Setup

```bash
# Clone the repo
git clone [https://github.com/yourusername/careaxis.git](https://github.com/yourusername/careaxis.git)

# Install Dependencies (Backend)
cd server
npm install

# Install Dependencies (AI Engine)
cd ai_server
pip install -r requirements.txt

# Run the Dual-Stack
# (See separate instructions for starting FastAPI and Express)
