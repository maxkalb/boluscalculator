/// Global variable to identify already passed initialization
var initialized = false;

// Array holding the therapy settings
var settings = [];

// Array holding local storage variable names
var localNames = [];

// Holds the active therapy setting
var selectedTherapy = 0;

// Some simplyfing getter methods
function getTherapyAim(therapyId) {
  return settings[therapyId].aim;
}
function getTherapyCorrection(therapyId) {
  return settings[therapyId].corr;
}
function getTherapyBolus(therapyId) {
  return settings[therapyId].bolus;
}

/*
* Initializes the local storage variable names used for therapies.
*/
function initLocalNames() {
	var therapyId;
  for	(therapyId = 0; therapyId < settings.length; therapyId++) {
    var name1 = "aim" + therapyId;
  	var name2 = "corr" + therapyId;
  	var name3 = "bolus" + therapyId;
    localNames[therapyId] = {aim:name1, corr:name2, bolus:name3};
  }
}

/*
* Set default therapy settings and initialize local variable names.
*/
function initDefaultSettings() {
  settings[0] = {aim:100, corr:50, bolus:1.0};
	settings[1] = {aim:100, corr:50, bolus:1.0};
	settings[2] = {aim:120, corr:50, bolus:1.0};
	settings[3] = {aim:120, corr:50, bolus:1.0};
  initLocalNames(); 
}

/*
* Gets called if the page gets loaded (used as initialization).
*/
window.onload = function () {
  initDefaultSettings();
  initLocalSettings();
  autoTherapySetting();
  updateTime();
  initialized = true;
}

/*
* Toggles (show/hide) the settings. 
*/
function toggleSettings() {
	var e = document.getElementById('settings');
  if ( e.style.display == 'block' ){
    e.style.display = 'none';
  }
  else {
    e.style.display = 'block';
    window.scrollTo(0, document.body.scrollHeight);
  }
  return false;
}

/*
* Overwrites the therapy setting with local storage values (if exist).
*/
function loadTherapySettings(therapyId) {
  var stringAimName = localNames[therapyId].aim;
  var stringCorrName = localNames[therapyId].corr;
  var stringBolusName = localNames[therapyId].bolus;
  
  if( localStorage.getItem(stringAimName) != null )
    settings[therapyId].aim = localStorage.getItem(stringAimName);
  if( localStorage.getItem(stringCorrName) != null )
    settings[therapyId].corr = localStorage.getItem(stringCorrName);
  if( localStorage.getItem(stringBolusName) != null )
    settings[therapyId].bolus = localStorage.getItem(stringBolusName);
}

/*
* Writes the therapy settings of the given id into local storage. 
*/
function saveTherapySettings(therapyId){
  localStorage.setItem(localNames[therapyId].aim, getTherapyAim(therapyId));
  localStorage.setItem(localNames[therapyId].corr, getTherapyCorrection(therapyId));
  localStorage.setItem(localNames[therapyId].bolus, getTherapyBolus(therapyId));
}

/*
* Initializes the settings array with local stored values. 
*/
function initLocalSettings() {
  var therapyId;
  for( therapyId = 0; therapyId < settings.length; therapyId++ ) {
    loadTherapySettings(therapyId);
  }
}

/*
* Returns a string with the main therapy informations.
*/
function getTherapyInfoText(therapyId) {
  var infoText = "Aim " + getTherapyAim(therapyId) + " "
							 + "Corr " + getTherapyCorrection(therapyId) + " "
  						 + "Bolus " + getTherapyBolus(therapyId);
  return infoText;
}

/*
* Returns the therapy name of the given id. 
*/
function getTherapyName(therapyId) {
  var therapyName = "";
  if( therapyId == 0 ) therapyName = "Morning (06:00-12:00)";
  if( therapyId == 1 ) therapyName = "Noontime (12:00-18:00)";
  if( therapyId == 2 ) therapyName = "Evening (18:00-24:00)";
  if( therapyId == 3 ) therapyName = "Late (00:00-06:00)";
  return therapyName;
}

/*
* Updates the GUI by viewing the values stored in the settings array. 
*/
function updateTherapySettings() {
  refreshSettings(selectedTherapy);
  return selectedTherapy;
}

/*
* Puts the UI values into the settings array and updates the GUI. 
*/
function changeTherapySettings() {
  settings[selectedTherapy].aim = document.getElementById('settingsAim').value;
  settings[selectedTherapy].corr = document.getElementById('settingsCorr').value;
  settings[selectedTherapy].bolus = document.getElementById('settingsBolus').value;
  saveTherapySettings(selectedTherapy);
  updateTherapySettings();
}

/*
* Takes the settings and applies them to the gui.
*/
function refreshSettings(therapyId) {
  var therapyInfo = document.getElementById('therapyInfo');
  var therapySetup = document.getElementById('therapySetup');
  
  therapyInfo.innerHTML = getTherapyInfoText(therapyId);
  therapySetup.innerHTML = getTherapyName(therapyId);
  document.getElementById('settingsAim').value = getTherapyAim(therapyId);
  document.getElementById('settingsCorr').value = getTherapyCorrection(therapyId);
  document.getElementById('settingsBolus').value = getTherapyBolus(therapyId);
  
  updateCalculations();
}

