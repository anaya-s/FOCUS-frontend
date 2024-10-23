import React from 'react'
import PageOne from './components/PageOne'
import PageTwo from './components/PageTwo'

const containerStyle = {
  //display: 'flex',

  height: '100vh'
}
const HomePage = () => {
  return (
    <div style={containerStyle}>
      <PageOne />
      <PageTwo />
    </div>
  )
}

export default HomePage