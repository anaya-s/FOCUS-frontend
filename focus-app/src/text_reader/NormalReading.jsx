import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf'; // For rendering PDF files
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Box } from '@mui/material';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function NormalReading({ file, textSettings }) {
  const [backgroundColour, backgroundBrightness, pdfScale, pdfCurrentPage, pdfTotalPages, pdfSetPage] = textSettings.current;

  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const pageRefs = useRef([]);
  const boxRef = useRef(null);
  const previousPageNumber = useRef(1); // Track the previous valid page number

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    pdfTotalPages.current = numPages;
    pdfCurrentPage.current = 1;
  };

  // Intersection Observer to track the visible page
  useEffect(() => {
    const threshold = pdfScale.current >= 1.3 ? 0.4 : 0.7; // Adjust threshold based on pdfScale
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const visiblePageNumber = Number(entry.target.dataset.pageNumber);
            setPageNumber(visiblePageNumber);
            previousPageNumber.current = visiblePageNumber; // Update the previous valid page number
            pdfCurrentPage.current = visiblePageNumber;
          }
        });
      },
      {
        root: boxRef.current,
        rootMargin: '0px',
        threshold: threshold,
      }
    );

    // Reverse the order of pageRefs before observing
    const reversedPageRefs = [...pageRefs.current].reverse();
    reversedPageRefs.forEach(pageRef => {
      if (pageRef) observer.observe(pageRef);
    });

    return () => {
      reversedPageRefs.forEach(pageRef => {
        if (pageRef) observer.unobserve(pageRef);
      });
    };
  }, [pdfScale.current, numPages]);

  useEffect(() => {
    if(pdfSetPage.current) {
      pdfSetPage.current = false;
      const page = Number(pdfCurrentPage.current);
      if (page >= 1 && page <= numPages) {
        previousPageNumber.current = page; // Update the previous valid page number
        const pageElement = pageRefs.current[page - 1];
        const boxElement = boxRef.current;

        if (pageElement && boxElement) {
          const boxRect = boxElement.getBoundingClientRect();
          const pageRect = pageElement.getBoundingClientRect();
          const offset = pageRect.top - boxRect.top;
          boxElement.scrollTo({
            top: boxElement.scrollTop + offset
          });
        }

        setPageNumber(page);
      } 
      else
      {
        setPageNumber(previousPageNumber.current); // Reset to the previous valid page number
        pdfCurrentPage.current = previousPageNumber.current;
      }
    }
  }, [pdfSetPage.current, pdfCurrentPage.current]);

  return (
    <Box>
      <Box sx={{
        width: "92vw",
        height: "85vh",
        minWidth: "92vw",
        minHeight: "85vh",
        overflowY: "scroll",
        border: "1px solid #ccc",
        display: "flex",
        justifyContent: "center",
        backgroundColor: `rgba(${backgroundColour.current[0]}, ${backgroundColour.current[1]}, ${backgroundColour.current[2]}, ${backgroundBrightness.current})`,
      }} ref={boxRef}>
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} loading={""}>
          {Array.from(new Array(numPages), (el, index) => (
            <Box
              key={`page_${index + 1}`}
              sx={{ border: "1px solid black", margin: "1vh", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)"}}
              data-page-number={index + 1}
              ref={el => pageRefs.current[index] = el}
            >
              <Page pageNumber={index + 1} scale={pdfScale.current} loading={""} />
            </Box>
          ))}
        </Document>
      </Box>
    </Box>
  );
}

export default NormalReading;