import "./Project.css"
import React, { useState } from "react";
import MagicDropZone from "react-magic-dropzone"
import { toast } from "react-toastify";
//import { useNavigate } from "react-router-dom";
//import Cookies from "universal-cookie";
import image from "../../images/low-poly-grid.svg"

//from https://github.com/zygisS22/color-palette-extraction/blob/master/index.js  
//  Convert each pixel value ( number ) to hexadecimal ( string ) with base 16
const rgbToHex = (pixel) => {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  return ("#" + componentToHex(pixel.r) + componentToHex(pixel.g) + componentToHex(pixel.b)).toUpperCase();
};

//from https://www.geeksforgeeks.org/program-change-rgb-color-model-hsv-color-model/
//returns hue value from an rgb value
function rgb_to_h(r , g , b) {
 
  // R, G, B values are divided by 255
  // to change the range from 0..255 to 0..1
  r = r / 255.0;
  g = g / 255.0;
  b = b / 255.0;

  // h, s, v = hue, saturation, value
  var cmax = Math.max(r, Math.max(g, b)); // maximum of r, g, b
  var cmin = Math.min(r, Math.min(g, b)); // minimum of r, g, b
  var diff = cmax - cmin; // diff of cmax and cmin.
  var h = -1, s = -1;

  // if cmax and cmax are equal then h = 0
  if (cmax == cmin)
      h = 0;

  // if cmax equal r then compute h
  else if (cmax == r)
      h = (60 * ((g - b) / diff) + 360) % 360;

  // if cmax equal g then compute h
  else if (cmax == g)
      h = (60 * ((b - r) / diff) + 120) % 360;

  // if cmax equal b then compute h
  else if (cmax == b)
      h = (60 * ((r - g) / diff) + 240) % 360;

   // if cmax equal zero
   if (cmax == 0)
    s = 0;
  else
     s = (diff / cmax) * 100;

  const hs = {
    hue: h,
    sat: s,
  };
 
   return hs;
}


//from https://dev.to/alvaromontoro/building-your-own-color-contrast-checker-4j7o
//return luminance of an rgb value
function luminance(r, g, b) {
  var a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928
          ? v / 12.92
          : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

//from https://github.com/zygisS22/color-palette-extraction/blob/master/index.js  
//build an array of rgb objects, and return iy
const buildRgb = (imageData) => {
  const rgbValues = [];
  // note that we are loopin every 4!
  // for every Red, Green, Blue and Alpha
  for (let i = 0; i < imageData.length; i += 4) {
    const rgb = {r: imageData[i], g: imageData[i + 1], b: imageData[i + 2],};

    rgbValues.push(rgb);
  }

  return rgbValues;
};

//from https://dev.to/alvaromontoro/building-your-own-color-contrast-checker-4j7o
// returns what color channel has the biggest difference
const findBiggestColorRange = (rgbValues) => {
  /**
   * Min is initialized to the maximum value posible
   * from there we procced to find the minimum value for that color channel
   *
   * Max is initialized to the minimum value posible
   * from there we procced to fin the maximum value for that color channel
   */
  let rMin = Number.MAX_VALUE;
  let gMin = Number.MAX_VALUE;
  let bMin = Number.MAX_VALUE;

  let rMax = Number.MIN_VALUE;
  let gMax = Number.MIN_VALUE;
  let bMax = Number.MIN_VALUE;

  rgbValues.forEach((pixel) => {
    rMin = Math.min(rMin, pixel.r);
    gMin = Math.min(gMin, pixel.g);
    bMin = Math.min(bMin, pixel.b);

    rMax = Math.max(rMax, pixel.r);
    gMax = Math.max(gMax, pixel.g);
    bMax = Math.max(bMax, pixel.b);
  });

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  // determine which color has the biggest difference
  const biggestRange = Math.max(rRange, gRange, bRange);
  if (biggestRange === rRange) {
    return "r";
  } else if (biggestRange === gRange) {
    return "g";
  } else {
    return "b";
  }
};

//from https://github.com/zygisS22/color-palette-extraction/blob/master/index.js  
//quantize with median cut
const quantization = (rgbValues, depth) => {
  const MAX_DEPTH = 4;

  // Base case
  if (depth === MAX_DEPTH || rgbValues.length === 0) {
    const color = rgbValues.reduce(
      (prev, curr) => {
        prev.r += curr.r;
        prev.g += curr.g;
        prev.b += curr.b;

        return prev;
      },
      {
        r: 0,
        g: 0,
        b: 0,
      }
    );

    color.r = Math.round(color.r / rgbValues.length);
    color.g = Math.round(color.g / rgbValues.length);
    color.b = Math.round(color.b / rgbValues.length);

    return [color];
  }

  /**
   *  Recursively do the following:
   *  1. Find the pixel channel (red,green or blue) with biggest difference/range
   *  2. Order by this channel
   *  3. Divide in half the rgb colors list
   *  4. Repeat process again, until desired depth or base case
   */
  const componentToSortBy = findBiggestColorRange(rgbValues);
  rgbValues.sort((p1, p2) => {
    return p1[componentToSortBy] - p2[componentToSortBy];
  });

  const mid = rgbValues.length / 2;
  return [
    ...quantization(rgbValues.slice(0, mid), depth + 1),
    ...quantization(rgbValues.slice(mid + 1), depth + 1),
  ];
};

//from https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
//sorts array of objects by key
//modified to go in descending order
function sortByKey(array, key) {
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? 1 : ((x > y) ? -1 : 0));
  });
}

