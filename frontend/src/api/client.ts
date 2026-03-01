import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const PatientAPI = {
    create: async (data: any) => {
        const response = await apiClient.post('/patients/', data);
        return response.data;
    },
};

export const SessionAPI = {
    create: async (patientId: number, complainData: any) => {
        const payload = { patient_id: patientId, ...complainData };
        const response = await apiClient.post('/sessions/', payload);
        return response.data;
    },
    sendTelemetry: async (sessionId: number, landmarks: any) => {
        const response = await apiClient.post(`/sessions/${sessionId}/telemetry`, {
            session_id: sessionId,
            landmarks
        });
        return response.data;
    },
    conclude: async (sessionId: number) => {
        const response = await apiClient.post(`/sessions/${sessionId}/conclude`);
        return response.data;
    },
    getReport: async (sessionId: number) => {
        const response = await apiClient.get(`/sessions/${sessionId}/report`);
        return response.data;
    }
};
