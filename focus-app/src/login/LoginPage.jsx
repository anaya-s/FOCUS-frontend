import { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import { useNavigation } from "../utils/navigation";
import AuthContext from "../context/AuthContext";

const pageStyle = {
  display: "flex",
  height: "100vh",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  let { loginUser } = useContext(AuthContext);
  const { toReset, toRegister, toOnboarding } = useNavigation();

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await loginUser(email, password);
    console.log(response);
    console.log(response.session_id);
    if (response.session_id === 1) {
      toOnboarding();
    }
  };

  return (
    <Box style={pageStyle}>
      <Container maxWidth="xs">
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome back👋
        </Typography>
        <Typography variant="h6" component="h1">
          Enter your login details
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
            {/*TODO <Button
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
              Sign in with Google
            </Button>
            <Divider>OR</Divider> */}
            <Typography textAlign={"left"} marginLeft={0.5}>
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
            <Typography sx={{ marginBottom: 1 }}>
              <Link
                onClick={toReset}
                size="small"
                style={{ cursor: "pointer" }}
              >
                Forgot your password?
              </Link>
            </Typography>
            <Button
              onClick={handleLogin}
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
              Sign in
            </Button>
          </form>
        </Box>
        <Typography sx={{ marginTop: 1.5 }}>
          <Button
            onClick={toRegister}
            size="large"
            style={{ cursor: "pointer" }}
          >
            Create an account
          </Button>
        </Typography>
      </Container>
    </Box>
  );
}

export default Login;