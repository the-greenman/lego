// globals
var feed = 0;
var delay = 5000;
var interval = 10000;
var max = 100;
var bgcolor = "#34a19c";
var transform = "1,0,0,1,0,0";
var batch = 30;
var page = 1;
var totalPages =1;
var pageIterationsMax = 20;
var pageIterationsCount = 0;
var logging = false
var browserRestart = 0;
var activeImage;


var blankStartHour  = 9
var blankEndHour = 10
/**
 * Load data from remote url
 * 
 */
async function load(feed) {
    let url = 'https://greenman-lego.builtwithdark.com/competition/' + feed + "?Page=" + page
    let obj = {}
    try {
      obj = await (await fetch(url)).json();
    } catch {
    }
    return obj;
}

/**
 * Processes a single item from the raw data
 * @param {*} item 
 */
function processItem(item) {
    processed = item.Images.map((image) => {
        return {
            Id: image.ImageId,
            Src: image.ImageUrls.Large.Url,
        }
    })
    return processed;
}

/**
 *  Create a dom element for the image
 * 
 */
function generateElement(image) {
    let element = document.createElement('img');
    element.onerror = function(){logging && console.log("Error on "+this.id); this.remove();};  // get rid of bad images
    element.onload = function(){
        this.classList.add('loaded'); 
        if (!activeImage) {
             this.classList.add('active');  // activate the first image that loads    
             this.classList.remove('hidden');
             activeImage=this.id;
        }
    } // flag images that are fully loaded 
    element.src = image.Src;
    element.id = image.Id;        
    element.classList.add('image', 'hidden');
    return element;
}
/**
 * Process incoming feed to select desired data
 * @param {*} raw 
 */
function extractItems(raw) {
    try {
        let processed = raw.Items.map(processItem);
        //let elements = processed.map(generateElements);
        let base = document.getElementById('base');
        let count = 0;
        let exists = 0;
        processed.flat().forEach(image => {            
            if (document.getElementById(image.Id) == null && count++ < batch) {
                let element = generateElement(image);
                base.appendChild(element);                   
            } else {
                ++exists                
            }
        })
        logging && console.log(count + " new elements, " + exists + " skipped elements");
        cleanUpElements();
    }
    catch (err) {
        logging && console.log("Bad feed");
    }

}

/**
 * Remove the oldest elements if we are over our max element size
 */
function cleanUpElements() {
    let elements = document.querySelectorAll(".image:not(.active)"); // we exclude active so that we dont remove the active image
    logging && console.log("Total images in dom: " + (elements.length + 1))
    let diff = elements.length - max
    if (diff > 0) {
        for (let loop = 0; loop < diff; loop++) {
            logging && console.log("Removing element: " + elements[loop].id)
            elements[loop].remove();
        }
        logging && console.log("Removed: " + diff + " elements")
    }
}

/**
 * Find the next image in the dom and set it to visible
 * 
 */
function displayNext() {
    let active = document.querySelector(".image.active");
    let next = null;
    if (active) {
        //next = active.nextElementSibling;
        next = document.querySelector(".image.active ~ img.loaded");
        active.classList.remove('active');
        active.classList.add('hidden');
    }
    if (!next) {
        next = document.querySelector('.image.loaded');
    }
    if (next) {
        next.classList.add('active');
        next.classList.remove('hidden');
        activeImage = next.id;
    }
}

/**
 * Pull live config data from the feed and update our settings
 * 
 */
function extractConfig(rawData) {
    try {
        if (delay != rawData.Config.Delay) {
            delay = rawData.Config.Delay;
            logging && console.log("Updating delay to " + delay)
        }
        if (interval != rawData.Config.Interval) {
            interval = rawData.Config.Interval;
            logging && console.log("Updating interval to " + interval)
        }
        if (max != rawData.Config.Max) {
            max = rawData.Config.Max;
            logging && console.log("Updating max to " + max)
        }
    
        if (batch != rawData.Config.Batch) {
            batch = rawData.Config.Batch;
            logging && console.log("Updating batch to " + batch)
        }
        if (bgcolor != rawData.Config.BGColor) {
            bgcolor = rawData.Config.BGColor;
            document.body.style.backgroundColor = bgcolor;
        }
        if (transform != rawData.Config.Transform) {
            transform = rawData.Config.Transform;
            document.getElementById("base").style.transform = "matrix("+transform+")";
            logging && console.log("Updating transform to " + transform)
        }    

        if (pageIterationsMax != rawData.Config.PageIterations) {
            pageIterationsMax = rawData.Config.PageIterations;
            logging && console.log("Updating page iterations to " + pageIterationsMax)
        }
        if (blankStartHour != rawData.Config.BlankStart) {
            blankStartHour = rawData.Config.BlankStart;
            logging && console.log("Updating blank start to " + blankStartHour)
        }
        if (blankEndHour != rawData.Config.BlankEnd) {
            blankEndHour = rawData.Config.BlankEnd;
            logging && console.log("Updating blank end to " + blankEndHour)
        }



        if (browserRestart != rawData.Config.BrowserRestart) {
            browserRestart = rawData.Config.BrowserRestart;
            logging && console.log("Enabling restart at "+browserRestart)
            if (browserRestart>0) {
                setTimeout(restart, 1000+browserRestart*1000);
            }            
        }


        totalPages = rawData.TotalPages; 
    }
    catch {
        //
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
        display(); // init the loop
        update();
    }).catch();
}

/** Check for more content 
 * Interval is configurable via the feed
 * 
*/
function update() {
    var reload = function () {
        // check how many iterations we've done on this page
        // update the page if we need to 
        if (++pageIterationsCount == pageIterationsMax) {
            if (++page > totalPages) {
                page = 1;
            }
            pageIterationsCount = 0;
        } 
        logging && console.log("Updating...page " + page + " (" + pageIterationsCount + ")");
        load(feed).then(rawData => {
            extractItems(rawData);
            extractConfig(rawData);            
        }).catch(
            
        );
        setTimeout(reload, interval);
    }
    setTimeout(reload, interval);
}

/**
 * Set up a looping, but live configurable function to manage the per image display
 */
function display() {
    var next = function () {
        displayNext();
        blanker();
        setTimeout(next, delay);
    }
    setTimeout(next, delay);
}

function blanker(){
    const d = new Date();
    let hour = d.getHours();
    if (hour >= blankStartHour && hour < blankEndHour) {
        document.getElementById("base").classList.add('hidden');
        document.body.classList.add('blank');
    }  else {
        document.getElementById("base").classList.remove('hidden');
        document.body.classList.remove('blank');
    }
}

/**
 * Force a reload of the page
 */
function restart(){
    location.reload();
}

document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded
    const urlParams = new URLSearchParams(window.location.search);
    let autoFeed = urlParams.get('feed');
    if (urlParams.get('log')) {
        logging = true;
    }
    if (autoFeed) {
        blanker();
        init(autoFeed)
    }    

});