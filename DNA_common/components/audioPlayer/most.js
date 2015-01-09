
var Most = (function() {
	"use strict";

	function Most() {
		console.log("most.js Most ctor called."); 
		var self = this;
		if (typeof(tizen.most) !== 'undefined') {
			this.most = tizen.most;
			console.log("this.most assigned.");
		} else {
			this.most = null;
		}		
	}

	Most.prototype.callInitMost = function() {

		var self = this;
	/*	tizen.most.initMost("1234"); */
		if(tizen.most)
			console.log("most: callInitMost sees tizen.most");

	
	};
	
	window.__most = undefined === window.__most ? new Most() : window.__most; 
	
	console.log("new Most called.");
	return window.__most;
})();
