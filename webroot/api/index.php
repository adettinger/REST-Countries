
<?php

$q = $_GET["q"];
$p = $_GET["search"];

//Pass error as JSON to app.js
function function_alert($message) {
	echo "{\"status\": -1, \"message\": \"$message\"}";
}

//Check p is a valid option
if($p != 'name' && $p != 'fullname' && $p != 'code') {
	//Invalid input error
	function_alert("Invalid search");
	die();
	return;
}

//Sanitize q string
$pattern = '/^[a-z A-Z]+$/';
if(!preg_match($pattern,$q)) {
	function_alert("Invalid search term");
	die();
	return;
}

if ($p == 'name') {
$service_url = "https://restcountries.eu/rest/v2/name/" . $q;
} elseif ($p == 'fullname') {
$service_url = "https://restcountries.eu/rest/v2/name/" . $q . "?fullText=true";
} elseif ($p == 'code') {
$service_url = "https://restcountries.eu/rest/v2/alpha/" . $q;
}


$curl = curl_init($service_url);

//Set curl to return data
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

//Call Rest API and close curl
$curl_response = curl_exec($curl);
curl_close($curl);

//Decode REST API Response and report error if exists
$decoded = json_decode($curl_response);
if (isset($decoded->response->status) && $decoded->response->status == 'ERROR') {
    die('error occured: ' . $decoded->response->errormessage);
}

//Pass REST API response data to app.js
echo($curl_response);
die();


?>

