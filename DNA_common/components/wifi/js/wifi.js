console.log("start of wifi.js");

/*
$(document).on("click", "#wifi-button .switch-plate", function() {
	  $(this).closest(".switch").toggleClass("on off");
	})
*/					
var WifiSettingsPage={};
WifiSettingsPage.TemplateHTML = "DNA_common/components/wifi/wifi.html";

WifiSettingsPage.ShowPage = function() { 
		console.log('wifi page show_click();');
		$('#settingsPageList').addClass('hidden');
		$('#WifiPage').removeClass('hidden');


	   $.when(loadComponents()).then(function(p){
    		wifiInit();
	   	});
	};

WifiSettingsPage.HidePage = function() { 
		console.log('wifi page hide_click();');
		$('#settingsPageList').removeClass('hidden');
		$('#WifiPage').addClass('hidden');
	};

WifiSettingsPage.pageUpdate = function() {
	console.log("wifi pageUpdate()");

	if (!$('#settingsPage').length) {
		setTimeout(WifiSettingsPage.pageUpdate,1000);
	}
	else {
		$("#settingsPage").append(WifiSettingsPage.import.getElementById('WifiPage'));
		Settings.addUpdateSettingsPage('wifi','settings',WifiSettingsPage.ShowPage);
	   document.querySelector('#addNetworkButton').onclick = function() {
				$('#AddNetworkModal').removeClass("hidden");
		   };
	   document.querySelector('#AddNetworkExitModal').onclick = function() {
				$('#AddNetworkModal').addClass("hidden");
		   };
		var close_button = document.getElementById('wifiBackArrow').onclick = WifiSettingsPage.HidePage;
	}
};

WifiSettingsPage.includeHTMLSucess = function(linkobj) {
   console.log("loaded wifi.html");
   WifiSettingsPage.import = linkobj.path[0].import;
   WifiSettingsPage.wifiPageHTML = WifiSettingsPage.import.getElementById('WifiPage');
   WifiSettingsPage.WifiDeviceHTML = WifiSettingsPage.import.getElementById('WifiDeviceTemplate');
   WifiSettingsPage.WifiAddNetworkModalHTML = WifiSettingsPage.import.getElementById('AddNetworkModal');
   $("#WifiPage").append(WifiSettingsPage.WifiAddNetworkModalHTML);
   //$("#settingsPage").append(WifiSettingsPage.import.getElementById('WifiPage'));
   //$("body").append(WifiSettingsPage.import.getElementById('WifiPage'));
   //var close_button = document.getElementById('tabsCloseSubPanelWifiButton').onclick = WifiSettingsPage.HidePage;
   onDepenancy("Settings.settingsPage",WifiSettingsPage.pageUpdate,"Wifi");
   //WifiSettingsPage.pageUpdate();
};

WifiSettingsPage.includeHTMLFailed = function(linkobj) {
	console.log("load wifi.html failed");
	console.log(linkobj);
};


includeHTML(WifiSettingsPage.TemplateHTML, WifiSettingsPage.includeHTMLSucess, WifiSettingsPage.includeHTMLFailed);

console.log("end of wifi.js");



function loadComponents(){
	var promise = $.Deferred();

	//Wifi.TemplateHTML = "DNA_common/components/wifi/wifi.html";
	Wifi.connman = "DNA_common/components/settings/js/api-connman.js";
	Wifi.ws = "DNA_common/components/settings/js/websocket.js";

	includeJs(Wifi.ws,function(){ //include websocket		
		includeJs(Wifi.connman,function(){
			promise.resolve();
		}); //include connman	
	}); 

	return promise;
}

