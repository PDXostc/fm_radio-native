					
var WifiSettingsPage={};
WifiSettingsPage.TemplateHTML = "DNA_common/components/wifi/wifi.html";

WifiSettingsPage.ShowPage = function() { 
		console.log('wifi page show_click();');
		$('#settingsPageList').addClass('hidden');
		$('#WifiPage').removeClass('hidden');
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
		var close_button = document.getElementById('tabsCloseSubPanelWifiButton').onclick = WifiSettingsPage.HidePage;
	}
};

WifiSettingsPage.includeHTMLSucess = function(linkobj) {
   console.log("loaded wifi.html");
   WifiSettingsPage.import = linkobj.path[0].import;
   WifiSettingsPage.wifiPageHTML = WifiSettingsPage.import.getElementById('WifiPage');
   WifiSettingsPage.WifiDeviceHTML = WifiSettingsPage.import.getElementById('WifiDeviceTemplate');
   //$("#settingsPage").append(WifiSettingsPage.import.getElementById('WifiPage'));
   //$("body").append(WifiSettingsPage.import.getElementById('WifiPage'));
   //var close_button = document.getElementById('tabsCloseSubPanelWifiButton').onclick = WifiSettingsPage.HidePage;
   
   WifiSettingsPage.pageUpdate();
};

WifiSettingsPage.includeHTMLFailed = function(linkobj) {
	console.log("load wifi.html failed");
	console.log(linkobj);
};


includeHTML(WifiSettingsPage.TemplateHTML, WifiSettingsPage.includeHTMLSucess, WifiSettingsPage.includeHTMLFailed);

console.log("end of wifi.js");



function loadComponents(){
	var promise = $.Deferred();

	Wifi.TemplateHTML = "DNA_common/components/wifi/wifi.html";
	Wifi.connman = "DNA_common/components/settings/js/api-connman.js";
	Wifi.ws = "DNA_common/components/settings/js/websocket.js";

	includeJs(Wifi.ws,function(){ //include websocket		
		includeJs(Wifi.connman,function(){
			promise.resolve();
		}); //include connman	
	}); 

	
	

	return promise
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
		
	}).then(function(){

	});





	/*
	connect.then(function(r){
		console.log(r);
	})
	*/
}

WifiSettings = function(){

	self = this;
	self.wifi = {};
	self.networks = [];

	this.connect = function(){
		var promise = $.Deferred();

		wsAPI.connect('ws://localhost:16000/', 'http-only', function() {
				console.log('Settings daemon connected');
				/*
				wsAPI.subscribeEvents(function(event) {
					self.connmanEventReceived(event);
				});

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

	this.isPowered = function(){
		if( self.wifi && self.wifi.prop.Powered != undefined){
			return true;
		}else{
			return false;
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
					self.wifi = technology;
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
	}

	//Lists networks on the settings wifi panel 
	this.displayNetworks = function(){
		
		if($("#wifiNetworksList div.wifiElement").length > 0){
			$("#wifiNetworksList div.wifiElement")
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
