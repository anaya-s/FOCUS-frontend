import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useNavigation } from "../utils/navigation";

function ResetPassRequest() {
  const [email, setEmail] = useState("");
  const { toLogin } = useNavigation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/api/user/password-reset/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Email sent")
    } else {
      alert("Something went wrong")
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

export default ResetPassRequest;
