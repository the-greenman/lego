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
        return image.ImageUrls.Large.Url
    })    
    return processed;
}


/**
 * Returns a dom element for each image.
 * @param {} item 
 */
function generateElements(item){
   const section = document.createElement('div');
   section.classList.add('entry');
   item.Images.forEach(image => {
       let element = document.createElement('img');
       element.src = image;
       element.classList.add('image');
       section.appendChild(element);
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
   
  elements.forEach(element => {
      base.appendChild(element);
  })
}



// Load the raw data from our API
load().then(rawData => {extractItems(rawData)});