wifiInit = function(){
	Wifi = {};

	w = new WifiSettings();
	connect = w.connect();

	$.when(connect).then(function(res){
		console.log(res);
		console.log("websocket connected.");

		return w.loadDefaultAdapter();
	}).then(function(input){
	
		//setup wifi on/off button click event
		$("#wifiPowerButton .switch").click(function(ev){
			w.wifi.technology.setPowered(!w.wifi.prop.Powered,function(){
				console.log("setting wifi powered prop to inverse");
				w.wifi.prop.Powered = !w.wifi.prop.Powered;
				w.displayPoweredState();
			});
		});

	});

	//Setup Wifi control button
}

handlePropertyChanged = function(event){
	console.log("Handling property change");
}

WifiSettings = function(){

	self = this;
	self.wifi = {};
	self.networks = [];

	this.connect = function(){
		var promise = $.Deferred();

		wsAPI.connect('ws://localhost:16000/', 'http-only', function() {
				console.log('Settings daemon connected');
				
				wsAPI.subscribeEvents(function(event) {
					self.connmanEventReceived(event);
				});
				/*
				self.loadDefaultAdapter(function(err) {
					error = err;
					if (!!callback) {
						callback(error);
					}
				});
				*/
				promise.resolve();

			}, function(err) {
				console.log('Settings daemon disconnected...', err);
				if (err === null || err === undefined) {
					error = 'Error: Cannot connect to settings daemon';
					console.log(error);
				} else {
					error = err;
					console.log("Error", error);
				}
				if (!!callback) {
					callback(error);
				}
				promise.fail(err);
			});
		return promise;
	}

	this.scan = function(event){
		settings.connman.scan(self.wifi.id,function(services){
			self.updateNetworks(services);
		})
	}

	this.displayPoweredState = function(){
		if(self.wifi.prop.Powered == false){
			$("#wifiPowerButton .switch").removeClass("on").addClass("off");
		}else if(self.wifi.prop.Powered == true){
			$("#wifiPowerButton .switch").removeClass("off").addClass("on");
		}
	}

	this.displayPowered = function(){
		if(self.wifi.prop.Powered != undefined){
			
		}else{
			
		}
	}

	this.togglePoweredOn = function(){
		this.wifi.setPowered(false,function(r){
			this.wifi.setPowered(true,function(r2){
				console.log("Set powered on after toggle.");
			});
		});
	}

	this.connmanEventReceived = function(event){
		console.log(event);
	}

	this.loadDefaultAdapter = function(){
		var promise = $.Deferred();

		settings.connman.getTechnologies(function(technologies) {
			for ( var i = 0; i < technologies.length; i++) {
				var technology = technologies[i];
				if (technology.prop.Type === 'wifi') {
					console.log('Connman technology found: ', technology);
					self.wifi = { 
									id:technology.id,
									prop:technology.prop,
									technology:technology
								}
					break;
				}
			}
			promise.resolve();
		});
		return promise;
	}

	this.updateNetworks = function(newServices){
		//need to filter services to wifi only set.
		var tempServices = [];
		for (service in newServices){
			if(newServices[service].prop.Type == 'wifi'){
				tempServices.push(newServices[service])
			}
		}

		if(tempServices.length > 0){
			self.networks = tempServices;
		}
		//self.networks = networkSet;
		this.displayNetworks();
	}

	//Lists networks on the settings wifi panel 
	this.displayNetworks = function(){
		
		if($("#wifiNetworksList div.wifiElement").length > 0){
			$("#wifiNetworksList div.wifiElement").remove();
		}


		var template = WifiSettingsPage.import.querySelector("#WifiDeviceTemplate");
		//var template = WifiSettingsPage.import.getElementById("WifiDeviceTemplate");

		for (network in self.networks){
			//template.querySelector(".wifiElementTitle").innerHTML = self.networks[network].prop.Name;
			var clone =  template.cloneNode(true);
			clone.setAttribute("id",undefined);
			clone.querySelector(".wifiElementTitle").innerHTML = self.networks[network].prop.Name;

			document.querySelector("#wifiNetworksList").appendChild(clone);
		}
	}

	return this;

}
