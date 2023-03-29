
function getSalit(){
    //Function for getting the available theaters from Finnkino API
    var req = new XMLHttpRequest(); //new HTTP request
    req.open("GET", "https://www.finnkino.fi/xml/TheatreAreas/") //The AJAX call
    const saliLista = [];  //We create list where the available theaters will be added
    req.addEventListener("load",function(){ //Event listener that listens to incoming traffic from FinnkinoAPI
        const res = req.responseText;   //save the response text to a variable        
        const xmlDocument = new DOMParser().parseFromString(res, "text/xml"); //The response is formatted into xml format        
        const TheatreArea = xmlDocument.querySelectorAll("TheatreArea"); //every "TheatreArea" object is selected        
        for (const theater of TheatreArea) {    //for loop that loops over the list of TheatreArea objects
            const id = theater.querySelector("ID").textContent; //from each TheatreArea object the ID gets inputted into a variable
            const name = theater.querySelector("Name").textContent; //from each TheatreArea object the Name gets inputted into a variable
            if (name.includes(":")){
                saliLista.push({id, name}); //add id and name to saliLista
            }
            
            
        }
        createDropdownOptions(saliLista); //createDropdownOptions function gets the saliLista as input and creates the dropdown menu

    })

    req.send() //sends the request
    
}

function createDropdownOptions(saliLista) {
    //function that adds the options of different theatres into the dropdown list
    const theatersDropdown = document.getElementById('theaters'); //gets the dropdown menu element
    for (const theater of saliLista) { //for loop that loops over the saliLista
        const option = document.createElement('option'); //creates an option element
        option.value = theater.id;  //adds theater id as value to the option
        option.textContent = theater.name; //adds theater name as displayable text content to the option
        theatersDropdown.appendChild(option); //adds the option to the dropdown list
    }
}

function getData(selectedTheaterId,callback){
    //function for getting the data from the API, callback allows the data be called on other functions
    var req = new XMLHttpRequest();    
    req.open("GET", "https://www.finnkino.fi/xml/Schedule/?area="+selectedTheaterId);
    req.addEventListener("load",function(){
        const res = req.responseText;        
        const xmlDocument = new DOMParser().parseFromString(res, "text/xml");
        console.log(xmlDocument);
        const shows = xmlDocument.querySelectorAll("Show"); //Shows are selected from the xmlDocument and put into shows variable
        callback(shows) //shows are inside the callback function
    });
    req.send();
    
}

function getMovies(shows){
    //function that gets the names of the movie titles from the shows
    elokuvaNimet = []; //empty list for storing the movie names
    for (const elokuva of shows){   //for loop for going through the shows 
        const nimi = elokuva.querySelector("Title");    //Movie name is selected from the elokuva variable with query selector
        if (!elokuvaNimet.includes(nimi.textContent)) { //returns true if the movie title is not in the list
            elokuvaNimet.push(nimi.textContent); //adds the movie title to the list elokuvaNimet
        };

    }
    return elokuvaNimet; //returns the list
}

function clearRows() {
    //function for clearing the rows to avoid list getting the same movies multiple times
    var tasksDiv = document.getElementById("dataContainer"); //tasksDiv gets  assigned what is inside the dataContainer
    tasksDiv.innerHTML = ""; // set the content of the tasks div to an empty string to clear all the rows
    const imageContainer = document.getElementById('imageContainer'); //imageContainer gets assigned 
    imageContainer.innerHTML = ''; // Clear previous image, if any
    var showsDiv = document.getElementById("showsContainer"); //showsDiv gets  assigned what is inside the showsContainer
    showsDiv.innerHTML = ""; // set the content of the tasks div to an empty string to clear all the rows
  
  }



function writeRow(text_input, selectedTheaterId) {
    //function that writes the movie titles on the page, creates a <p> element 
    var taskText = text_input; //takes the input
    var tasksDiv = document.getElementById("dataContainer"); //selects the taskDiv to have contents from dataContainer
    var newRowDiv = document.createElement("div"); //creates a div element
    var newTaskText = document.createElement("p"); //creates <p> element for the movie name
    newTaskText.classList.add("col-md-12"); //styling for the newTaskText
    newTaskText.textContent = taskText; //newTaskText.text content is the text that is visible on the page

    // Add click event listener to the newTaskText element
    newTaskText.addEventListener("click", function() { //when the movie name is clicked the function is executed         
        getData(selectedTheaterId, function(data) { // Calls the getData function with the selectedTheaterId and passes a callback function that calls loadPoster and displayNextShows with the provided movie title and data
            loadPoster(taskText, data); //load poster function
            displayNextShows(taskText, data); //next shows function
        });
    });
    
    newRowDiv.appendChild(newTaskText); // Append the newTaskText to newRowDiv    
    tasksDiv.appendChild(newRowDiv); // Append the newRowDiv to the tasksDiv
}

