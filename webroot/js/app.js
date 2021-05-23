
/*
* Main driver for performing search, building/updating table & statistics
*
* @param {String} Search chosen by user via buttons selection
*/
function main(searchOption){

	var input = document.getElementById("SearchTerm").value;
	if(!isAlpha(input)) {
		alert("Search requires valid input");
		return false;
	}
	//Call my php function using ajax to REST API
	sendRequest(input,searchOption);
}


/*
*	Compare for sorting JSON countries by population
*
*/
function compare(a, b) {
	if(a["population"] > b["population"]) {
		return -1
	} else if(a["population"] < b["population"]){
		return 1;
	}
	return 0;

}


/*
* Builds HTML tables for regions & subregions occurences to be displayed
*	side-by-side as well as display # of countries in search results
*
* @param {JSON} data Parsed xmlHttpResponse from REST API
*/
function buildStatistics(data) {
	//Get html body
	var body = document.getElementsByTagName("body")[0];
	

	var regionsMap = [];	//Map for counting regions & # of occurences
	var subRegionsMap = []; //Map for counting subregions & # of occurences

	//Loops through JSON to count regions & subregions
	for(x in data) {
		rowData = data[x];

		//Update Regions Map
		if(!regionsMap[rowData["region"]]) {
			regionsMap[rowData["region"]] = 1;
		} else {
			regionsMap[rowData["region"]]++;
		}

		//Update SubRegions Map
		if(!subRegionsMap[rowData["subregion"]]) {
			subRegionsMap[rowData["subregion"]] = 1;
		} else { 
			subRegionsMap[rowData["subregion"]]++;
		}

	}


	//Build html element "p" to display # of countries
	if(document.contains(document.getElementById("PCountries"))) {
		let PCountries = document.getElementById("PCountries");
		PCountries.remove();
		PCountries.innerHTML = "Total Countries: " + data.length;
		body.appendChild(PCountries);
	} else {
		let PCountries = document.createElement("p");
		PCountries.id = "PCountries";
		PCountries.innerHTML = "Total Countries: " + data.length;
		body.appendChild(PCountries);
	}
	
	//Build HTML parent element to display both region & subregion maps
	if(document.contains(document.getElementById("RegionDisplay"))) {
		//Remove RegionDisplay if it exists from previous search
		let RegionDisplay = document.getElementById("RegionDisplay");
		RegionDisplay.remove();
	}
	let RegionDisplay = document.createElement("div");
	RegionDisplay.className = "RegionDisplay";
	RegionDisplay.id = "RegionDisplay"

	//HTML element for region table
	let RegionColumn = document.createElement("div");
	RegionColumn.className = "StatTable";

	//HTML element for subregion table
	let SubregionColumn = document.createElement("div");
	SubregionColumn.className = "StatTable";

	//Constant headers for regions & subregions map
	let regionTableHeaders = ["Region","Occurences"];
	let subregionTableHeaders = ["Subregion","Occurences"];


	//Build Regions table
	RegionTable = document.createElement("table");
	RegionTableHead = document.createElement("thead");
	RegionHeaderRow = document.createElement("tr");
		//Apply region headers
	regionTableHeaders.forEach(header => {
		let resultHeader = document.createElement('th');
		resultHeader.innerText = header;
		RegionHeaderRow.append(resultHeader);
	})
	RegionTableHead.append(RegionHeaderRow);
	RegionTable.append(RegionTableHead);

	//Fill in Region data
	let RegionTableBody = document.createElement("tbody");

	for(x in regionsMap) {
		let mapRow = regionsMap[x];

		let RegionBodyRow = document.createElement("tr");

		let RegionData = document.createElement("td");
		RegionData.innerText = String(x);

		let RegionCount = document.createElement("td");
		RegionCount.innerText = mapRow;

		RegionBodyRow.append(RegionData, RegionCount);
		RegionTableBody.append(RegionBodyRow);
	}

	RegionTable.append(RegionTableBody);

	//Build Subregion table
	SubregionTable = document.createElement("table");
	SubregionTableHead = document.createElement("thead");
	SubregionHeaderRow = document.createElement("tr");
		//Apply subregion headers
	subregionTableHeaders.forEach(header => {
		let resultHeader = document.createElement('th');
		resultHeader.innerText = header;
		SubregionHeaderRow.append(resultHeader);
	})
	SubregionTableHead.append(SubregionHeaderRow);
	SubregionTable.append(SubregionTableHead);

	//Fill in subregion data
	let SubregionTableBody = document.createElement("tbody");

	for(x in subRegionsMap) {
		let mapRow = subRegionsMap[x];

		let SubregionBodyRow = document.createElement("tr");

		let SubregionData = document.createElement("td");
		SubregionData.innerText = String(x);

		let SubregionCount = document.createElement("td");
		SubregionCount.innerText = mapRow;

		SubregionBodyRow.append(SubregionData, SubregionCount);
		SubregionTableBody.append(SubregionBodyRow);
	}

	SubregionTable.append(SubregionTableBody);

	//Append tables to columns, columns to display, display to body
	RegionColumn.append(RegionTable);
	SubregionColumn.append(SubregionTable);
	RegionDisplay.append(RegionColumn,SubregionColumn);
	body.appendChild(RegionDisplay);
}


