import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { target: 200, duration: '1m' },       // Ramp up to a baseline of 200 users
    { target: 500, duration: '2m' },       // Increase to a moderate load
    { target: 1000, duration: '30s' },     // Sudden spike to 1000 users
    { target: 300, duration: '1m' },       // Drop sharply to a low load
    { target: 700, duration: '2m' },       // Spike back up to high load
    { target: 0, duration: '30s' },        // Ramp down to 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],        // Allow up to 5% failure rate
    http_req_duration: ['p(95)<500'],      // 95% of requests should be below 500ms
  },
};

function randomPause() {
  const pauseTime = Math.random() * 5;    // Random pause up to 5 seconds
  sleep(pauseTime);
}

export default function () {
  const url = 'http://34.32.56.128/';    // Target Istio endpoint or external route

  // Send a GET request to the URL and check the response
  const result = http.get(url);
  check(result, {
    'http response status code is 200': result.status === 200,
  });

  // Introduce a random pause after each request
  randomPause();
}
