/*Global variables and calls */

function loadSaveBtnHandler()
{
	 document.getElementById("editRow").addEventListener("click", function(){

	 /* Saving current form values for sending it later" */
	 var _exerciseName = document.getElementById("name").value;
     var _reps = document.getElementById("reps").value;
     var _weight = document.getElementById("weight").value;
     var _date = document.getElementById("date").value;
     if(_date.length == 0)
     {
     	_date = null;
     }
     if(_reps.length == 0)
     {
     	_reps = null;
     }
     if(_weight.length == 0)
     {
     	_weight = null;
     }
     var _unit = document.getElementById("unit").checked;
     var _idInput = document.getElementById("idInput").value;

     /*Creating payload object to send in POST request body*/
     var payload = {"name": _exerciseName, "reps": _reps,
     				"weight": _weight, "date": _date,
     				"lbs": _unit, "id": _idInput};

    var req = new XMLHttpRequest();
    req.open("POST", "/update", true);
    req.addEventListener("load",function(){
      if(req.status >= 200 && req.status < 400){
        var response = JSON.stringify(req.responseText);
        console.log(response);  
     }
      else{
        console.log(req.body);
        document.getElementById("textOutput").textContent = "Error in network request: " + req.statusText;
      }});
    /*Sending payload */
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(payload));
    event.preventDefault();
	 });
}

function loadBackBtnHandler()
{
	/*Going back to homepage after saving data */
	document.getElementById("goHome").addEventListener("click", function(){
	window.location.replace("http://flip1.engr.oregonstate.edu:10000");
	 });
}

loadSaveBtnHandler();
loadBackBtnHandler();