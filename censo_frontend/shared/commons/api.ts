export const API = {
  url: process.env.DJANGO_API_SERVER ?? "http://localhost:8000/api/",
} as const;
