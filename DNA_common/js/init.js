var init = {};

var Dependancies = [];

function depenancyMet(name) {
   console.log("depenancy "+name);
   var found = false;
   for (index = 0; ((index < Dependancies.length)&&(!found)); index++) {
		if (Dependancies[index].name == name) {
			found = true;
			Dependancies[index].met = true;
			while (Dependancies[index].callbacks.length >0) {
				var item = Dependancies[index].callbacks.pop();
				try {
					item.callback();
				} catch(error)
				{
					console.error("depenancy callback failed source=",item,"error=",error);
				}
			}
		}
	}
	if (!found) {
		var item = {};
		item.name = name;
		item.met = true;
		item.callbacks = [];
		Dependancies.push(item);
	}
}

function onDepenancy(name,callback,source) {
	console.log("needed depenancy name="+name+" source="+source);
	var found = false;
	var item = {};
	item.callback = callback;
	item.source = source;
	var item2 = {};
	item2.name = name;
	item2.met = false;
	item2.callbacks = [];
	item2.callbacks.push(item);
   for (index = 0; ((index < Dependancies.length)&&(!found)); index++) {
		if ((Dependancies[index].met)&&(Dependancies[index].name == name)) {
			callback(); // depenancy already met.
			found = true;
		} else if (Dependancies[index].name == name) {
			var found2=false;
			for (index2 = 0; index2<Dependancies[index].callbacks.length; index2++) {
				if (Dependancies[index].callbacks[index2].callback==callback) {
					found2=true;
				}
			}
			if (!found2) {
				Dependancies[index].callbacks.push(item);
			}
			found = true;
		}
	}
	if (!found) {
		Dependancies.push(item2);
	}
}

function showDependancies() {
  console.log("showDependancies");
  for (index = 0; index < Dependancies.length; index++) {
	console.log("Deped name="+Dependancies[index].name);
  }
}

function showRequires() {
  console.log("showRequires");
  for (index = 0; index < Dependancies.length; index++) {
	  for (index2 = 0; index2 < Dependancies[index].callbacks.length; index2++) {
		console.log("Deped name="+ Dependancies[index].name+" function="+Dependancies[index].callbacks[index2].callback+" source="+Dependancies[index].callbacks[index2].source);
	  }
  }
}
function includeJs(jsFilePath, callback, async) {
	//console.log("includeJs "+jsFilePath);
    var js = document.createElement("script");

    js.onload = function(e) {
		if(typeof(callback) !== typeof undefined)
		callback();
	}
	js.onerror = function() {console.log("error loading "+jsFilePath);};
    js.type = "text/javascript";
    js.src = jsFilePath;
    if(async == 1){
		js.defer = true;
		js.async = true;
	}

	try {
		document.head.appendChild(js);
	}
	catch (err){
		console.error("init.js error in loadScript: "+err.message);
	}
}

function includeHTML(htmlFilePath,onload,onerror,id,name) {
	console.log("includeHTML "+htmlFilePath);
    var html = document.createElement("link");

    html.rel = "import";
    html.href = htmlFilePath;
    html.onload = function(e) {
		if(typeof(name) !== typeof undefined)
			$("#"+name).append($(document.querySelector('#'+id).import.querySelector("#"+name)).children());
		if(typeof(onload) !== typeof undefined)
			onload(e);
	};
    html.onerror = onerror;
	html.id = id;

	try {
		document.head.appendChild(html);
	}
	catch (err){
		console.log("includeHTML: "+err.message);
	}
}

//includeJs("DNA_common/components/jQuery/jquery-1.8.2.js");
//includeJs("DNA_common/components/knockout/knockout.js");
includeJs("DNA_common/components/jQuery/jquery-ui.js",function(){
	depenancyMet("jquery-ui.js");
});
onDepenancy("jquery-ui.js",function(){
	includeJs("DNA_common/components/jQuery/jquery-ui.touch-punch.js",function(){
		depenancyMet("jquery-ui.touch-punch.js");
	});
});
includeJs("DNA_common/components/jQuery/jquery.nouislider.js");
//includeJs("DNA_common/js/jquery.carouFredSel-6.2.1-packed.js");
//includeJs("DNA_common/components/incomingCall/incomingCall.js");

includeJs("DNA_common/components/jsViews/jsrender.js");
includeJs("DNA_common/components/jsViews/template.js");
includeJs("DNA_common/components/boxCaption/boxCaption.js");
includeJs("DNA_common/components/car/js/car.js");
includeJs("DNA_common/components/configuration/js/configuration.js");
// Part of the mechanism to ensure that carIndicator.js has been parsed by the time
// Dashboard needs it.
includeJs("DNA_common/js/carIndicator.js",function(){depenancyMet("carIndicator.js");});
includeJs("DNA_common/js/user.js");
includeJs("DNA_common/js/bootstrap.js");
includeJs("DNA_common/components/rvi/js/ej.js");
includeJs("DNA_common/components/rvi/js/wse.js");
includeJs("DNA_common/components/rvi/js/rvi.js",function(){depenancyMet("rvi.js");});
includeJs("DNA_common/components/topBar/js/topBar.js", function(){});
includeJs("DNA_common/components/bottomBar/js/bottomBar.js", function(){});
includeJs("DNA_common/components/settings/js/settings.js");
includeJs("DNA_common/components/wifi/js/wifi.js");
includeJs("DNA_common/components/bluetooth/js/bluetooth.js");
includeJs("DNA_common/components/incomingCall/incomingCall.js");
includeJs("DNA_common/components/dateTime/js/dateTime.js");
includeJs("DNA_common/components/hotspot/js/hotspot.js");

includeJs("DNA_common/components/audioPlayer/most.js");
includeJs("DNA_common/components/knockout/knockout.js",function(){
		depenancyMet("knockout.js");
	});
includeJs("DNA_common/components/jsViews/jsrender.js");
includeJs("DNA_common/components/jsViews/template.js");
includeJs("DNA_common/components/progressBar/progressBar.js");
/*includeJs("DNA_common/components/keyboard/keyboard.js");*/
/*includeJs("DNA_common/components/settings/js/wifi.js");*/

//includeJs("DNA_common/components/buttonControls/buttonControls.js");
//includeJs("DNA_common/components/uri/uri.js");
includeJs("DNA_common/components/weather/weather.js");
//includeJs("DNA_common/components/audioPlayer/audioPlayer.js");
//includeJs("DNA_common/components/alphabetBookmark/alphabetBookmark.js");
includeJs("DNA_common/components/library/js/library.js");
includeJs("DNA_common/components/volume/js/volume.js");

includeJs("DNA_common/components/hvac/js/hvac_rvi.js");
