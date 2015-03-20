console.log("start of bluetooth.js");
var BluetoothSettingsPage={};
var Bluetooth = {}; //new BluetoothSettings();


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

		var close_button = document.getElementById('bluetoothBackArrow').onclick = BluetoothSettingsPage.HidePage;
		BluetoothSettingsPage.initialize();
	}
};

BluetoothSettingsPage.includeHTMLSucess = function(linkobj) {
   console.log("loaded bluetooth.html");
   BluetoothSettingsPage.import = linkobj.path[0].import;
   BluetoothSettingsPage.bluetoothPageHTML = BluetoothSettingsPage.import.getElementById('bluetoothPage');
   BluetoothSettingsPage.bluetoothDeviceHTML = BluetoothSettingsPage.import.getElementById('bluetoothDeviceTemplate');
   onDepenancy("Settings.settingsPage",BluetoothSettingsPage.pageUpdate,"Bluetooth");
   //BluetoothSettingsPage.pageUpdate();
};

BluetoothSettingsPage.includeHTMLFailed = function(linkobj) {
	console.log("load bluetooth.html failed");
	console.log(linkobj);
};


includeHTML(BluetoothSettingsPage.TemplateHTML, BluetoothSettingsPage.includeHTMLSucess, BluetoothSettingsPage.includeHTMLFailed);


BluetoothSettingsPage.initialize = function(){
	Bluetooth = new BluetoothSettings();
	this.deviceTemplate = document.querySelector("template#bluetoothDeviceTemplate");


	// Make the switch turn bluetooth on and off
	document.querySelector("#bluetoothPowerButton .switch").addEventListener("touchend",function(){
		console.log("touchend called on BT power.");
		Bluetooth.togglePowered();
	});

	document.querySelector("#bluetoothRefreshButton").addEventListener("touchend",function(){
		console.log("Touchend called on Refresh.");
		Bluetooth.findDevices();
	});


	//Update the powered switch on open.
	this.updatePoweredSwitch();
	
	if(Bluetooth.adapter.powered == true){
		Bluetooth.findDevices();
	}
}


// Updates the visual display on the Bluetooth settings page.
BluetoothSettingsPage.updatePoweredSwitch = function(){
		var p = Bluetooth.adapter.powered;
		console.log("Updating Powered");

		if(p == true){
			$("#bluetoothPowerButton .switch").addClass("on").removeClass("off");
		}else{
			$("#bluetoothPowerButton .switch").addClass("off").removeClass("on");
		}

	//Also update the display of the network list.

}

BluetoothSettingsPage.listBluetoothDevice = function(template,device){
			console.log("listBluetoothDevice ",device);
			template.querySelector(".networkElement").setAttribute("data-address",device.address);
			template.querySelector(".networkElementTitle").innerHTML = device.name;
			template.querySelector(".networkElementSubtitle").innerHTML = device.address;

			if(device.isConnected == true){
				template.querySelector(".networkElementMore").innerHTML = "CONNECTED";
				
				$(template.querySelector(".pairButton")).addClass("hidden");
				$(template.querySelector(".unpairButton")).removeClass("hidden");

			} else if(device.isBonded == true){
				template.querySelector(".networkElementMore").innerHTML = "PAIRED";
				
				$(template.querySelector(".pairButton")).addClass("hidden");
				$(template.querySelector(".unpairButton")).removeClass("hidden");

			}else{
				template.querySelector(".networkElementMore").innerHTML = "NOT PAIRED";
				
				$(template.querySelector(".pairButton")).removeClass("hidden");
				$(template.querySelector(".unpairButton")).addClass("hidden");
			}

			var clone = document.importNode(template,true);
			clone.querySelector(".pairButton").addEventListener('touchend',function(ev){				
				var address = $(ev.target).closest(".networkElement").attr("data-address");
				console.log("address to pair "+address);
				Bluetooth.pairDevice(address);	
			});

			clone.querySelector(".unpairButton").addEventListener('touchend',function(ev){				
				var address = $(ev.target).closest(".networkElement").attr("data-address");
				console.log("address to unpair "+address);
				Bluetooth.unpairDevice(address);	
			});

			document.querySelector("#BluetoothNetworksList").appendChild(clone);
			console.log("added "+device.name);
}


