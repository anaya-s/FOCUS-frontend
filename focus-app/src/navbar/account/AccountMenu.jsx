import { useState, useContext, useEffect } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AnalyticsIcon from '@mui/icons-material/Analytics';
import Settings from "@mui/icons-material/Settings";
import PersonIcon from '@mui/icons-material/Person';
import Logout from "@mui/icons-material/Logout";
import { Typography } from "@mui/material";

import AuthContext from "../../context/AuthContext";
import { useNavigation } from "../../utils/navigation";
import { reauthenticatingFetch } from "../../utils/api";

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = useState(null); 
  const [username, setUsername] = useState("");
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { logoutUser } = useContext(AuthContext);
  const { toDashboard, toProfile, toSettings } = useNavigation();

  useEffect(() => {
    const fetchUsername = async () => {
try {
      const responseMsg = await reauthenticatingFetch("GET", "http://localhost:8000/api/user/profile/");

      if (responseMsg.error) {
        console.error("Failed to fetch profile data:", responseMsg.error);
      } else {
        setUsername(responseMsg.username); // Update state with username
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

    fetchUsername();
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}> 
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {username.charAt(0).toUpperCase() || ""} 
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        sx = {{ zIndex: 1600 }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={toDashboard}>
          <ListItemIcon>
            <AnalyticsIcon fontSize="small" />
          </ListItemIcon>
          Dashboard
        </MenuItem>
        <MenuItem onClick={toProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={toSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={logoutUser}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
