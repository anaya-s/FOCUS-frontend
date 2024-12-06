import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import { BiBarChartAlt } from "react-icons/bi";
import { BiCog } from "react-icons/bi";
import { BiUser } from "react-icons/bi";

import DashboardOverall from "./dashboard/DashboardOverall";

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
          icon={<BiBarChartAlt />}
          iconPosition="start"
          label="Dashboard"
          {...a11yProps(0)}
        />
        <Tab
          icon={<BiUser />}
          iconPosition="start"
          label="Profile"
          {...a11yProps(1)}
        />
        <Tab
          icon={<BiCog />}
          iconPosition="start"
          label="Settings"
          {...a11yProps(2)}
        />
      </Tabs>

      <TabPanel value={value} index={0}>
        <DashboardOverall />
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
    </Box>
  );
}
