import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import AnalyticsIcon from '@mui/icons-material/Analytics';
import Settings from "@mui/icons-material/Settings";
import PersonIcon from '@mui/icons-material/Person';

import DashboardOverall from "./dashboard/DashboardOverall";
import UserProfile from "./settings/UserProfile";
import UserSettings from "./settings/UserSettings";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div>
         {children}
        </div>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function UserAccount() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        flexgrow: 1,
        marginTop: "10vh",
        display: "flex",
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        orientation="vertical"
        sx={{ borderRight: 1, borderColor: "divider" }}
      >
        <Tab
          icon={<AnalyticsIcon />}
          iconPosition="start"
          label="Dashboard"
          {...a11yProps(0)}
        />
        <Tab
          icon={<PersonIcon />}
          iconPosition="start"
          label="Profile"
          {...a11yProps(1)}
        />
        <Tab
          icon={<Settings />}
          iconPosition="start"
          label="Settings"
          {...a11yProps(2)}
        />
      </Tabs>

      <TabPanel value={value} index={0}>
        <DashboardOverall />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <UserProfile />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <UserSettings />
      </TabPanel>
    </Box>
  );
}
