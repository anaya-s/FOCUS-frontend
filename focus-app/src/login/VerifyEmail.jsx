import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import config from '../config'

const pageStyle = {
  display: "flex",
  height: "100vh",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  const token = searchParams.get("token");
  const navigate = useNavigate();

  const baseURL = config.apiUrl;
  useEffect(() => {
    if (token) {
      fetch(`${baseURL}/api/user/verify-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setLoading(false);
            setStatus(1);
          } else {
            setLoading(false);
            setStatus(0);
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }, [token, navigate]);


  return (
    <Box style={pageStyle}>
      {loading && <p>Verifying your email...</p>}

      {status === 1 && (
        <p>Email verified successfully! Start using FOCUS</p>
      )}

      {status === 0 && (
        <p>Verification failed. Your token has expired.</p>
      )}
    </Box>
  );
};

export default VerifyEmail;
