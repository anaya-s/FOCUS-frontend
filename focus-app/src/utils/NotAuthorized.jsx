import { Container, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h1" color="error" fontWeight="bold">
        403
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Oops! Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Session time out, please log in again
      </Typography>
      <Button variant="contained" color="primary" component={Link} to="/">
        Go Back Home
      </Button>
    </Container>
  );
}
