const config = {
    apiUrl: (import.meta.env.MODE === "production") ? "https://focus-backend-production.up.railway.app" : "http://localhost:8000",
    debug: (import.meta.env.MODE === "production") ? false : true,
};

export default config;
