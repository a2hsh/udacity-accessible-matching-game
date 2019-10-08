/* Stopwatch Module
This module is responsible for the stopwatch, as it will create a new stopwatch and send the values back to the application.
Three methods will be defined: start, getTime, stop, and reset.

Usage:
Creating the object:
let stopwatch = new stopwatch();
And then you can:
stopwatch.start();
stopwatch.getTime();
stopwatch.reset();
or
stopwatch.stop();
*/

//initializing the object
const StopWatch = function StopWatch() {
  let timer;
  let on = false;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  
  this.start = function(callback) {
    //check if the timer is already on
    if (on === true) {
      console.log('Timer is already on');
      return;
    }
    on = true;
    //Create the timer sequance
    timer = setInterval(function() {
      seconds++;
      if (seconds === 60) {
        seconds = 0;
        minutes++;
        if (minutes === 60) {
          minutes = 0;
          hours++;
        }
      }    
      if(callback && callback.constructor === Function) {
        callback();
      }
    }, 1000);
    console.log('Timer Started.');
  }
  
  this.stop = function() {
    //Pause the timer
    clearInterval(timer);
    on = false;
    console.log('Timer stopped at: ', this.getTime());
  }
  
  this.reset = function() {
    this.stop();
        //reset all variables to their origional state
    hours = 0;
    minutes = 0;
    seconds = 0;
  }
  
  //get the string for the timer
  this.getTime = function() {
    //If the numbers are below 10, add a '0' before them for better readibility
    let hour = hours > 9 ? String(hours) : '0' + String(hours);
    let minute = minutes > 9 ? String(minutes) : '0' + String(minutes);
    let second = seconds > 9 ? String(seconds) : '0' + String(seconds);
    let timeString = hour + ':' + minute + ':' + second;
    return timeString;
  }
}