//Bluetooth settings interacts with the rest of the page. 
function BluetoothSettings(){
	var self = this;
	console.log("Initializing Bluetooth; If your device hangs here, update your bluetooth RPM stack!");
	this.adapter = tizen.bluetooth.getDefaultAdapter();
	this.devices = []; //object to hold discovered devices.
	this.known = [];

/*
	this.adapter.getKnownDevices(function(knownDevices){
		self.known = knownDevices;
	});
*/	
	//Toggles the powered state of the Bluetooth hardware.
	this.togglePowered = function(){
		var p = self.adapter.powered;
		
		if(p == true){
			self.adapter.setPowered(false,
				function(r){
					BluetoothSettingsPage.updatePoweredSwitch();
					self.known = [];
					self.devices = [];

					self.displayDevices();
				},	
				function(e){
					powerError(e);
				});
		}else{
			self.adapter.setPowered(true,
				function(r){
					BluetoothSettingsPage.updatePoweredSwitch();
					self.findDevices();
				},
				function(e){
					powerError(e);
				});
		}

		function powerError(error){
			console.log("There was an error trying to change the state of Bluetooth Power: ");
			console.log(error);
		}
	}

	this.getKnownDevices = function(){
		self.adapter.getKnownDevices(function(devices){
			//Devices previously paired or discovered.
			
			self.known.push(devices);

		});
		//this.devices = known;
	}

	//This is a helper function, that puts remembered devices in the list.
	this.inKnown = function(address){
		for(var d in self.known){
			if(address == self.known[d].address){
				return true;
			}
		}
		return false;
	}

	this.findDevices = function(){

		//search handler is passed into the adapter discoverDevices method as a success handler.
		var searchHandler = {
			onstarted: function(){
				console.log("Looking for devices");
			},
			ondevicefound: function(device){
				
				if(!self.inKnown(device.address)){
					self.devices.push(device);
				}
				console.log("found "+device.name);
				self.displayDevices();
				
			},
			ondevicedisappeared: function(address){
				console.log("Lost "+address);
			},
			onfinished: function(devices){
				console.log("Finished looking for devices");
				self.displayDevices();
			}
		}

		self.adapter.getKnownDevices(function(devices){
			//Devices previously paired or discovered.
			
			self.known = devices;
			self.adapter.discoverDevices(searchHandler,function(e) {
				console.log ("Failed to search devices: " + e.message + "(" + e.name + ")");
	  		});	
		});
	}


	this.displayDevices = function(){
		var d = BluetoothSettingsPage.deviceTemplate.content;

		
		var totalDevices = self.known.concat(self.devices);

		//clear the existing network.
		//document.querySelector("#BluetoothNetworksList").innerHTML = "";
		$("#BluetoothNetworksList").empty();

		for(device in totalDevices){
			BluetoothSettingsPage.listBluetoothDevice(d,totalDevices[device]);
		}
	}


	this.pairDevice = function(address){
		console.log("Attempting to bond with "+address);
		self.adapter.createBonding(address,
			function(device){
			console.log("successfully bonded to "+device.name);
			tizen.phone.selectRemoteDevice(address);
			self.displayDevices();

			},function(error){
				console.log("Error Bonding.");
				thing = error;
				console.log(error);
			});
	}

	this.unpairDevice = function(address){
		console.log("Attempting to unbond "+address);
		self.adapter.destroyBonding(address,
			function(){
				console.log("successfully unbonded");
				//self.displayDevices();
				self.findDevices();

			},function(error){
				console.log("Error Unbonding.");
				thing = error;
				console.log(error);
			});
	}




	console.log("Instantiated BluetoothSettings");
	return this;
}
console.log("end of bluetooth.js");
