// globals
// Our array of dom images to cycle through
var imageElements = [];



/**
 * Load data from remote url
 * @returns 
 */
async function load() {
    let url = 'https://greenman-lego.builtwithdark.com/competition?PageSize=8';
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
            Src: image.ImageUrls.Original.Url,
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
  elements.flat().forEach(element => {
      // loop through all elements
      if (document.getElementById(element.id) == null) {
          //only add the element if it does not exist yet
        base.appendChild(element);
      }
  })  
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

// Load the raw data from our API
load().then(rawData => {
    extractItems(rawData);
});

setInterval(displayNext,5000)
