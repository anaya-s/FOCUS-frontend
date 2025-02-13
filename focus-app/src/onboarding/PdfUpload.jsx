import { useEffect } from "react";
import Pdf from "../document_drive/drive";


const containerStyle = {
  //display: 'flex',
  // height: '100vh'
};
const PdfUpload = () => {

  useEffect(() => {
    window.scrollTo({ top: 0 }); // auto-scroll to the top
  }, []);

  return (
    <div style={containerStyle}>
      <Pdf />
    </div>
  );
};

export default PdfUpload;