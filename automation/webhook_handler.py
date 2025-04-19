from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def trigger_build():
    data = request.get_json()
    app_name = data.get("app_name")
    spec_content = data.get("spec_md")

    if not app_name or not spec_content:
        return jsonify({"error": "Missing app_name or spec_md"}), 400

    app_dir = f"./generated_apps/{app_name}"
    os.makedirs(app_dir, exist_ok=True)

    with open(f"{app_dir}/spec.md", "w") as f:
        f.write(spec_content)

    subprocess.call(["python3", "generate_apps.py"])
    return jsonify({"status": f"Build triggered for {app_name}"}), 200

if __name__ == "__main__":
    app.run(port=5001)
