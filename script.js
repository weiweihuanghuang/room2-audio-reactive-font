function changeRootVar(varName, newValue){
  // check if need to remap values to axis range
  switch (document.getElementById("font-text").className) {
    case "Phase":
      // none needed
      break;
    case "Daffy":
      // none needed
      break;
    case "CSTM":
      newValue *= 9.5;
      break;
    case "Minerale":
      newValue *= 10;
      break;
    case "strokeWeight":
      if(varName === "--font-var-one"){ newValue = 20 + newValue*1.6; }
      else { newValue = -12 + newValue/4.16; }
      break;

    default:
      break;
  }
  document.documentElement.style.setProperty(varName, newValue);
}

let isAudioInit = false;
let isAnalysing = false;
let audioContext, source, analyser, bufferLength, audioDataArray, newBandLength, newBandRemainder, bassSlider, midSlider, hiSlider;
let feedbackTexts = [];

// set up audio analyser
function audioInit() {
    // set up context
    let audioEl = document.getElementById("audioSource");
    audioContext = new AudioContext();
    source = audioContext.createMediaElementSource(audioEl);
    analyser = audioContext.createAnalyser();
    // add smoothing
    // you can play with this one - https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant
    // good range is 0.9 - 0.9999
    analyser.smoothingTimeConstant = 0.97;
    // add smoothing
    // you can change this - tldr needs to be power of 2 - higher value is more pitch accurate but less time accurate - https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
    analyser.fftSize = 32;
    bufferLength = analyser.frequencyBinCount;
    // split into 3 for bass mid hi
    newBandLength = Math.floor(bufferLength/6);
    newBandRemainder = bufferLength % 3;
    audioDataArray = new Uint8Array(bufferLength);
    source.connect(audioContext.destination);
    source.connect(analyser);
    // set up feedback text
    for (let i = 0; i < bufferLength; i++){
      let feedbackText = document.createElement('span');
      feedbackText.className = "FeedbackText";
      document.getElementById('axis-sliders-wrapper').appendChild(feedbackText);
      feedbackTexts.push(feedbackText);
    }
    bassSlider = document.getElementById("bass-slider"); bassNum = document.getElementById("bass-num");
    midSlider = document.getElementById("mid-slider"); midNum = document.getElementById("mid-num");
    hiSlider = document.getElementById("hi-slider"); hiNum = document.getElementById("hi-num");
}

function startAnalyser(){
  if(!isAudioInit){
    audioInit();
    isAudioInit = true;
  }
  isAnalysing = true;
  requestAnimationFrame(analyseAudio);
}
function stopAnalyser(){
  isAnalysing = false;
}

function analyseAudio(){
  //analyser.getByteTimeDomainData(audioDataArray);
  // if you uncomment the line above and comment the line below you'll be pulling time instead of pitch data
  analyser.getByteFrequencyData(audioDataArray);
  // this is visualising values through the text
  for (let i = 0; i < bufferLength; i++){
    // we need to divide by 2.56 to normalise to 0 - 100 range
    //feedbackTexts[i].innerHTML = audioDataArray[i]/2.56;
  }
  // this is an example of pulling one of the 16 frequency bands into one of the font variables
  // to change to other variables change "--font-var-one"
  // to change to other frequency band change the number in audioDataArray[15] to something between 0 and 15
  //changeRootVar("--font-var-one", audioDataArray[15]/2.56);
  let bassVol = 0;
  for (let i = 0; i < 5; i++){
    bassVol += audioDataArray[i]/2.56;
  }
  bassVol = dataRangeMod(bassVol/5, 70, 95);
  bassSlider.value = bassNum.value = bassVol;

  let midVol = 0;
  for (let i = 5; i < 8; i++){
    midVol += audioDataArray[i]/2.56;
  }
  midVol = dataRangeMod(midVol/3, 65, 90);
  midSlider.value = midNum.value = midVol;

  let hiVol = 0;
  for (let i = 8; i < 11; i++){
    hiVol += audioDataArray[i]/2.56;
  }
  hiVol = dataRangeMod(hiVol/4, 35, 65);
  hiSlider.value = hiNum.value = hiVol;

  //changeRootVar("--font-var-one", bassVol);
  //changeRootVar("--font-var-one", midVol);
  //changeRootVar("--font-var-one", hiVol);
  // the above lines have no data finessing, to create a usable range I've added and extra function to the volume
  changeRootVar("--font-var-one", bassVol);
  changeRootVar("--font-var-two", midVol);
  changeRootVar("--font-var-three", hiVol);
  if(isAnalysing){ requestAnimationFrame(analyseAudio); }
}

// function dataRangeMod(input, floor, range){
//   return (input - floor) * range;
// }

function dataRangeMod(input, floor, ceiling){
  return (input-floor)/(ceiling-floor)*100
}
