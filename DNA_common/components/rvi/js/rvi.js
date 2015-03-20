
/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/** 
 * @module Services
 */

console.log("start of rvi settings template");
var rviSettingsPage={};
rviSettingsPage.TemplateHTML = "DNA_common/components/rvi/rvi.html";

rviSettingsPage.ShowPage = function() { 
		console.log('rvi page show_click();');
		$('#settingsPageList').addClass('hidden');
		$('#rviPage').removeClass('hidden');

		// display or hide the contents of the tabbed sections when tapped, 
		// and let the tab display a selected state.
		$("#setup-tab").click(function() {
			console.log("clicked the Setup Tab");
			if ($("#setup-content").hasClass("hidden")) {
				$("#setup-content").removeClass("hidden");
				$("#setup-tab").addClass("tab-selected");
				$("#apps-content").addClass("hidden");	
				$("#apps-tab").removeClass("tab-selected");		
			}
		});

		$("#apps-tab").click(function() {
			console.log("clicked the Apps Tab");
			if ($("#apps-content").hasClass("hidden")) {
				$("#setup-content").addClass("hidden");
				$("#setup-tab").removeClass("tab-selected");
				$("#apps-content").removeClass("hidden");
				$("#apps-tab").addClass("tab-selected");
			}
		});
		
	};

rviSettingsPage.HidePage = function() { 
		console.log('rvi page hide_click();');
		$('#settingsPageList').removeClass('hidden');
		$('#rviPage').addClass('hidden');
	};

rviSettingsPage.pageUpdate = function() {
	console.log("rvi pageUpdate()");

	if (!$('#settingsPageList').length) {
		setTimeout(rviSettingsPage.pageUpdate,1000);
	}
	else {
		$("#settingsPage").append(rviSettingsPage.import.getElementById('rviPage'));
		var close_button = document.getElementById('rviBackArrow').onclick = rviSettingsPage.HidePage;
		Settings.addUpdateSettingsPage('rvi','settings',rviSettingsPage.ShowPage);

		rvi = new rviSettings();
		rviSettingsPage.initialize();
		rvi.loaded.done(function(){
			console.log("RVI Object loaded");
			rviSettingsPage.displayValues();
			rvi.wsConnect();
		});
	}
};

rviSettingsPage.includeHTMLSucess = function(linkobj) {
   console.log("loaded rvi.html");
   rviSettingsPage.import = linkobj.path[0].import;
   rviSettingsPage.rviPageHTML = rviSettingsPage.import.getElementById('rviPage');
   rviSettingsPage.rviDeviceHTML = rviSettingsPage.import.getElementById('rviDeviceTemplate');
   //$("#settingsPage").append(rviSettingsPage.import.getElementById('rviPage'));
   //$("body").append(rviSettingsPage.import.getElementById('rviPage'));
   onDepenancy("Settings.settingsPage",rviSettingsPage.pageUpdate,"Rvi");
   //rviSettingsPage.pageUpdate();
};

rviSettingsPage.includeHTMLFailed = function(linkobj) {
	console.log("load rvi.html failed");
	console.log(linkobj);
};

rviSettingsPage.initialize = function(){

	$(".setup").click(function(ev){
	  $("#resultMessage").hide();
	  $("#setupForm").show();

	  $("#messageOverlay").css("display","block");
	  $("#inputBox").css("display","inline-block");
	});

	$("#cancel").click(function(ev){
	  $("#messageOverlay").css("display","none");
	  $("#inputBox").css("display","none");
	});

	$("#saveRviSettings").click(function(ev){
		console.log("save rvi settings button");
		rviSettingsPage.saveSettings();
	});

	$("#resultMessage").click(function(ev){
	  $("#messageOverlay").css("display","none");
	  $("#inputBox").css("display","none");
	});

}



includeHTML(rviSettingsPage.TemplateHTML, rviSettingsPage.includeHTMLSucess, rviSettingsPage.includeHTMLFailed);

rviSettingsPage.displayValues = function(){
	console.log("calling display values");
	document.querySelector("#vinNumber").value = rvi.settings.vin;
}

rviSettingsPage.saveSettings = function(){
	var vin = document.querySelector("#vinNumber").value;
	//document.querySelector("")

	formattedSettings = {"vin":vin};

	rvi.setRviSettings(formattedSettings);

	//rviSettingsPage.displayValues();
}

