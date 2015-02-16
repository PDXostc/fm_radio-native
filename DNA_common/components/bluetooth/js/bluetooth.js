console.log("start of bluetooth.js");
var BluetoothSettingsPage={};
BluetoothSettingsPage.TemplateHTML = "DNA_common/components/bluetooth/bluetooth.html";

BluetoothSettingsPage.ShowPage = function() { 
		console.log('bluetooth page show_click();');
		$('#settingsPageList').addClass('hidden');
		$('#bluetoothPage').removeClass('hidden');
	};

BluetoothSettingsPage.HidePage = function() { 
		console.log('bluetooth page hide_click();');
		$('#settingsPageList').removeClass('hidden');
		$('#bluetoothPage').addClass('hidden');
	};

BluetoothSettingsPage.pageUpdate = function() {
	console.log("bluetooth pageUpdate()");

	if (!$('#settingsPage').length) {
		setTimeout(BluetoothSettingsPage.pageUpdate,1000);
	}
	else {
		$("#settingsPage").append(BluetoothSettingsPage.import.getElementById('bluetoothPage'));
		Settings.addUpdateSettingsPage('bluetooth','settings',BluetoothSettingsPage.ShowPage);
		var close_button = document.getElementById('tabsCloseSubPanelBluetoothButton').onclick = BluetoothSettingsPage.HidePage;
	}
};

BluetoothSettingsPage.includeHTMLSucess = function(linkobj) {
   console.log("loaded wifi.html");
   BluetoothSettingsPage.import = linkobj.path[0].import;
   BluetoothSettingsPage.bluetoothPageHTML = BluetoothSettingsPage.import.getElementById('bluetoothPage');
   BluetoothSettingsPage.bluetoothDeviceHTML = BluetoothSettingsPage.import.getElementById('bluetoothDeviceTemplate');
   
   BluetoothSettingsPage.pageUpdate();
};

BluetoothSettingsPage.includeHTMLFailed = function(linkobj) {
	console.log("load wifi.html failed");
	console.log(linkobj);
};


includeHTML(BluetoothSettingsPage.TemplateHTML, BluetoothSettingsPage.includeHTMLSucess, BluetoothSettingsPage.includeHTMLFailed);

console.log("end of bluetooth.js");



//wifi.js

Wifi = {};
self = {};

Wifi.TemplateHTML = "DNA_common/components/wifi/wifi.html";
Wifi.connman = "DNA_common/components/settings/js/api-connman.js";
Wifi.ws = "DNA_common/components/settings/js/websocket.js";

includeJs(Wifi.connman); //include connman
includeJs(Wifi.ws); //include websocket


//w = new WifiSettings();
//w.connect();
//w.loadDefaultAdapter(test)
//w.wifi.setPowered(true)

WifiSettings = function(){

	self = this;
	self.wifi = {};
	self.networks = [];

	this.connect = function(){
		wsAPI.connect('ws://localhost:16000/', 'http-only', function() {
				console.log('Settings daemon connected');
				wsAPI.subscribeEvents(function(event) {
					self.connmanEventReceived(event);
				});

				self.loadDefaultAdapter(function(err) {
					error = err;
					if (!!callback) {
						callback(error);
					}
				});
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
			});
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

	this.togglePoweredOn = function(){
		this.wifi.setPowered(false,function(r){
			this.setPowered(true,function(r2){
				console.log("Set powered on after toggle.");
			});
		});
	}

	this.connmanEventReceived = function(event){
		console.log(event);
	}

	this.loadDefaultAdapter = function(callback){

		settings.connman.getTechnologies(function(technologies) {
			for ( var i = 0; i < technologies.length; i++) {
				var technology = technologies[i];
				if (technology.prop.Type === 'wifi') {
					console.log('Connman technology found: ', technology);
					self.wifi = technology;
					break;
				}
			}
			callback();
		});
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
		//var template = document.querySelector("#WifiDeviceTemplate").content;
		var template = WifiSettingsPage.import.getElementById("WifiDeviceTemplate");

		for (network in self.networks){
			template.querySelector(".wifiElementTitle").innerHTML = self.networks[network].prop.Name;
			var clone =  document.importNode(template.content);

			document.querySelector("#wifiNetworksList").appendChild(clone);
		}
	}

	return this;

}
