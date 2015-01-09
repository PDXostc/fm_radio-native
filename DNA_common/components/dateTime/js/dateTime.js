var DateTime={};

DateTime.TemplateHTML = "DNA_common/components/dateTime/dateTime.html";

DateTime.dnaFormatTime = function()
{
	var now = new Date();
	var hh = now.getHours();
	var mn = now.getMinutes();
	if (mn < 10) { mn = "0" + mn; }
	var suffix = ( hh > 11 ) ? "PM" : "AM" ;
	if ( hh > 12 ) { hh -= 12; }

	return hh + ":" + mn + " " + suffix;
}

DateTime.dnaTime = function()
{
	var dnaTime = document.getElementById("dnaTime");
	dnaTime.innerHTML = "<strong>" + DateTime.dnaFormatTime() + "</strong>";
}


DateTime.dnaDate = function()
{
	console.log("DateTime.dnaDate()");
	var dnaDate = document.getElementById("dnaDate");
	console.log(dnaDate);
	var days = ["SUN" , "MON" , "TUE" , "WED" , "THU" , "FRI" , "SAT"];
	var months = ["JAN" , "FEB" , "MAR" , "APR" , "MAY" , "JUN" , "JUL" , "AUG" , "SEP" , "OCT" , "NOV" , "DEC"];
	var now = new Date();
	var mm = now.getMonth(); // Month name index
	var dd = now.getDate(); // Day of the month number
	var dy = now.getDay(); // Day name index
	mm = months[mm]; // Convert to month name string
	dy = days[dy]; // Convert to day name string
	var timeStr = now;
	var dateStr = dy + " " + mm + " " + dd;
	dnaDate.innerHTML = "<strong>" + dateStr + "</strong>";
}

DateTime.includeHTMLSucess = function(linkobj) {
   console.log("loaded dateTime.html");
   DateTime.import = linkobj.path[0].import;
   console.log("import of DateTime")
   console.log(DateTime.import.getElementById('clockElement'));
   DateTime.dateTimeHTML = DateTime.import.getElementById('clockElement');
   DateTime.pageUpdate();
};
		
DateTime.pageUpdate = function() {
	console.log("dateTime.pageUpdate()");
	if (!$('#clockElement').length) {
		// We only want to check at the beginning.  We can call this 
		// function again if we add the clockElement at a later time.
		//setTimeout(DateTime.pageUpdate,1000);
	}
	else {
		console.log(document.getElementById('clockElement'));
		$('#clockElement').replaceWith(DateTime.dateTimeHTML);
		console.log(document.getElementById('clockElement'));
		setInterval(DateTime.dnaTime, 1000);
		DateTime.dnaTime();
		DateTime.dnaDate();
		console.log("clock update ");
	}
};


DateTime.includeHTMLFailed = function(linkobj) {
	console.log("load dateTime.html failed");
	console.log(linkobj);
};

includeHTML(DateTime.TemplateHTML, DateTime.includeHTMLSucess, DateTime.includeHTMLFailed);
