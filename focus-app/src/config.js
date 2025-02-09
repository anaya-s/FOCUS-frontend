const config = {
    apiUrl: (import.meta.env.MODE === "production") ? "focus-backend-production.up.railway.app" : "localhost:8000",
    debug: (import.meta.env.MODE === "production") ? false : true,
};

export default config;
