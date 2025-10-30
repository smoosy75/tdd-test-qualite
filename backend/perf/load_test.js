import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 }, // ramp up
    { duration: '3m', target: 20 }, // hold
    { duration: '1m', target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080';

export default function loadTest() {
  const res = http.get(`${BASE_URL}/login`);
  check(res, { '200 OK': (r) => r.status === 200 });
  sleep(0.5);
}
