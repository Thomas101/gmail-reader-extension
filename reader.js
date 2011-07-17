//Copyright 2011 Thomas Beverley
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

const refreshMillis = 60000;//1 min

var Reader = function() {
	var self = this;
	self.doc = undefined;
	self.readerButton = undefined;
	self.unreadCount = 0;
	
	/**
	* Injects the reader button into the UI
	*/
	self.inject = function() {
		var frameElem = document.getElementById("canvas_frame");
		var frameDoc = null;
		var menu = null;
		
		// Some elements may not be loaded so we have to do this lossy loading and retry
		if (frameElem) {
			frameDoc = frameElem.contentDocument;
			if (frameDoc) {
				menu = frameDoc.getElementsByClassName("T4 pp")[0];
				if (menu) {
					menu = $(menu);
					self.readerButton = $("<a>").attr({
						"id"		: "reader-tab",
						"class"		: "T3",
						"tabindex"	: "1",
						"role"		: "link",
						"href"		: "http://reader.google.com",
						"target"	: "_blank",
						"style"		: "text-decoration:none; display:block;"
					}).hover(
						function() {
							self.readerButton.addClass("T1");
						}, function() {
							self.readerButton.removeClass("T1");
						}
					);
					menu.append(self.readerButton);
					self.renderButton();
					self.updateCount();
					return;
				}
			}
		}
		
		// We couldn't add at the moment, retry
		setTimeout(function() { self.inject(); }, 100);
	};
	
	/**
	* Fires off a http call to get the unread count from reader then updates the UI
	*/
	self.updateCount = function() {
		$.get("http://www.google.com/reader/api/0/unread-count?all=true", function(res) {
			var unreadCounts = res.getElementsByName("unreadcounts")[0];
			var listNodes = unreadCounts.childNodes;
			var done = false;
			var unread = undefined;
			
			// Iterate through <object> nodes
			for (var i = 0; i < listNodes.length && !done; i++) {
				var propertyNodes = listNodes[i].childNodes;
				
				// Iterate over <object> parents. We will need to find the user count
				for (var j = 0; j < propertyNodes.length && !done; j++) {
					if(propertyNodes[j].getAttribute("name") === "id") {
						if (propertyNodes[j].textContent.indexOf("user/") === 0) {
							// We have found the right note. Lets ge the count
							for (var k = 0; k < propertyNodes.length && !done; k++) {
								if(propertyNodes[k].getAttribute("name") === "count") {
									unread = parseInt(propertyNodes[k].textContent);
								}
							}
						}
					}
				}
			}
			
			
			// Okay the unread count has been retrieved
			self.unreadCount = unread;
			self.renderButton();
			setTimeout(function() {
				self.updateCount();
			}, refreshMillis);
		});
	};
	
	/**
	* Renders the button and styling in the text
	*/
	self.renderButton = function() {
		if (self.unreadCount === 0 || self.unreadCount === undefined) {
			self.readerButton.text("Reader");
			self.readerButton.css("font-weight", "normal");
		} else {
			self.readerButton.text("Reader (" + self.unreadCount + ")");
			self.readerButton.css("font-weight", "bold");
		}
	};
};


var reader = new Reader();
reader.inject();