var rviSettings = function(){

	self = this;
	this.loaded = new $.Deferred();
	this.comm = new RVI();

	//Load setting when they're available.
	

	this.getRviSettings = function(){
		
		Configuration.reload(function(){

			var saved = Configuration.get("Settings.rvi");
			if(saved != undefined){
				self.settings = saved;
			}else{
				self.settings = {};
			}
			


			//Make sure this is defined if it hasn't been previously.
			if(self.settings.services == undefined) self.settings.services = [];

			//resolve the promise for initial setup.
			if(self.loaded.state() != "resolved"){
				self.loaded.resolve();
			}
		});
		
	}

	this.setRviSettings = function(settings){
		console.log("Saving entered values");

		if(settings == undefined){
			console.log("Not settings provided");
			return false;
		} 

		Configuration.set("Settings.rvi",settings);
		Configuration.save();
		
		this.getRviSettings();
	}
	
   	this.rviError = function(message){
    	console.log(message);
    }


    this.wsConnect = function(){
    	self.comm.connect("ws://127.0.0.1:8818/websession",self.rviError);
		depenancyMet("rvi.loaded");
   	}

	this.rviRegisterServices = function(serviceList){
		console.log("Registering RVI services");
		for(service in serviceList){
			// If this is not in settings and we want it to be
			if(self.settings.services.indexOf(serviceList[service]) == -1){
				self.comm.register_service(serviceList[service].name,serviceList[service].callback);
				console.log("Registering "+ serviceList[service].name);
			}
		}

		Configuration.save("Settings.rvi",self.settings);
	}

	this.getRviSettings();
}


// Singleton
function RVI() {

    console.log("Starting up service RVI 1");
    RVI.instance = this
    this.service_map = {};

    this.connect = function(address, err_cb) {
	try {
	    if (Wse.open(address))
		console.log("Connected to RVI service edge at " + address);
	    else
		err_cb("Failed to connect to RVI service edge at " + address);
	    
	} catch (err) {
	    err_cb("Exception when connecting to RVI: " + err);
	}
	// Map all incoming services to a given callback.
    }

    this.register_service = function(service, callback) {
	// Add a leading slash if necessar
	if (service[0] != '/')
	    service = '/' + service;

	Wse.start('service_edge_rpc', 'wse_register_service', [ service ]);
	console.log("Registered RVI service: " + service);
	this.service_map[service] = callback;
    }

    this.send_message = function(service, timeout, payload, calling_service) {
	console.log("Sending to             : " + service);
	console.log("Sending parameters     : " + JSON.stringify(payload) );
	console.log("Sending calling_service: " + calling_service);

	// Add a leading slash to calling service  if necessary
	if (calling_service[0] != '/')
	    calling_service = '/' + calling_service;

	Wse.start('service_edge_rpc', 'wse_message', [ service, timeout, payload, calling_service]);
    }

    this.rvi_message = function()  {
		if (this.service_map[args['service_name']]) {
		    window[this.service_map[args['service_name']]](args);
		}else{
		    console.warn("Service: " + args['service_name'] + " not mapped to any callback. Ignore");
	    }

		console.log("RVI Message completed");
	}
}

function message() {
	args = {};

    for (var i = 0; i < arguments.length; ++i) {
    	if(i%2 == 0){
    		args[arguments[i]] = arguments[i+1];
    	}
    }
    console.log("RVI message Arguments ");
    console.log(args);

    return rvi.comm.rvi_message.apply(rvi.comm,args);
}

// display or hide the contents of the tabbed sections when tapped, 
// and let the tab display a selected state.

/*$(document).ready(function(){
	$("#setup-tab").click(function() {
		console.log("clicked the Setup Tab");
		if ($("#setup-content").hasClass("hidden")) {
			$("#setup-content").removeClass("hidden");
			$("#setup-tab").addClass("tab-selected");
			$("#apps-content").addClass("hidden");	
			$("#apps-tab").removeClass("tab-selected");		
		}
	});

	$("#apps-tab").click(function() {
		console.log("clicked the Apps Tab");
		if ($("#apps-content").hasClass("hidden")) {
			$("#setup-content").addClass("hidden");
			$("#setup-tab").removeClass("tab-selected");
			$("#apps-content").removeClass("hidden");
			$("#apps-tab").addClass("tab-selected");
		}
	});
});*/

console.log("end of rvi settings template");