import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users over 1 minute
    { duration: '2m', target: 600 },  // Stay at 50 users for 2 minutes
    { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minute
    { duration: '2m', target: 400 }, // Stay at 100 users for 2 minutes
    { duration: '1m', target: 200 }, // Ramp up to 200 users over 1 minute
    { duration: '3m', target: 550 }, // Stay at 200 users for 3 minutes (high load)
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
};

export default function () {
  const result = http.get('http://34.32.55.219/');
  check(result, {
    'http response status code is 200': result.status === 200,
  });
}