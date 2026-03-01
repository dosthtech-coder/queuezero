import requests
import time
import json

BASE_URL = "http://localhost:8000/api/v1"

def run_test():
    print("1. Creating Patient...")
    patient_data = {
        "mrn": "MRN-99887766",
        "first_name": "Jane",
        "last_name": "Doe",
        "age": 45,
        "sex": "F",
        "height_cm": 165.0,
        "weight_kg": 68.0,
        "occupation": "Desk Worker",
        "dominant_side": "Right"
    }
    
    response = requests.post(f"{BASE_URL}/patients/", json=patient_data)
    if response.status_code == 400 and "already exists" in response.text:
        print("Patient already exists, continuing...")
        # Get patient id (we know it'll be 1 if it's the first)
        patient_id = 1
    else:
        assert response.status_code == 201, f"Failed to create patient: {response.text}"
        patient_id = response.json().get("id")
    print(f"Patient ID: {patient_id}")

    print("\n2. Starting Session...")
    session_data = {
        "patient_id": patient_id,
        "primary_complaint": "Left shoulder pain when lifting",
        "vas_score": 6,
        "heart_rate_bpm": 78,
        "blood_pressure_sys": 118,
        "blood_pressure_dia": 76,
        "respiratory_rate": 14
    }
    response = requests.post(f"{BASE_URL}/sessions/", json=session_data)
    assert response.status_code == 201, f"Failed to create session: {response.text}"
    session_id = response.json().get("id")
    print(f"Session ID: {session_id}")

    print("\n3. Sending Multi-Stage Telemetry...")
    telemetry_stages = [
        # Neck Rotation Stage
        {"nose": [0.1, 0.8, 0.1], "left_shoulder": [-0.3, 0.5, 0], "right_shoulder": [0.3, 0.5, 0]},
        # Shoulder Abduction Stage (Restricted Left)
        {"left_hip": [0, -0.5, 0], "left_shoulder": [-0.2, 0.5, 0], "left_elbow": [-0.4, 0.8, 0], 
         "right_hip": [0, -0.5, 0], "right_shoulder": [0.2, 0.5, 0], "right_elbow": [0.2, 1.0, 0]},
        # Spine Flexion Stage
        {"left_shoulder": [-0.3, 0.3, 0], "right_shoulder": [0.3, 0.3, 0], "left_hip": [-0.2, -0.5, 0], "right_hip": [0.2, -0.5, 0]},
        # Knee Flexion Stage
        {"left_hip": [-0.2, -0.5, 0], "left_knee": [-0.2, -0.7, 0], "left_ankle": [-0.2, -1.0, 0],
         "right_hip": [0.2, -0.5, 0], "right_knee": [0.2, -0.6, 0], "right_ankle": [0.2, -1.0, 0]}
    ]
    
    for i, frame in enumerate(telemetry_stages):
        resp = requests.post(f"{BASE_URL}/sessions/{session_id}/telemetry", json={"session_id": session_id, "landmarks": frame})
        assert resp.status_code == 202
        print(f"Sent Stage Frame {i+1}")
        time.sleep(0.1)

    print("\n4. Concluding Session...")
    response = requests.post(f"{BASE_URL}/sessions/{session_id}/conclude")
    assert response.status_code == 200, f"Failed to conclude session: {response.text}"
    result = response.json()
    print("Risk Indicators:")
    print(json.dumps(result.get("risk_indicators"), indent=2))
    print("Compensation Notes:", result.get("compensation_notes"))

    print("\n5. Generating Report...")
    response = requests.get(f"{BASE_URL}/sessions/{session_id}/report")
    assert response.status_code == 200, f"Failed to generate report: {response.text}"
    report_data = response.json()
    print(f"Report URL: {report_data.get('report_url')}")
    print(f"Saved to Local Path: {report_data.get('local_path')}")
    
    print("\nIntegration Test Passed Successfully!")

if __name__ == "__main__":
    run_test()
