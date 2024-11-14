import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

import { useNavigate } from "react-router-dom";

function ResetPass() {
  const [email, setEmail] = useState("");
  //   const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sent reset link to email");
    console.log("Email:", email);
    // Do something to send reset link to email
  };

  const pageStyle = {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  };

  const navigate = useNavigate();

  const toLogin = () => {
    navigate("/login");
  };

  return (
    <Box style={pageStyle}>
      <Container sx={{width: "650px", minWidth: "500px"}}>
        <Typography variant="h3" component="h1" gutterBottom>
          Change your password
        </Typography>
        <Typography variant="h6" component="h1">
              Please enter your email for a link to reset your password.
        </Typography>
        <Box
          sx={{
            marginTop: 3,
            padding: 3,
            border: "1px solid #ccc",
            borderRadius: 2,
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Typography textAlign={"left"} marginLeft={0.5}>
              Email
            </Typography>
            <TextField
              // label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="dense"
              required
            />
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
            >
              Send reset link
            </Button>
          </form>
        </Box>
        <Typography sx={{ marginTop: 2 }} fontSize="18px">
          Remembered your password?{" "}
          <Link onClick={toLogin} style={{ cursor: "pointer" }}>
            Log in
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default ResetPass;