import * as pdfjsLib from "pdfjs-dist/webpack"; // For parsing .pdf files
import mammoth from "mammoth"; // For parsing .docx files

export async function parseText(file) {
  
    var parsedText = [];
    if (file) {
      if (file.type === "application/pdf") {
        // Check for .pdf file type
        parsedText = await handlePdfFile(file);
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Check for .docx file type
        parsedText = await handleDocxFile(file);
      } else if (file.type === "text/plain") {
        // Check for .txt file type
        parsedText = await handleTxtFile(file);
      } else {
        alert("Please upload a valid PDF, DOCX, or TXT file.");
      }
    }

    return parsedText;
};

  /* Function which parses the text within PDF files */
export async function handlePdfFile(file) {
    const reader = new FileReader();
  
    // Initialize extractedTextArray as an empty array
    const extractedTextArray = [];
  
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
  
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i); // get current page
            const textContent = await page.getTextContent(); // get all text content
  
            let currentLineArray = []; // stores list of words
            let lastY = null; // y-coordinate of current line, if it changes from this, it indicates that new line is being parsed
  
            /* Parse each item in the text contents of the PDF */
            textContent.items.forEach((item) => {
              /* Reset for every new line */
              if (lastY !== null && item.transform[5] !== lastY) {
                extractedTextArray.push(currentLineArray);
                currentLineArray = [];
              }
  
              /* Split each line into separate words and add it to the line array */
              const words = item.str.trim().split(/\s+/);
              words.forEach((word) => {
                if (word) currentLineArray.push(word);
              });
  
              lastY = item.transform[5]; // store y-coordinate of current line
            });
  
            /* Add the last line */
            if (currentLineArray.length > 0) extractedTextArray.push(currentLineArray);
          }
  
          // Resolve the promise with the extracted text array
          resolve(extractedTextArray);
        } catch (error) {
          // Reject the promise if an error occurs
          reject(error);
        }
      };
  
      reader.onerror = (error) => {
        // Reject the promise if an error occurs while reading the file
        reject(error);
      };
  
      reader.readAsArrayBuffer(file);
    });
  }

  /* Function which parses the text within DOCX files */
export const handleDocxFile = async (file) => {
const reader = new FileReader();

// Initialize extractedTextArray as an empty array
const extractedTextArray = [];

return new Promise((resolve, reject) => {
    reader.onload = async (event) => {
    try {
        const arrayBuffer = event.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });

        result.value.split("\n").forEach((line) => {
        const trimmedLine = line.trim(); // Removes any whitespaces and newlines in current line

        /* Ignore lines that are empty or contain only whitespace */
        if (trimmedLine) {
            const words = trimmedLine.split(/\s+/);
            extractedTextArray.push(words);
        }
        });

        // Resolve the promise with the extracted text array
        resolve(extractedTextArray);
    } catch (error) {
        // Reject the promise if an error occurs
        reject(error);
    }
    };

    reader.onerror = (error) => {
    // Reject the promise if an error occurs while reading the file
    reject(error);
    };

    reader.readAsArrayBuffer(file);
});
};

  /* Function which parses the text within TXT files */
export const handleTxtFile = async (file) => {
const reader = new FileReader();

// Initialize extractedTextArray as an empty array
const extractedTextArray = [];

return new Promise((resolve, reject) => {
    reader.onload = (event) => {
    try {
        const result = event.target.result;
        const extractedTextArray = result
        .split("\n") // Split text into lines
        .map((line) => 
            line.trim().split(/\s+/).filter(Boolean) // Split lines into words and filter out empty strings
        );

        // Resolve the promise with the extracted text array
        resolve(extractedTextArray);
    } catch (error) {
        // Reject the promise if an error occurs
        reject(error);
    }
    };

    reader.onerror = (error) => {
    // Reject the promise if an error occurs while reading the file
    reject(error);
    };

    reader.readAsText(file); // Read the file as text
});
};