//test contrast of image
const contrastTest = (rgbTestValues) =>{
  //stores rgb pairs and their contrast
  let ratios = [];
  let skip = false;
  
  //get the luminance of every value pair
  for (let i = 0; i < rgbTestValues.length; i++){
    const lumOne = luminance(rgbTestValues[i].r,rgbTestValues[i].g, rgbTestValues[i].b);

    for(let j = i + 1; j < rgbTestValues.length; j++){
      //if values are the same, skip this iteration of loop
      if (rgbTestValues[i].r == rgbTestValues[j].r && rgbTestValues[i].g == rgbTestValues[j].g && rgbTestValues[i].b == rgbTestValues[j].b){
        continue;
      }

      //check if pair has all ready been added
      for (let k = 0; k < ratios.length; k++){
        if (ratios[k].colour1.r == rgbTestValues[i].r && ratios[k].colour1.g == rgbTestValues[i].g && ratios[k].colour1.b == rgbTestValues[i].b &&
          ratios[k].colour2.r == rgbTestValues[j].r && ratios[k].colour2.g == rgbTestValues[j].g && ratios[k].colour2.b == rgbTestValues[j].b
          || 
          ratios[k].colour1.r == rgbTestValues[j].r && ratios[k].colour1.g == rgbTestValues[j].g && ratios[k].colour1.b == rgbTestValues[j].b &&
          ratios[k].colour2.r == rgbTestValues[i].r && ratios[k].colour2.g == rgbTestValues[i].g && ratios[k].colour2.b == rgbTestValues[i].b) {
            skip = true;
          }
        }

     //if it has been, skip adding again
     //if not, add it
     if (!skip){

      const lumTwo = luminance(rgbTestValues[j].r,rgbTestValues[j].g, rgbTestValues[j].b);

      //use luminance to calculate contrast
    const ratio = lumOne > lumTwo 
    ? ((lumTwo  + 0.05) / (lumOne + 0.05))
    : ((lumOne + 0.05) / (lumTwo  + 0.05));

    //add pair
      const ratioAndColours = {
        colour1: rgbTestValues[i],
        colour2: rgbTestValues[j],
        contrastRatio: ratio,
      };
      
      ratios.push(ratioAndColours);
      }

      //set skip back
      skip = false;
    }
  }

  //ratios =  ratios.sort(function(a,b){
  //  return a.contrastRatio - b.contrastRatio;
  //})

  ratios = sortByKey(ratios, 'contrastRatio');

  //display all value pairs and their contrast
 printContrasts(ratios);
}

//give colour a name based on its position on the hue wheel
const getColourRange = (hue) =>{

  if(hue.sat < 15){
    return 'NA';
  }
  
  //ranges might need adjusted
  if(hue.hue > 349 || hue.hue < 11 ){
    return 'red';
  }
  else if(hue.hue < 170 && hue.hue > 80){
    return 'green';
  }
  else if (hue.hue > 40 && hue.hue < 81){
    return 'yellow';
  }
  else {
    return 'NA';
  }
}

