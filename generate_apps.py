import os
import shutil
import random

TEMPLATE_DIR = "./template_base"
OUTPUT_DIR = "./generated_apps"
os.makedirs(OUTPUT_DIR, exist_ok=True)

base_spec = """# Project Specification

## 🧩 Project Overview
{description}

## 🔧 Key Features
- {feature1}
- {feature2}
- {feature3}
- {feature4}

## 🏗 Architecture Notes
- Frontend: Next.js
- Backend: Supabase
- Database: PostgreSQL

## 📁 File References
All specs and reference docs are located in `/docs`.
"""

descriptions = [
    "A fitness tracker app for athletes",
    "A language learning progress dashboard",
    "An AI-powered resume analyzer",
    "A platform for booking personal chefs",
    "A tool for analyzing crypto investment portfolios",
    "A local events aggregator with social features",
    "A budgeting and savings tracker for students",
    "A custom clothing order manager for boutiques",
    "An inventory app for farmers’ markets",
    "A minimalist habit tracker with gamification"
]

features = [
    "User authentication",
    "Real-time dashboard",
    "PDF export",
    "Progress analytics",
    "Push notifications",
    "Calendar integration",
    "Role-based access control",
    "Social sharing",
    "Offline support",
    "Admin panel"
]

for i, desc in enumerate(descriptions):
    app_path = os.path.join(OUTPUT_DIR, f"app_{i+1}")
    shutil.copytree(TEMPLATE_DIR, app_path)
    spec = base_spec.format(
        description=desc,
        feature1=random.choice(features),
        feature2=random.choice(features),
        feature3=random.choice(features),
        feature4=random.choice(features)
    )
    with open(os.path.join(app_path, "spec.md"), "w") as f:
        f.write(spec)

print("✅ 10 apps generated in", OUTPUT_DIR)
