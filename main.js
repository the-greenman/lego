// globals
var feed = 0;
var delay = 5000;
var interval = 10000;
var max = 100;
var bgcolor = "#34a19c";

/**
 * Load data from remote url
 * @returns 
 */
async function load(feed) {
    let url = 'https://greenman-lego.builtwithdark.com/competition/'+feed
    let obj = await (await fetch(url)).json();
    return obj;
}

/**
 * Processes a single item from the raw data
 * @param {*} item 
 */
function processItem(item){
    let processed = {
        Id: item.Id,
        Description: item.Description,
        Title: item.Title
    }
    processed.Images = item.Images.map((image)=>{
        return {
            Id: image.ImageId,
            Src: image.ImageUrls.Large.Url,
        }
    })    
    return processed;
}


/**
 * Returns a dom element for each image.
 * @param {} item 
 */
function generateElements(item){
   let section = []   
   item.Images.forEach(image => {
       let element = document.createElement('img');
       element.src = image.Src;
       element.id = image.Id;
       element.classList.add('image','hidden');
       section.push(element);
   });
   return section;
}
/**
 * Process incoming feed to select desired data
 * @param {*} raw 
 */
function extractItems(raw){
  let processed = raw.Items.map(processItem);
  let elements = processed.map(generateElements);
  let base = document.getElementById('base');
  let count =0;   
  elements.reverse().flat().forEach(element => {
      // loop through all elements
      if (document.getElementById(element.id) == null) {
          //only add the element if it does not exist yet
        base.appendChild(element);
        count++;
      }
  }) 
  console.log(count + " new elements"); 
  cleanUpElements();
}

function cleanUpElements(){
    let elements = document.querySelectorAll(".image");
    let diff = elements.length - max
    if (diff > 0) {
        for (let loop=0; loop < diff; loop++) {
            console.log("Removing element: " + elements[loop].id)
            elements[loop].remove();
        }
    }
}


function displayNext(){
    let active = document.querySelector(".image.active");
    let next = null;
    if (active) {
        next = active.nextElementSibling;
        active.classList.remove('active');
        active.classList.add('hidden');
    } 
    if (!next) {
        next = document.querySelector('.image');
    }
    if (next) {
        next.classList.add('active');
        next.classList.remove('hidden');
    }
}


function extractConfig(rawData){
    if (delay != rawData.Config.Delay) {        
        delay = rawData.Config.Delay;   
        console.log("Updating delay to "+ delay)
    }
    if (interval != rawData.Config.Interval) {        
        interval = rawData.Config.Interval;
        console.log("Updating interval to "+ interval)
    }
    if (max != rawData.Config.Max) {        
        max = rawData.Config.Max;
        console.log("Updating max to "+ max)
    }  
    if (bgcolor != rawData.Config.BGColor) {        
            bgcolor = rawData.Config.BGColor;
            document.body.style.backgroundColor=bgcolor;            
    }  
}

/** Initialise on load */
function init(dataFeed) {
    // set the feed if we are provided one
    if (dataFeed) {
        feed = dataFeed;
    }
    document.getElementById("select").classList.add('hidden');
    document.getElementById("loading").classList.remove('hidden');
    // Load the raw data from our API
    load(feed).then(rawData => {        
        extractItems(rawData);
        extractConfig(rawData);
        document.getElementById("loading").classList.add('hidden');
        displayNext();
    });
}

/** Check for more content 
 * Interval is configurable via the feed
 * 
 * 
*/
function update() {
    var reload = function(){
        console.log("Updating...");
        load(feed).then(rawData => {        
            extractItems(rawData);
            extractConfig(rawData);
        });
        setTimeout(reload,interval);
    }    
    setTimeout(reload,interval);   
}

function display() {
    var next = function(){
        displayNext();
        setTimeout(next,delay);
    }
    setTimeout(next,delay);
}

document.addEventListener("DOMContentLoaded", function(){    
    // Handler when the DOM is fully loaded
    const urlParams = new URLSearchParams(window.location.search);
    let autoFeed = urlParams.get('feed');
    if (autoFeed) {        
        init(autoFeed)
    }
    display();
    update();
    
});