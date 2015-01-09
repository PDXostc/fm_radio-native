setInterval(dnaTime, 1000);

function dnaFormatTime()
{
	var now = new Date();
	var hh = now.getHours();
	var mn = now.getMinutes();
	if (mn < 10) { mn = "0" + mn; }
	var suffix = ( hh > 11 ) ? "PM" : "AM" ;
	if ( hh > 12 ) { hh -= 12; }

	return hh + ":" + mn + " " + suffix;
}

function dnaTime()
{
	var dnaTime = document.getElementById("dnaTime");
	dnaTime.innerHTML = dnaFormatTime();
}


function dnaDate()
{
	var dnaDate = document.getElementById("dnaDate");
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
	dnaDate.innerHTML += dateStr;
}

window.addEventListener('load', dnaTime, false);
window.addEventListener('load', dnaDate, false);