/*
* Automaticly choose the therapy setting depending on the actual daytime.
*/
function autoTherapySetting() {
  var daytimeId = getTherapyDaytime();
  setTherapy( daytimeId );
}

/*
* Return the index of the select button elem.
*/
function getIndexOfSelectButton(elem) {
  var sub = document.getElementsByClassName("selectButton");
  for(var i=0; i<sub.length; i++)
    if( sub[i] == elem )
      return i;
  return -1; 
}

/*
* Called if the user selects a therapy.
*/
function selectTherapy(elem) {
  setTherapy( getIndexOfSelectButton(elem) );
}

/*
* Sets the border color of the therapy buttons.
*/
function updateTherapyColor() {
  var sub = document.getElementsByClassName("selectButton");
  for(var i=0; i<sub.length; i++) {
    if( i == selectedTherapy ) { 
      if( i == getTherapyDaytime() ) sub[i].style.border = "0.1em solid #ccc";
      else sub[i].style.border = "0.1em solid #FAA";
    }
    else sub[i].style.border = "0em dashed #ccc";
  }
}

/*
* Switches to the given therapy setting id.
*/
function setTherapy(id) {
  selectedTherapy = id;
  updateTherapyColor();
  refreshSettings(id);
  updateTherapySettings();
}

/*
* Calculate correction
*/
function calcCorrection(therapyId)
{
  var glu = document.getElementById("glucose").value;
  var gluAim = getTherapyAim(therapyId);
  var corr = getTherapyCorrection(therapyId);
  var result = (glu - gluAim) / corr;
  if( glu == "" ) result = NaN;
  return result;
}

/*
* Calculate meal
*/
function calcEffectiveFood(therapyId)
{
  var food = document.getElementById("foodbe").value;
  var factor = getTherapyBolus(therapyId);
  var result = food * factor;
  if( food = "" ) result = NaN;
  return result;
}

/*
* Recalculate 
*/
function updateCalculations() 
{
  var bolusElement = document.getElementById('finalBolus');
    
  var correction = calcCorrection( selectedTherapy );
  var effectiveFood = calcEffectiveFood( selectedTherapy );
  var finalBolus = correction + effectiveFood;
  
  if( finalBolus == 0 || isNaN(finalBolus) ) bolusElement.value = "";
  else bolusElement.value = finalBolus.toFixed(2);
 
  var elemSum = document.getElementById('sum');
 
  var calcString = "";
  if( bolusElement.value != "" ){
    calcString = "Corr (" + correction.toFixed(2) + ") + Meal (" + effectiveFood.toFixed(2) + ")";
    elemSum.style.background = "#fff";
  }
  else { elemSum.style.background = "transparent"; }
  elemSum.innerHTML = calcString;
  
  if( finalBolus <= 0 ) bolusElement.style.color = "darkgreen";
  else bolusElement.style.color = "#F11";
}

/*
* Checks if the given elements value is a number.
*/
function validateInputNumber(elementID) 
{
  var x = document.getElementById(elementID).value;
  if (isNaN(x)) // this is the code I need to change
  {
    alert("Must input numbers");
    return false;
  }
}

/*
* Helper function to increment values of input fields.
*/
function incrementNumber(elementID, value, minimum, decimals) {
  var min = parseFloat(minimum);
  var old = parseFloat(elementID.value);
  var add = parseFloat(value);
  var dec = parseInt(decimals);
  
  if( isNaN(min) ) min = -Number.MAX_VALUE;
  if( isNaN(old) ) old = 0; 
  if( isNaN(add) ) add = 0;
  if( isNaN(dec) ) dec = 0;
  
  var out = old + add;
  
  if( out <= min ) elementID.value = "";
  else elementID.value = out.toFixed(dec);
  
  updateCalculations();
}


/*
* Frequently called to update the displayed daytime.
*/
function updateTime() {
  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  if (minutes < 10){
      minutes = "0" + minutes;
  }
  if (seconds < 10){
      seconds = "0" + seconds;
  }
  var v = " " + hours + ":" + minutes + " ";
  setTimeout("updateTime()", 1000);
  document.getElementById('therapyTime').innerHTML = v;
    
  if( initialized == true && selectedTherapy != getTherapyDaytime() ) {
  	updateTherapyColor();
  }
}

/*
* Returns an ID for the daytime depending on the actual time.
* Return values: 0 = morning, 1 = noontime, 2 = evening, 3 = late.
*/
function getTherapyDaytime() {
	var daytime = 0;
  var currentTime = new Date();
  var hours = currentTime.getHours();
  if( hours >= 6 && hours < 12 ) daytime = 0;
  if( hours >= 12 && hours < 18 ) daytime = 1;
  if( hours >= 18 && hours < 24 ) daytime = 2;
  if( hours >= 0 && hours < 6 ) daytime = 3;
  return daytime;  
}

