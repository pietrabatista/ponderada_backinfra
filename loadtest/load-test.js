import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 },   // sobe para 10 usuários em 30s
        { duration: '1m', target: 50 },    // sobe para 50 usuários em 1min
        { duration: '30s', target: 0 },    // desce para 0 em 30s
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% das requests < 500ms
        http_req_failed: ['rate<0.01'],    // menos de 1% de erro
    },
};

export default function () {
    const url = 'http://localhost:3000/telemetry';

    const payload = JSON.stringify({
        device_id: `sensor-${Math.floor(Math.random() * 100)}`,
        timestamp: new Date().toISOString(),
        sensor_type: 'temperature',
        reading_type: 'analog',
        value: parseFloat((Math.random() * 100).toFixed(2)),
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

    check(res, {
        'status é 201': (r) => r.status === 201,
    });

    sleep(1);
}