import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import { useNavigation } from "../utils/navigation";

const pageStyle = {
  display: "flex",
  height: "100vh",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

function Register() {
  // const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { toLogin } = useNavigation();
  const { toOnboarding } = useNavigation();

  const handleCreateUser = async (e) => {
      e.preventDefault();

      let response = await fetch("http://127.0.0.1:8000/api/user/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
          email: email
        })
      });
  
      if (response.status === 201) {
        alert("Account successfully created!");
        toLogin();
      } else {
        alert("Unsuccessful transaction");
      }
  };

  return (
    <Box style={pageStyle}>
      <Container maxWidth="xs">
        <Typography variant="h4" component="h1" gutterBottom>
          Experience the future of productivity
        </Typography>
        <Typography variant="h6" component="h1">
          Create your new account
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
          <form>
            <Button
              //onClick={} // Link with Google OAuth
              fullWidth
              variant="contained"
              color="black"
              sx={{
                marginBottom: 2,
                backgroundColor: "white",
                "&:hover": { backgroundColor: "lightgray" },
              }}
            >
              <img src="./logo/google_logo.svg" style={{ marginRight: 10 }} />
              Sign up with Google
            </Button>
            <Divider>OR</Divider>
            {/* <Typography textAlign={"left"} marginLeft={0.5}>
              Name
            </Typography>
            <TextField
              // label="Name"
              type="name"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="dense"
              required
            /> */}
            <Typography textAlign={"left"} marginLeft={0.5} marginTop={1}>
              Email
            </Typography>
            <TextField
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="dense"
              required
            />
            <Typography textAlign={"left"} marginLeft={0.5} marginTop={1}>
              Password
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
            <Button
              type="submit"
              onClick={() => {
                handleCreateUser(); // Call the existing function
                toOnboarding();     // Redirect to onboarding page
              }}
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                marginTop: 2,
                marginBottom: 2,
                backgroundColor: "green",
                "&:hover": { backgroundColor: "darkgreen" },
              }}
            >
              Sign up
            </Button>
            <Typography>
              By signing up, you agree to our{" "}
              <Link style={{ cursor: "pointer" }}>T&Cs</Link>
            </Typography>
          </form>
        </Box>
        <Typography sx={{ marginTop: 2 }} fontSize="18px">
          Already have an account?{" "}
          <Link onClick={toLogin} style={{ cursor: "pointer" }}>
            Log in
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default Register;
