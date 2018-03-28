/*Global parameters */
document.addEventListener("DOMContentLoaded", downloadDB);

var portNum = 10000;
//Page: url = http://flip1.engr.oregonstate.edu
var databaseTable = [];
var tableObj;


function loadAddBtnHandler(){
  document.getElementById("addItem").addEventListener("click", function(){
    var req = new XMLHttpRequest();
    var longUrl = buildURL("insert", {});

    req.open("GET", longUrl, true);
    req.addEventListener("load",function(){
      if(req.status >= 200 && req.status < 400){
        var response = JSON.parse(req.responseText);
        // console.log(response);
        // console.log(response.length);
        buildTable(response);
      }
      else{
        console.log(req.query);
        document.getElementById("textOutput").textContent = "Error in network request: " + req.statusText;
      }});
    req.send(null);
    event.preventDefault();
    });
}

function loadDeleteBtnHandler(){
  document.getElementById("deleteTable").addEventListener("click", function(){
    window.location.replace("/reset-table");
    });
}

/* AJAX request that downloads all current data from database */
function downloadDB()
{
    var req = new XMLHttpRequest();
    req.open("GET", "/downloadDB", true);
    req.addEventListener("load",function(){
      if(req.status >= 200 && req.status < 400){
        var response = JSON.parse(req.responseText);
        // console.log(response);
        // console.log(response.length);
        buildTable(response);
      }
      else{
        document.getElementById("textOutput").textContent = "Error in network request: " + req.statusText;
      }});
    req.send(null);
    event.preventDefault();
}

/* Deleting all child elements of dbTable table */
function deleteTable()
{
  tableObj = document.getElementById("dbTable");

  while(tableObj.hasChildNodes())
  {
       tableObj.childNodes.forEach(function(element){
       tableObj.removeChild(element);
      });      
  }
}

/* Building row out of object received from database query */
function buildTable(_responseArray)
{
  deleteTable();
  //If object received has at least one row, start adding rows via DOM
  if(_responseArray.length > 0)
  {
  //Setting table parameters
   tableObj = document.getElementById("dbTable");
   tableObj.style.border = "1px solid black";
   tableObj.style.textAlign = "center";

   //Building header row
   var headerNames = ["Exercise name", "Reps", "Weight", "Date", "Unit(lbs/kg)"];
   buildHeader(headerNames);

   //Building data rows
    if(_responseArray[0]["id"] >= 1)
    {
        _responseArray.forEach(function(element){
        buildRow(element);
      });
    }
  }
}

/* Deleting row by just specifying appropriate rowID in the
 invisible GET request */
function deleteRow(_deleteID)
{
    var req = new XMLHttpRequest();
    var longUrl = buildURL("delete", {"id": _deleteID});

    req.open("GET", longUrl, true);
    req.addEventListener("load",function(){
      if(req.status >= 200 && req.status < 400){
        var response = JSON.parse(req.responseText);
        // console.log(response);
        // console.log(response.length);
        buildTable(response);
      }
      else{
        console.log(req.query);
        document.getElementById("textOutput").textContent = "Error in network request: " + req.statusText;
      }});
    req.send(null);
    event.preventDefault();   
}

/* Building row out of data received from database */
function buildRow(_rowObject)
{
  //Adding row to DOM
    var newRow = document.createElement("tr");
    newRow.cols = [];
    tableObj.appendChild(newRow);
    
  //Creating columns
    for(var i = 0; i < 7; i++)
    {
    var newCol = document.createElement("td");
    newCol.style.border = "1px solid black";
    newRow.cols.push(newCol);
    }

  //Setting column values
    var colNum = 0;
    for(var prop in _rowObject)
      {
        if(_rowObject.hasOwnProperty(prop) && prop != "id") 
        {
            if( _rowObject[prop] != null)
            {
             newRow.cols[colNum].textContent = _rowObject[prop];
            }
            else
            {
              newRow.cols[colNum].textContent = "null";
            }    
          colNum++;   
        }
      }

    //Adding columns to DOM
    for(var i = 0; i < 7; i++)
    {
    newRow.appendChild(newRow.cols[i]);
    }

    //Adding form and buttons
    var newForm = document.createElement("form");
    newRow.childNodes[5].appendChild(newForm);
    newRow.buttons = [];
    newRow.buttons.push(createInput("submit", "Delete"));
    newRow.buttons.push(createInput("hidden", _rowObject["id"]));
    newRow.buttons.push(createInput("submit", "Edit"));

    //Adding handlers for buttons
    //Delete button
    newRow.buttons[0].addEventListener("click", function(){ 
      deleteRow(_rowObject["id"]);
    });

    //Edit button
    newRow.buttons[2].addEventListener("click", function(){ 
    window.location.replace("/start-update?id=" + _rowObject["id"]); 
    });

    //Adding first 2 buttons to the form DOM
    for(var i = 0; i < 2; i++)
    {
      newForm.appendChild(newRow.buttons[i]);
    }

    //Adding edit button to DOM
    newRow.lastElementChild.appendChild(newRow.buttons[2]);
    databaseTable.push(newRow);
}

function buildHeader(_headNames)
{
   var newHead = document.createElement("tr");
   newHead.cols = [];
   tableObj.appendChild(newHead);

    for(var i = 0; i < 6; i++)
    {
      var newCol = document.createElement("th");
      newCol.style.border = "1px solid black";
      newHead.cols.push(newCol);
    }

    var colNum = 0;
    _headNames.forEach(function(element){
    newHead.cols[colNum].textContent = element;
    newHead.appendChild(newHead.cols[colNum]);
    colNum++;
    });

    databaseTable.push(newHead);
}

/*Building query mostly for GET requests to Node/Express */
function buildURL(queryType, options)
{
  var newUrl;
  if(queryType == "downloadDB")
  {
     newUrl = "/downloadDB";
  }

  if(queryType == "insert")
  {
     newUrl="/insert?";
     var exerciseName = document.getElementById("name").value;
     var reps = document.getElementById("reps").value;
     var weight = document.getElementById("weight").value;
     var date = document.getElementById("date").value;
     var unit = document.getElementById("unit").checked;
     newUrl += "name=" + exerciseName; 

    if(reps.length > 0)
     {
        newUrl += "&reps=" + reps;
     }
    if(weight.length > 0)
     {
        newUrl += "&weight=" + weight;
     }
    if(date.length > 0)
     {
        newUrl += "&date=" + date;
     }
    if(unit == true)
    {
     newUrl += "&lbs=1";
    }
    if(unit == false)
    {
      newUrl += "&lbs=0";
    }   
   }
   if(queryType == "delete")
   {
      newUrl ="/delete?id=" + options["id"]; 
   }

  return newUrl;
}

/*Function for creating inputs */
function createInput(inputType, inputText)
{
  var newInput = document.createElement("input");
  newInput.setAttribute("type", inputType.toString());
  newInput.setAttribute("value", inputText.toString());
  return newInput;
}

loadAddBtnHandler();
loadDeleteBtnHandler();

