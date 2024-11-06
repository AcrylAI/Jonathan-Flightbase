export const HOME_URL =
  process.env.NEXT_PUBLIC_APP_MODE === 'dev'
    ? 'http://localhost:3001/'
    : 'https://portal.acryl.ai/';
export const AUTH_STRING = 'authenticated';

// API DEFINES
export const CONTENT_TYPE_JSON = { 'Content-Type': 'application/json' };
export const API_GET = 'get';
export const API_POST = 'post';
export const API_PUT = 'put';
export const API_DELETE = 'delete';