function loadPoster(movieName, data){
    //function for loading the movie poster
    let largePortrait = ''; //first the poster source is empty
    
    for (const elokuva of data){   //for loop that goes through the data, that contains all the shows
        
        const title = elokuva.querySelector("Title").textContent; //Movie title gets assigned to constant title
        if (movieName === title){ //comparison for the movie titles
            largePortrait = elokuva.querySelector("EventLargeImagePortrait").textContent;  //when the movie titles match the address of the movie poster is assigned to variable          
            
        }
    }
    if (largePortrait) {        
        const imageElement = document.createElement('img'); //imageElement gets created        
        imageElement.src = largePortrait; // Set the img src to the image URL
        imageElement.style.width = '125%'; //make the image bigger
        const imageContainer = document.getElementById('imageContainer'); //imageContainer gets assigned 
        imageContainer.innerHTML = ''; // Clear previous image, if any
        imageContainer.appendChild(imageElement); //append the image to image container
    }
}

function getNextShow(movieName, data) {
    //function that gets the next shows for the movie that is chosen
    const naytokset = []; //empty list where the coming shows will be added
    for (const elokuva of data){         //for loop goes through the list of shows
        
        const title = elokuva.querySelector("Title").textContent; //the title of the movie that is in the loop
        if (movieName === title){ //comparison of the chosen movie vs movie in the loop, gets true when the movieName and the movie title in the loop is the same
            naytos = elokuva.querySelector("dttmShowStart").textContent;  //naytos is the starting time of the movie
            naytosAika = formatDate(naytos);  //The time of the show is converted into a better format with the function        
            naytokset.push(naytosAika); //The starting time gets added to the naytokset list
        }
    }    
    return naytokset; //returns naytokset
}

function displayNextShows(movieName, data) {
    //fucntion for displaying the starting time of next shows 
    const showsContainer = document.getElementById('showsContainer'); //gets the showsContainer by Id
    showsContainer.innerHTML = ''; // Clear previous shows, if any
    const showsList = getNextShow(movieName, data);    //get list of shows
    const listTitle = document.createElement('h3'); //create h3 object for information
    listTitle.textContent = `Todays shows for ${movieName} are following:`; //assign the information for the listTitle
    showsContainer.appendChild(listTitle); //append the text to the webpage

    for (var i = 0; i < showsList.length; i++) { //for loop that loops through the shows
        //following is same function as the writeRow, except the element id is showsContainer
        var tasksDiv = document.getElementById("showsContainer");
        var newRowDiv = document.createElement("div");        
        var newTaskText = document.createElement("p");        
        newTaskText.textContent = showsList[i]; 
        newRowDiv.appendChild(newTaskText);
        tasksDiv.appendChild(newRowDiv);   
    
    }
}



function formatDate(inputDate) {
    //the FinnkinoAPI gives the time in awkward format and I wanted to change it to dd-mm-yyyy hh:mm
    //the Date class takes the input date and pics day, month, year, hour, and minute from the string and adds 0 if the output would be single digit otherwise 
    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hour}:${minute}`; //returns the correct format
}

getSalit(); //getSalit for the dropdown menu
const nappi = document.getElementById("nappi"); //the button gets assigned to nappi
nappi.addEventListener("click", function(){ // event listener is added to the button
    const theatersDropdown = document.getElementById('theaters'); //the value of the theaters dropdown is assigned
    const selectedTheaterId = theatersDropdown.value; // the value of selected theater is assigned, the value is the theatre ID
    clearRows() //rows are cleared each time the button is clicked so that there is no information of the old theatre


    getData(selectedTheaterId, function (data) { //gets the data for the selected theater
        elokuvaLista = getMovies(data); //gets list of the movies
        for (var i = 0; i < elokuvaLista.length; i++) { //loops through the movie list
            writeRow(elokuvaLista[i], selectedTheaterId)   //writes the movies to the page
            
          }
    });
});

