let images = [];
let selectedIndices = [];
let scalePercent = 0.85; // Slightly reduced for wider format

// Dot grid variables - adjusted for 16:9 aspect ratio
const dotRows = 8;       // Fewer rows for wider format
const dotCols = 12;      // More columns for wider format
const dotSize = 6;

// Color palette (hex values converted to RGB)
const colors = [
  {r: 168, g: 31, b: 35},    // #a81f23
  {r: 239, g: 214, b: 21},   // #efd615
  {r: 232, g: 114, b: 36},   // #e87224
  {r: 39, g: 76, b: 35},     // #274c23
  {r: 28, g: 90, b: 153}     // #1c5a99
];

// Store which dots belong to which area
let areaDots = {
  top: [],
  right: [],
  bottom: [],
  left: []
};

function preload() {
  // Load all 11 images by exact filename
  images[0] = loadImage("Riso-Illustrations-01.jpg");
  images[1] = loadImage("Riso-Illustrations-02.jpg");
  images[2] = loadImage("Riso-Illustrations-03.jpg");
  images[3] = loadImage("Riso-Illustrations-04.jpg");
  images[4] = loadImage("Riso-Illustrations-05.jpg");
  images[5] = loadImage("Riso-Illustrations-06.jpg");
  images[6] = loadImage("Riso-Illustrations-07.jpg");
  images[7] = loadImage("Riso-Illustrations-08.jpg");
  images[8] = loadImage("Riso-Illustrations-09.jpg");
  images[9] = loadImage("Riso-Illustrations-10.jpg");
  images[10] = loadImage("Riso-Illustrations-11.jpg");
}

function setup() {
  createCanvas(900, 506); // 16:9 aspect ratio
  
  // Select 4 random unique images
  selectedIndices = [];
  while (selectedIndices.length < 4) {
    let r = floor(random(11));
    if (!selectedIndices.includes(r)) {
      selectedIndices.push(r);
    }
  }
  
  // Calculate which dots belong to which area
  calculateAreaDots();
  
  // Draw once
  drawImages();
  noLoop();
}

function calculateAreaDots() {
  // Clear previous areas
  for (let area in areaDots) {
    areaDots[area] = [];
  }
  
  // Calculate spacing
  const horizontalSpacing = width / (dotCols - 1);
  const verticalSpacing = height / (dotRows - 1);
  
  // Define area boundaries - adjusted for 16:9
  const topHeight = height * 0.28;    // Slightly reduced for wider format
  const bottomHeight = height * 0.72; 
  const leftWidth = width * 0.28;     
  const rightWidth = width * 0.72;    
  
  // Classify each dot into an area
  for (let row = 0; row < dotRows; row++) {
    for (let col = 0; col < dotCols; col++) {
      const x = col * horizontalSpacing;
      const y = row * verticalSpacing;
      
      // Check which area this dot belongs to
      if (y < topHeight) {
        areaDots.top.push({x: x, y: y, row: row, col: col});
      } else if (x > rightWidth) {
        if (y >= topHeight && y <= bottomHeight) {
          areaDots.right.push({x: x, y: y, row: row, col: col});
        }
      } else if (y > bottomHeight) {
        areaDots.bottom.push({x: x, y: y, row: row, col: col});
      } else if (x < leftWidth) {
        if (y >= topHeight && y <= bottomHeight) {
          areaDots.left.push({x: x, y: y, row: row, col: col});
        }
      }
    }
  }
}

function drawImages() {
  // White background
  background(255);
  
  // Draw dot grid FIRST (behind everything)
  drawDotGrid();
  
  // Set blend mode to MULTIPLY for images
  blendMode(MULTIPLY);
  
  // Define the 4 areas
  const areas = ["top", "right", "bottom", "left"];
  
  // Shuffle the areas to randomize which image goes where
  let shuffledAreas = shuffleArray([...areas]);
  
  // Select 4 unique random colors from the 5 available
  let selectedColors = [];
  let availableColorIndices = [0, 1, 2, 3, 4];
  
  while (selectedColors.length < 4) {
    let r = floor(random(availableColorIndices.length));
    let colorIndex = availableColorIndices[r];
    selectedColors.push(colors[colorIndex]);
    availableColorIndices.splice(r, 1); // Remove used color
  }
  
  // Place each image in its assigned area with its color
  for (let i = 0; i < selectedIndices.length; i++) {
    let img = images[selectedIndices[i]];
    let area = shuffledAreas[i];
    let color = selectedColors[i];
    
    if (img && img.width > 0 && areaDots[area].length > 0) {
      // Create a copy of the image to apply color tint
      let coloredImage = colorizeImage(img, color);
      
      // Calculate scaled dimensions
      let w = img.width * scalePercent;
      let h = img.height * scalePercent;
      
      // Pick a random dot from this area
      let randomDot = random(areaDots[area]);
      
      // Center the image on the dot
      let x = randomDot.x - w/2;
      let y = randomDot.y - h/2;
      
      // Draw colorized image centered on the dot
      image(coloredImage, x, y, w, h);
    }
  }
  
  // Reset blend mode back to normal
  blendMode(BLEND);
}

function colorizeImage(img, color) {
  // Create a graphics buffer for the colorized image
  let colored = createGraphics(img.width, img.height);
  
  // Draw the original image
  colored.image(img, 0, 0);
  
  // Apply color tint by blending with the selected color
  colored.loadPixels();
  img.loadPixels();
  
  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = img.pixels[i];
    let g = img.pixels[i + 1];
    let b = img.pixels[i + 2];
    let a = img.pixels[i + 3];
    
    // Calculate brightness (average of RGB)
    let brightness = (r + g + b) / 3;
    
    // Map black (0) to the selected color, white (255) to white
    // This preserves the grayscale tonal range but replaces black with color
    let factor = brightness / 255;
    
    colored.pixels[i] = color.r * (1 - factor) + 255 * factor;
    colored.pixels[i + 1] = color.g * (1 - factor) + 255 * factor;
    colored.pixels[i + 2] = color.b * (1 - factor) + 255 * factor;
    colored.pixels[i + 3] = a;
  }
  
  colored.updatePixels();
  return colored;
}

function drawDotGrid() {
  fill(255); // White dots
  noStroke();
  
  // Calculate spacing
  const horizontalSpacing = width / (dotCols - 1);
  const verticalSpacing = height / (dotRows - 1);
  
  // Create grid of dots
  for (let row = 0; row < dotRows; row++) {
    for (let col = 0; col < dotCols; col++) {
      const x = col * horizontalSpacing;
      const y = row * verticalSpacing;
      
      // Draw dot
      ellipse(x, y, dotSize, dotSize);
    }
  }
}

// Helper function to shuffle an array
function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Click to get new random images, placements, and colors
function mousePressed() {
  // Select 4 new random indices
  selectedIndices = [];
  while (selectedIndices.length < 4) {
    let r = floor(random(11));
    if (!selectedIndices.includes(r)) {
      selectedIndices.push(r);
    }
  }
  
  drawImages();
}