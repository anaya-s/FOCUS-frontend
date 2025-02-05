import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetch("http://127.0.0.1:8000/api/user/verify-email/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            navigate("/login"); // Redirect to login after verification
          } else {
            console.error("Verification failed:", data.error);
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }, [token, navigate]);

  return <div>Verifying your email...</div>;
};

export default VerifyEmail;
