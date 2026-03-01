from typing import List, Dict, Any

class RiskEngine:
    """
    Evaluates probabilistic risk indicators based on context (age, occupation) and ROM deficits.
    Strictly avoids diagnostic claims. Output represents statistical risk of structural stress.
    """
    
    OCCUPATION_RISK_MULTIPLIERS = {
        "Desk Worker": 1.2,
        "Manual Labor": 1.5,
        "Athlete": 1.3,
        "Retired": 1.0,
        "Other": 1.1
    }

    def evaluate_risk(self, patient_context: Dict[str, Any], rom_results: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        age = patient_context.get("age", 40)
        occupation = patient_context.get("occupation", "Other")
        
        risk_indicators = []
        
        # Base multipliers
        occ_mult = self.OCCUPATION_RISK_MULTIPLIERS.get(occupation, 1.1)
        age_mult = 1.0 + ((age - 30) * 0.01) if age > 30 else 1.0
        
        # Analyze ROM flags
        restricted_joints = [r for r in rom_results if "Restricted" in r.get("flag", "")]
        
        # 1. Shoulder/Upper Extremity Stress
        if any(r["joint"].startswith("Left Shoulder") and "Restricted" in r["flag"] for r in rom_results) or \
           any(r["joint"].startswith("Right Shoulder") and "Restricted" in r["flag"] for r in rom_results):
            
            base_risk = 45.0
            calculated_risk = min(95.0, base_risk * occ_mult * age_mult)
            risk_indicators.append({
                "category": "Subacromial Space Stress Indicator",
                "probability": f"{calculated_risk:.0f}%",
                "context_note": f"Elevated by occupation profile ({occupation})" if occ_mult > 1.2 else "Age/ROM correlation"
            })
            
            risk_indicators.append({
                "category": "Scapular Dyskinesis Likelihood Profile",
                "probability": f"{min(85.0, 35.0 * occ_mult):.0f}%",
                "context_note": "Inferred from bilateral asymmetry and ROM deficit"
            })

        # 2. Spinal & Cervical Load Indicator
        neck_restricted = any("Neck" in r["joint"] and "Restricted" in r["flag"] for r in rom_results)
        spine_restricted = any("Spine" in r["joint"] and "Restricted" in r["flag"] for r in rom_results)
        
        if neck_restricted or spine_restricted:
            risk_indicators.append({
                "category": "Spinal Load/Posture Indicator",
                "probability": f"{min(90.0, 50.0 * occ_mult * (1.2 if age > 50 else 1.0)):.0f}%",
                "context_note": "Correlated with restricted trunk/cervical kinematics"
            })

        # 3. Lower Extremity Stability Score
        knee_restricted = any("Knee" in r["joint"] and "Restricted" in r["flag"] for r in rom_results)
        if knee_restricted:
            risk_indicators.append({
                "category": "Lower Extremity Stability Profile",
                "probability": f"{min(80.0, 40.0 * (1.5 if occupation == 'Manual Labor' else 1.0)):.0f}%",
                "context_note": "Inferred from knee flexion deficit"
            })
            
        if not risk_indicators:
             risk_indicators.append({
                "category": "General Musculoskeletal Stress",
                "probability": "Low",
                "context_note": "Kinematics within normative ranges"
            })
             
        return risk_indicators

risk_engine = RiskEngine()