/*
* Builds the HTML table to display search results. 
*	Calls buildStatistics() create statistics after
*
* @param {JSON} responseJSON Parsed xmlHttpResponse from REST API
*/
function buildTable(responseJSON) {
	//Get html body element
	var body = document.getElementsByTagName("body")[0];


	//Use table if exists, else create new table
	if(document.contains(document.getElementById("ResultsTable"))) {
		var table = document.getElementById("ResultsTable");
		var resultsBody = table.getElementsByTagName("tbody")[0];
		resultsBody.remove();
	} else {
		var table = document.createElement("table");
		table.id = "ResultsTable";
	}
	
	
	//Use thead if exists, else create new thead
	if(!table.contains(table.getElementsByTagName("thead")[0])) {

		let tableHeaders = ["Full Name","Alpha Code 2","Alpha Code 3","Flag", "Region","Subregion","Population","Lanugages"];
		//create table head element
		var tableHead = document.createElement("thead");

		//creates table row that will contain headers
		var tableHeaderRow = document.createElement("tr");
		tableHeaders.forEach(header => {
			let resultHeader = document.createElement('th');
			resultHeader.innerText = header;
			tableHeaderRow.append(resultHeader);
		})

		//append the header row to the table head
		tableHead.append(tableHeaderRow);
		//append the table head to the table
		table.append(tableHead);
	}
	
	//remove tbody if exists
	if(document.contains(document.getElementsByTagName("tbody")[0])) {
		document.getElementsByTagName("tbody")[0].remove();
	}
	
	
	//create new table body
	var tableBody = document.createElement("tBody");
				
	//Build Table body

	/*
	*	If responseJSON is country obj, make responseJSON a collection of itself to
	*   match other search formats
	*/
	if(responseJSON.hasOwnProperty("name")) {
		responseJSON = [ responseJSON ];
	} else {
		responseJSON.sort(compare);
	}
	console.log();

	for(x in responseJSON) {

		rowData = responseJSON[x];
		
		let tableBodyRow = document.createElement('tr');

		//Create & set fullname
		let fullName = document.createElement('td');
		fullName.innerText = rowData["name"];

		//Create & set alpha2Code
		let alpha2Code = document.createElement('td');
		alpha2Code.innerText = rowData["alpha2Code"];

		//Create & set alpha3Code
		let alpha3Code = document.createElement('td');
		alpha3Code.innerText = rowData["alpha3Code"];

		//Create & set flag
		let flag = document.createElement('td');
		var img = document.createElement('img');
		img.src = rowData["flag"];
		flag.appendChild(img);

		//Create & set region
		let region = document.createElement('td');
		region.innerText = rowData["region"]; 

		//Create & set subregion
		let subregion = document.createElement('td');
		subregion.innerText = rowData["subregion"];

		//Create & set population
		let population = document.createElement('td');
		population.innerText = rowData["population"];

		//Build languageList string
		var languageList = '';
		for(var y = 0; y<rowData["languages"].length; y++) {
			languageList += (rowData["languages"][y]["name"]);
			if(y+1 < rowData["languages"].length) {
				languageList += ', '
			}
		}
		//Create & set languageList
		let languages = document.createElement('td');
			languages.innerText = languageList;

		//Append body data elements to body row
		tableBodyRow.append(fullName, alpha2Code, alpha3Code, flag, region, subregion, population, languages);

		tableBody.append(tableBodyRow);

	}

	//append table body to table
	table.append(tableBody);

	//append the table to the HTML body element
	body.appendChild(table);

	//Buid & display Country regions & subregions statistics
	buildStatistics(responseJSON);
}

/*
* Sends xmlHttpRequest to index.php. Reports error if exists, else
*	passes data to buildTable()
*
* @param {String} input Validated user input for searchTerm
* @param {String} searchOption Search type determined by user's button selection
* @return {Bool} true iff data was parsed successfully, else, false
*/
function sendRequest(input, searchOption) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		console.log("ReadyState: " + xmlhttp.readyState);
		console.log("Status: " + xmlhttp.status);
		
		if (this.readyState == 4 && this.status == 200) {
			console.log(xmlhttp.responseURL);
				
			//Get & parse API response
			responseText = xmlhttp.response;
			var responseJSON = JSON.parse(responseText);
				
			if(responseJSON.hasOwnProperty("status")) {
				console.log("JSON response status: " + responseJSON["status"]);
				console.log("JSON response message: " + responseJSON["message"]);
				switch(responseJSON["status"]) {
					case 404:									//Page not found, no search results
						alert("Search generated zero results");
						break;
					case 400:									//Invalid search term for search type
						alert("Invalid search parameters");
						break;
					case -1:
						alert(responseJSON["message"]);			//Custom error from index.php
				}
				return false;
			}

			buildTable(responseJSON);
				
		}
	}
	xmlhttp.open("GET","api/index.php?q="+input+"&search="+searchOption,true);
	
	xmlhttp.send();
	return true;
}

/*
* Returns true iff str contains only letters and/or spaces
*
* @param {String} str String to be checked
* @return {Bool} True iff str contains only letters and/or spaces
*/
function isAlpha(str) {
	return /^[a-z A-Z]+$/.test(str);
}