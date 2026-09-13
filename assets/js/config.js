// Runtime config for the landing page.
// Change apiBase per environment:
//   production: https://api.ballershq.com/api
//   local dev:  http://localhost:8080/api
// The waitlist form posts to `${apiBase}/v1/landing/notify`.
window.BALLERS_CONFIG = {
  apiBase: "https://api.ballershq.com/api"
};
