import numpy as np
from typing import Dict, List, Tuple
from filterpy.kalman import KalmanFilter

class BiomechanicsEngine:
    def __init__(self):
        # Initialize basic 1D Kalman Filter for smoothing angle trajectories
        self.kf = KalmanFilter(dim_x=2, dim_z=1)
        self.kf.x = np.array([[0.], [0.]])       # initial state (angle and angular velocity)
        self.kf.F = np.array([[1., 1.], [0., 1.]]) # state transition matrix
        self.kf.H = np.array([[1., 0.]])         # Measurement function
        self.kf.P *= 1000.                       # covariance matrix
        self.kf.R = 5                            # state uncertainty
        self.kf.Q = np.array([[0.1, 0.1], [0.1, 0.1]]) # process uncertainty

    def calculate_angle_3d(self, a_coords: List[float], b_coords: List[float], c_coords: List[float]) -> float:
        """Calculate the angle (in degrees) between three 3D points: A -> B (vertex) -> C."""
        a = np.array(a_coords[:3])
        b = np.array(b_coords[:3])
        c = np.array(c_coords[:3])

        ba = a - b
        bc = c - b

        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        # Handle floating point inaccuracies
        cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
        angle = np.degrees(np.arccos(cosine_angle))
        return float(angle)

    def smooth_angle(self, raw_angle: float) -> float:
        """Apply Kalman filtering to smooth a raw angle over time."""
        self.kf.predict()
        self.kf.update(raw_angle)
        return float(self.kf.x[0][0])

    def process_telemetry(self, telemetry: Dict[str, List[float]]) -> Dict[str, float]:
        """
        Process a single frame of skeletal telemetry.
        Expects landmarks like: 'left_shoulder', 'left_elbow', 'left_wrist', 'left_hip', etc.
        """
        raw_angles = {}
        
        # 1. Shoulder Abduction (Torso to Arm)
        if all(k in telemetry for k in ['left_hip', 'left_shoulder', 'left_elbow']):
            raw_angles['left_shoulder_abduction'] = self.smooth_angle(self.calculate_angle_3d(
                telemetry['left_hip'], telemetry['left_shoulder'], telemetry['left_elbow']))

        if all(k in telemetry for k in ['right_hip', 'right_shoulder', 'right_elbow']):
            raw_angles['right_shoulder_abduction'] = self.smooth_angle(self.calculate_angle_3d(
                telemetry['right_hip'], telemetry['right_shoulder'], telemetry['right_elbow']))
            
        # 2. Neck Rotation (Nose relative to shoulder midline)
        if all(k in telemetry for k in ['nose', 'left_shoulder', 'right_shoulder']):
            l_sh = np.array(telemetry['left_shoulder'][:3])
            r_sh = np.array(telemetry['right_shoulder'][:3])
            nose = np.array(telemetry['nose'][:3])
            mid_sh = (l_sh + r_sh) / 2.0
            # Vector from shoulder center to nose
            sh_to_nose = nose - mid_sh
            # Vector representing the shoulder line
            sh_line = r_sh - l_sh
            # Calculate angle in the horizontal plane (X-Z)
            angle = np.degrees(np.arctan2(sh_to_nose[0], np.abs(sh_to_nose[2] if len(sh_to_nose)>2 else 1.0)))
            raw_angles['neck_rotation'] = self.smooth_angle(angle)

        # 3. Spine Flexion (Shoulder center to Hip center relative to vertical)
        if all(k in telemetry for k in ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip']):
            mid_sh = (np.array(telemetry['left_shoulder'][:3]) + np.array(telemetry['right_shoulder'][:3])) / 2.0
            mid_hip = (np.array(telemetry['left_hip'][:3]) + np.array(telemetry['right_hip'][:3])) / 2.0
            torso_vec = mid_sh - mid_hip
            vertical = np.array([0, 1, 0])
            angle = np.degrees(np.arccos(np.dot(torso_vec, vertical) / (np.linalg.norm(torso_vec) * np.linalg.norm(vertical))))
            raw_angles['spine_flexion'] = self.smooth_angle(angle)

        # 4. Lower Limb (Hip -> Knee -> Ankle)
        for side in ['left', 'right']:
            hip = f'{side}_hip'
            knee = f'{side}_knee'
            ankle = f'{side}_ankle'
            shoulder = f'{side}_shoulder'
            
            if all(k in telemetry for k in [shoulder, hip, knee]):
                raw_angles[f'{side}_hip_flexion'] = self.smooth_angle(self.calculate_angle_3d(
                    telemetry[shoulder], telemetry[hip], telemetry[knee]))
            
            if all(k in telemetry for k in [hip, knee, ankle]):
                raw_angles[f'{side}_knee_flexion'] = self.smooth_angle(self.calculate_angle_3d(
                    telemetry[hip], telemetry[knee], telemetry[ankle]))

        return raw_angles

    def evaluate_session(self, aggregated_angles: List[Dict[str, float]]) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Takes aggregated angles over time and determines max ROM and compensation notes.
        """
        if not aggregated_angles:
            return [], ["Insufficient data captured."]
            
        rom_results = []
        compensation_notes = []
        
        # Helper to get max for a specific metric
        def get_max(key):
            vals = [frame.get(key, 0) for frame in aggregated_angles if key in frame]
            return max(vals) if vals else 0

        # Define normative ranges and mappings
        metrics = [
            ("Left Shoulder Abduction", "left_shoulder_abduction", (160, 180)),
            ("Right Shoulder Abduction", "right_shoulder_abduction", (160, 180)),
            ("Neck Rotation (Max)", "neck_rotation", (70, 90)),
            ("Spine Flexion", "spine_flexion", (60, 90)),
            ("Left Knee Flexion", "left_knee_flexion", (130, 150)),
            ("Right Knee Flexion", "right_knee_flexion", (130, 150)),
        ]

        for label, key, (norm_min, norm_max) in metrics:
            val = get_max(key)
            flag = "⚠️ Restricted" if val < norm_min else "Normal"
            
            # Calculate symmetry if it's a paired joint
            symmetry = "N/A"
            if "Left" in label:
                other_val = get_max(key.replace("left", "right"))
                if other_val > 0:
                    symmetry = f"{min(100, (val/other_val)*100):.0f}%"
            elif "Right" in label:
                other_val = get_max(key.replace("right", "left"))
                if other_val > 0:
                    symmetry = f"{min(100, (val/other_val)*100):.0f}%"

            rom_results.append({
                "joint": label,
                "patient_rom": f"{val:.1f}°",
                "normative": f"{norm_min}°-{norm_max}°",
                "symmetry": symmetry,
                "flag": flag
            })

        # Logic-based Compensation Discovery
        l_sh = get_max("left_shoulder_abduction")
        r_sh = get_max("right_shoulder_abduction")
        
        if l_sh < 110 or r_sh < 110:
            compensation_notes.append("Probable pain-apprehension detected at end-range shoulder motion.")
            
        if get_max("spine_flexion") > 20 and (l_sh < 140 or r_sh < 140):
            compensation_notes.append("Trunk compensation detected during shoulder abduction protocol.")
            
        if abs(l_sh - r_sh) > 25:
            compensation_notes.append("Clinically significant bilateral shoulder asymmetry (>25°).")

        return rom_results, compensation_notes

biomechanics_engine = BiomechanicsEngine()