//make new elements for each contrast ratio and hex colour
//add them to the web page
const printContrasts = (ratios) =>{
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";
  
  //number of contrast ratios and rgb pairs to print
  //equal to ratios.length for full array
  //may be made into parametre
  const numRatiosToPrint = ratios.length;

  for (let i = 0; i < numRatiosToPrint; i += 1){

    let hue1 = rgb_to_h(ratios[i].colour1.r, ratios[i].colour1.g, ratios[i].colour1.b);
    let hue2 = rgb_to_h(ratios[i].colour2.r, ratios[i].colour2.g, ratios[i].colour2.b);

    let range1 = getColourRange(hue1);
    let range2 = getColourRange(hue2);

    if((range1 == 'red' || range1 == 'green' || range1 == 'yellow') && (range2 == 'red' || range2 == 'green' || range2 == 'yellow')){
    const contrastElement = document.createElement("div");
    const colour1Element = document.createElement("div");
    const colour2Element = document.createElement("div");
    const WCAGElementAAL = document.createElement("div");
    const WCAGElementAAS = document.createElement("div");
    const WCAGElementAAAL = document.createElement("div");
    const WCAGElementAAAS = document.createElement("div");
    contrastElement.appendChild(document.createTextNode(ratios[i].contrastRatio.toFixed(5)));

    //get results of WCAG tests
               const resultWCAGAAL = `
                AA-level large text: ${ratios[i].contrastRatio < 1/3 ? 'PASS' : 'FAIL' } `;
               const resultWCAGAAS = `
                AA-level small text: ${ratios[i].contrastRatio < 1/4.5 ? 'PASS' : 'FAIL' } `;
               const resultWCAGAAAL = `
               AAA-level large text: ${ratios[i].contrastRatio < 1/4.5 ? 'PASS' : 'FAIL' }  `;
               const resultWCAGAAAS = `
                 AAA-level small text: ${ratios[i].contrastRatio < 1/7 ? 'PASS' : 'FAIL' }`;


    WCAGElementAAL.appendChild(document.createTextNode(resultWCAGAAL));
    WCAGElementAAS.appendChild(document.createTextNode(resultWCAGAAS));
    WCAGElementAAAL.appendChild(document.createTextNode(resultWCAGAAAL));
    WCAGElementAAAS.appendChild(document.createTextNode(resultWCAGAAAS));

    const hex1 = rgbToHex(ratios[i].colour1);
    const hex2= rgbToHex(ratios[i].colour2);
    colour1Element.style.backgroundColor = hex1;
    colour2Element.style.backgroundColor = hex2;
    colour1Element.appendChild(document.createTextNode(hex1));
    colour2Element.appendChild(document.createTextNode(hex2));

    resultsContainer.appendChild(contrastElement);
    resultsContainer.appendChild(WCAGElementAAL);
    resultsContainer.appendChild(WCAGElementAAS);
    resultsContainer.appendChild(WCAGElementAAAL);
    resultsContainer.appendChild(WCAGElementAAAS);
    resultsContainer.appendChild(colour1Element);
    resultsContainer.appendChild(colour2Element);
    }
  }
}

const getDataFromImage = () => {
  const imgFile = document.getElementById("imgfile");
  const image = new Image();
  const file = imgFile.files[0];
  const fileReader = new FileReader();

  // Whenever file & image is loaded procced to extract the information from the image
  fileReader.onload = () => {
    image.onload = () => {
      // Set the canvas size to be the same as of the uploaded image
      const canvas = document.getElementById("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      /**
       * getImageData returns an array full of RGBA values
       * each pixel consists of four values: the red value of the colour, the green, the blue and the alpha
       * (transparency). For array value consistency reasons,
       * the alpha is not from 0 to 1 like it is in the RGBA of CSS, but from 0 to 255.
       */
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Convert the image data to RGB values so its much simpler
      const rgbArray = buildRgb(imageData.data);

      /**
       * Color quantization
       * A process that reduces the number of colors used in an image
       * while trying to visually maintin the original image as much as possible
       */
      const quantColors = quantization(rgbArray, 0);
      contrastTest(quantColors);
    };
    image.src = fileReader.result;
  };
  fileReader.readAsDataURL(file);
}


const Project = () => {
  /*React.useEffect(() => {


    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);*/
  // drag drop file component
  // drag state

  return (
    <div>
    <img src={image} alt="poly-grid" id="background"/>
      <div className="UploadUIContainer">
        <div className="PosterDragAndDrop">
          <h2 className="SectionHeading">Color Contrast Tester</h2>
            <label class="file" >
              <input type="file" id="imgfile" onChange={getDataFromImage}/>
              Click to Upload an Image
            </label>
            <canvas id="canvas">
              Your browser does not support the HTML canvas tag.
            </canvas>
        </div>
        <div className="Results">
          <h2 className="SectionHeading">Results</h2>
          <div style={{ width: "95%" }}>
          </div>
          <div id="results"></div>
        </div>
      </div>
      <form action="#">
      </form>

    </div>
  );
}

export default Project;


// <img src={image} alt="down for temporary maintenance"/>


/* <div className="GuestUIContainer">
        <div className="PosterDragAndDrop">
          <h2 className="SectionHeading">Upload a Poster</h2>
          <MagicDropZone
            className="DragAndDropArea"
            accept=".jpg, .png, .jpeg"
            onDrop={fileDrop}
          >
            {filePreview === null ? (
              "Drop your poster here"
            ) : (
              <img className="PosterImg" src={filePreview} alt="User Upload" />
            )}
          </MagicDropZone>
        </div>
        <div className="PosterRatingContainer">
          <h2 className="SectionHeading">Accessibility Score</h2>
          <div style={{ width: "95%" }}>
            <BarGraph chartData={BarGraphData.build} />
            <p className="TimeToCalculate">
              {calculating
                ? `Calculating score...`
                : `Calculated in ${totalCalculationTime} seconds`}
            </p>
          </div>
        </div>
      </div>
      <ToastContainer autoClose={1000} limit={3} />*/

