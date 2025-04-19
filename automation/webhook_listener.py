from flask import Flask, request
import subprocess
import os

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def trigger_build():
    data = request.get_json()
    project_name = data.get("project_name", "app")
    print(f"🚀 Trigger received for: {project_name}")

    # Clone or use existing generator
    os.system("python3 generate_apps.py")
    return {"status": "success", "message": f"Build initiated for {project_name}"}, 200

if __name__ == '__main__':
    app.run(port=5001)
