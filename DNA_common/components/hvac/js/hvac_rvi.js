/*
 * Copyright (c) 2015, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

//Incoming RVI messages to be executed by HVAC
$(document).ready(function(){
	onDepenancy("rvi.loaded",function(){
		onDepenancy("hvacIndicator.loaded",setup_hvac_service);
	});
});


var no_reflect = "";

//Services/Indentifiers for HVAC in RVI.
var hvacServices = [
		{"name":"hvac/air_circ","callback":"aircirc_rcb","indicator_name":"airRecirculation"},
		{"name":"hvac/fan","callback":"fan_rcb","indicator_name":"fan"},
		{"name":"hvac/fan_speed","callback":"fanspeed_rcb","indicator_name":"fanSpeed"},
		{"name":"hvac/temp_left","callback":"temp_left_rcb","indicator_name":"targetTemperatureLeft"},
		{"name":"hvac/temp_right","callback":"temp_right_rcb","indicator_name":"targetTemperatureRight"},
		{"name":"hvac/hazard","callback":"hazard_rcb","indicator_name":"hazard"},
		{"name":"hvac/seat_heat_right","callback":"seat_heat_right_rcb","indicator_name":"seatHeaterRight"},
		{"name":"hvac/seat_heat_left","callback":"seat_heat_left_rcb","indicator_name":"seatHeaterLeft"},
		{"name":"hvac/airflow_direction","callback":"airflow_direction_rcb","indicator_name":"airflowDirection"},
		{"name":"hvac/defrost_rear","callback":"defrost_rear_rcb","indicator_name":"rearDefrost"},
		{"name":"hvac/defrost_front","callback":"defrost_front_rcb","indicator_name":"frontDefrost"},
	
		{"name":"hvac/subscribe","callback":"hvac_subscribe"}, //handles subscribing and unsubscribing other nodes.
		{"name":"hvac/unsubscribe","callback":"hvac_unsubscribe"} //handles subscribing and unsubscribing other nodes.
	];

function setup_hvac_service(){

	if(hvacIndicator != undefined){
		console.log("setting up HVAC services.");

		rvi.rviRegisterServices(hvacServices);
		hvacSetupRVIListeners();		
	}
}


function aircirc_rcb(args){
	no_reflect = args.sending_node;
	carIndicator.setStatus("airRecirculation", str2bool(args.value));
}

function fan_rcb(args){
	
	console.log("Setting fan status to "+args.value);
	carIndicator.setStatus("fan", str2bool(args.value));
}

function fanspeed_rcb(args){
	
	console.log("Setting fan speed to "+args.value);
	carIndicator.setStatus("fanSpeed", parseInt(args.value));
}

function temp_left_rcb(args){
	
	carIndicator.setStatus("targetTemperatureLeft", parseInt(args.value));
}
function temp_right_rcb(args){
	
	carIndicator.setStatus("targetTemperatureRight", parseInt(args.value));
}
function hazard_rcb(args){
	
	hvacControler.prototype.onHazardChanged(str2bool(args.value));
}
function seat_heat_right_rcb(args){
	no_reflect = args.sending_node;
	carIndicator.setStatus("seatHeaterRight", parseInt(args.value));
}
function seat_heat_left_rcb(args){
	no_reflect = args.sending_node;
	carIndicator.setStatus("seatHeaterLeft", parseInt(args.value));
}
function airflow_direction_rcb(args){
	
	carIndicator.setStatus("airflowDirection", parseInt(args.value));
}
function defrost_rear_rcb(args){
	
	carIndicator.setStatus("rearDefrost", str2bool(args.value));
}
function defrost_front_rcb(args){
	
	carIndicator.setStatus("frontDefrost", str2bool(args.value));
}

//Handles a Subscription request from a node.
function hvac_subscribe(args){
	console.log(args);
	args = JSON.parse(args.value);
	//Add this node to the list of subscribers
	
	//Make sure this is defined if it hasn't been previously.
	if(rvi.settings.subscribers == undefined) rvi.settings.subscribers = [];
	
	if(rvi.settings.subscribers.indexOf(args['node']) == -1){
		rvi.settings.subscribers.push(args['node']);
		rvi.setRviSettings(rvi.settings);
	}
	console.log("Current Subscribers: ");
	console.log(rvi.settings.subscribers);

	sendCurrentValues();
}

function hvac_unsubscribe(args){
	if(rvi.settings.subscribers == undefined) rvi.settings.subscribers = [];

	var node = rvi.settings.subscribers.indexOf(args['sending_node']);
	if(node != -1){
		rvi.settings.subscribers.splice(node,1);	
		rvi.setRviSettings(rvi.settings);
	}
}


function hvacSetupRVIListeners(){
	//Adds RVI listeners for HVAC changes.
	rvi.hvacListener = carIndicator.addListener(
		{
	    onAirRecirculationChanged : function(newValue) {
		//hvacIndicator.onAirRecirculationChanged(newValue);
		sendRVIHVAC("air_circ", newValue);
	    },
	    onFanChanged : function(newValue) {
		//hvacIndicator.onFanChanged(newValue);
		//sendRVIHVAC("fan_speed", newValue);
	    },
	    onFanSpeedChanged : function(newValue) {
		//hvacIndicator.onFanSpeedChanged(newValue);
		sendRVIHVAC("fan_speed", newValue);
	    },
	    onTargetTemperatureRightChanged : function(newValue) {
		//hvacIndicator.onTargetTemperatureRightChanged(newValue);
		sendRVIHVAC("temp_right", newValue);
	    },
	    onTargetTemperatureLeftChanged : function(newValue) {
		//hvacIndicator.onTargetTemperatureLeftChanged(newValue);
		sendRVIHVAC("temp_left", newValue);
	    },
	    onHazardChanged : function(newValue) {
		console.log("onHazardChanged: "+ newValue);
		sendRVIHVAC("hazard", newValue);
	    },
	    onSeatHeaterRightChanged : function(newValue) {
		//hvacIndicator.onSeatHeaterRightChanged(newValue);
		sendRVIHVAC("seat_heat_right", newValue);
	    },
	    onSeatHeaterLeftChanged : function(newValue) {
		//hvacIndicator.onSeatHeaterLeftChanged(newValue);
		sendRVIHVAC("seat_heat_left", newValue);
	    },
	    onAirflowDirectionChanged : function(newValue) {
		//hvacIndicator.onAirflowDirectionChanged(newValue);
		sendRVIHVAC("airflow_direction", newValue);
	    },
	    onFrontDefrostChanged : function(newValue) {
		//hvacIndicator.onFrontDefrostChanged(newValue);
		sendRVIHVAC("defrost_front", newValue);
	    },
	    onRearDefrostChanged : function(newValue) {
		//hvacIndicator.onRearDefrostChanged(newValue);
		sendRVIHVAC("defrost_rear", newValue);
	    }
	});
	
}

//Sends current values over RVI
function sendCurrentValues(){
	carIndicator.getStatus(function(currentStatus){

		for(v in hvacServices){
			if(hvacServices[v].indicator_name == undefined)
				continue;

			if(currentStatus[hvacServices[v].indicator_name] != undefined){
				console.log("Name: "+hvacServices[v].name+" Current Val"+currentStatus[hvacServices[v].indicator_name]);
				sendRVIHVAC(hvacServices[v].name,currentStatus[hvacServices[v].indicator_name])
			}
		}
	});
}


function sendRVIHVAC(key,value){

	//send message to all subscribers
	var subs = rvi.settings.subscribers;
	if (subs == undefined || subs.length == 0) return;


	if(key.indexOf("hvac/") == -1)
		key = "hvac/"+key;

	for(node in subs){

		if (no_reflect == subs[node]) {
			console.log();
			no_reflect = "";
			continue;
		};

		service = subs[node]+key;
		vals = JSON.stringify({value:value.toString()})
		console.log("Sending RVI message Node:"+subs[node])
		console.log("Sending RVI message Key/Val:"+key+"/"+value);

		rvi.comm.send_message(service, 5000, vals, key);
	}
}