import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useSearchParams } from "react-router-dom";
import config from '../config'

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const uidb64 = searchParams.get("uidb64");
  const baseURL = config.apiUrl;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/user/password-reset-confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uidb64, token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Password reset successfully!");
        setError(null);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error, please try again later.");
    }
  };

  const pageStyle = {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  };

  return (
    <Box style={pageStyle}>
      <Container sx={{ width: "650px", minWidth: "500px" }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Reset Your Password
        </Typography>
        <Typography variant="h6" component="h1">
          Enter your new password below.
        </Typography>
        <Box
          sx={{
            marginTop: 3,
            padding: 3,
            border: "1px solid #ccc",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Typography textAlign="left" marginLeft={0.5}>
              New Password
            </Typography>
            <TextField
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="dense"
              required
            />
            <Typography textAlign="left" marginLeft={0.5}>
              Confirm Password
            </Typography>
            <TextField
              type="password"
              fullWidth
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="dense"
              required
            />
            {error && <Typography color="error">{error}</Typography>}
            {success && <Typography color="green">{success}</Typography>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                marginTop: 2,
                backgroundColor: "green",
                "&:hover": { backgroundColor: "darkgreen" },
              }}
              disabled={!password||!confirmPassword||password!==confirmPassword}
            >
              Reset Password
            </Button>
          </form>
        </Box>
      </Container>
    </Box>
  );
}

export default ResetPassword;
