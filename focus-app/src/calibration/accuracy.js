import Swal from 'sweetalert2';
import webgazer from '../webgazer/webgazer';
/*
 * This function calculates a measurement for how precise 
 * the eye tracker currently is which is displayed to the user
 */
function calculatePrecision(past50Array,div) {
    var windowHeight = window.innerHeight;
  
    // Retrieve the last 50 gaze prediction points
    var x50 = past50Array[0];
    var y50 = past50Array[1];
  
    // Calculate the position of the point the user is staring at
    var staringPointX = div.left + div.width / 2;
    var staringPointY = div.top + div.height / 2;
  
    var precisionPercentages = new Array(50);
    calculatePrecisionPercentages(precisionPercentages, windowHeight, x50, y50, staringPointX, staringPointY);
    var precision = calculateAverage(precisionPercentages);
  
    // Return the precision measurement as a rounded percentage
    return Math.round(precision);
  };
  
  /*
   * Calculate percentage accuracy for each prediction based on distance of
   * the prediction point from the centre point (uses the window height as
   * lower threshold 0%)
   */
  function calculatePrecisionPercentages(precisionPercentages, windowHeight, x50, y50, staringPointX, staringPointY) {
    for (var x = 0; x < 50; x++) {
      // Calculate distance between each prediction and staring point
      var xDiff = staringPointX - x50[x];
      var yDiff = staringPointY - y50[x];
      var distance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
  
      // Calculate precision percentage
      var halfWindowHeight = windowHeight / 2;
      var precision = 0;
      if (distance <= halfWindowHeight && distance > -1) {
        precision = 100 - (distance / halfWindowHeight * 100);
      } else if (distance > halfWindowHeight) {
        precision = 0;
      } else if (distance > -1) {
        precision = 100;
      }
  
      // Store the precision
      precisionPercentages[x] = precision;
    }
  }
  
  /*
   * Calculates the average of all precision percentages calculated
   */
  function calculateAverage(precisionPercentages) {
    var precision = 0;
    for (var x = 0; x < 50; x++) {
      precision += precisionPercentages[x];
    }
    precision = precision / 50;
    return precision;
  }  

  export async function calcAccuracy(div, timerDiv) {
    // Return a Promise that wraps the entire flow
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: #06760D; user-select: none">Calibration Accuracy</span>',
        html: `
        <p style="font-family: Arial, sans-serif; font-size: 18px; color: black; user-select: none">Please proceed to stare at the middle countdown number for the <span style="font-weight: bold">next 5 seconds.</span></p>
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; align-items: center;  user-select: none"">
          <img src="../../public/images/homepage/felix.png" alt="Felix" style="width: 150px; height: auto; margin-top: 50px">
          <div style="margin-left: 20px; text-align: left; color: white; background-color: #30383F; border-radius: 15px; padding: 15px">
            <p>This will allow me to calculate the accuracy of the gaze predictions.</p>
            <p style="margin-top: 20px;">Please keep your eyes focused on the screen during this process.</p>
          </div>
        </div>
      `,
        width: '40vw',
        confirmButtonColor: "#06760D",
        closeOnEsc: false,
        allowOutsideClick: false,
        closeModal: true,
        confirmButtonText: '<span style="user-select: none; padding: 0">Start</span>'
      }).then(() => {
          // Begin storing prediction points
          webgazer.params.storingPoints = true;
  
          // Countdown from 5 to 0 inside setTimeout
          let countdown = 5;
  
          // Function to update the countdown every second
          const updateCountdown = () => {
            if (countdown >= 0) {
              timerDiv.innerHTML = countdown; // Update the timerDiv with the countdown
              countdown--;
              // Call the function again after 1 second
              if (countdown >= 0) setTimeout(updateCountdown, 1000);
            }
          };
  
          // Start the countdown
          updateCountdown();
  
          // Wait for 5 seconds before stopping point collection and measuring accuracy
          setTimeout(() => {
            try {
              webgazer.params.storingPoints = false; // Stop storing the prediction points
              const past50 = webgazer.getStoredPoints(); // Retrieve the stored points
  
              var precisionMeasurement = calculatePrecision(past50, div);
              console.log("Precision measurement:", precisionMeasurement);
  
              // Resolve the Promise with the result
              resolve(precisionMeasurement);
            } catch (error) {
              reject(error); // Reject the Promise if any error occurs
            }
          }, 5000); // Set the timeout for the main logic
        })
        .catch((error) => {
          reject(error); // Handle swal rejection
        });
    });
  }
  