
"use strict";

// Get your own API key from https://uwaterloo.ca/api/register
var apiKey = '';

(function(exports) {

	/* A Model class */
    class AppModel {
		constructor() {
			this._observers = [];
		}

        // You can add attributes / functions here to store the data

        // Call this function to retrieve data from a UW API endpoint
        loadData() {
            var that = this;
            $.getJSON("https://api.uwaterloo.ca/v2/foodservices/locations.json"+ "?key=" + apiKey,
                function (data) {
                    // Do something with the data; probably store it
                    // in the Model to be later read by the View.
                    // Use that (instead of this) to refer to the instance 
                    // of AppModel inside this function.
                    that.data = data;
                    that.notify(data); // Notify View(s)
					//alert(data);
                }
            );
        }
		
		// Add observer functionality to AppModel objects:
		
		// Add an observer to the list
		addObserver(observer) {
            this._observers.push(observer);
            //observer.updateView(this, null);
        }
		
		// Notify all the observers on the list
		notify(args) {
            _.forEach(this._observers, function(obs) {
                obs.updateView(this, args["data"]);
            });
        }
    }

    /*
     * A view class.
     * model:  the model we're observing
     * div:  the HTML div where the content goes
     */
    class AppView {
		constructor(model, div) {
			this.model = model;
			this.div = div;
			this.sort_name = null;
			
			model.addObserver(this); // Add this View as an Observer
		}
				
        updateView(obs, args) {
            // Add code here to update the View
			 var table = document.getElementById("menu");
			 var that = this;
			 that.l_f = document.getElementById("loc_filter");
			 if (that.l_f == null){
				 that.l_f = "";
			 } else {
				 that.l_f = that.l_f.value;
			 }
			 that.o_f = document.getElementById("open_filter");
			 if (that.o_f == null){
				 that.o_f = "All";
			 } else {
				 that.o_f = that.o_f.value;
			 }
					
			 $(table).empty();
			 var headers = table.insertRow(0);
			 var name = headers.insertCell(0);
			 name.style.fontWeight = "bolder";			 
			 name.innerHTML = "Name"
			 name.colspan = 2;
			 name.onclick = function () {
				 if (that.sort_name == null){
					 that.sort_name = true;
				 } else  {
					 that.sort_name = !(that.sort_name);
				 }
				// that.sort_name = !(that.sort_name);
				
				 that.updateView(that, that.model.data["data"]);
			};
			
			 
			 
			 var loc = headers.insertCell(1);
			 loc.innerHTML = "Location"
			 loc.style.fontWeight = "bolder";
			 var loc_filter = document.createElement("input");
			 loc_filter.type = "text";
			 loc_filter.id = "loc_filter";
			 loc_filter.style.width = "60px";
			 loc_filter.value = that.l_f;
			 $(loc_filter).keyup(function () {
				var locations = that.model.data["data"];
				loc_filter.focus();
			    that.updateView(that, locations);
				
			 });
			 
			 loc.appendChild(loc_filter);
			 var is_open = headers.insertCell(2);
			 is_open.innerHTML = "Open?!?"
			 is_open.style.fontWeight = "bolder";
			  var open_filter = document.createElement("select");
			
			 open_filter.id = "open_filter";
			 open_filter.style.width = "60px";
			 var opt = document.createElement("option");
			 opt.text = "All";
			 $(open_filter).append(opt);
			 opt = document.createElement("option");
			  opt.text = "Open";
			  $(open_filter).append(opt);
			  opt = document.createElement("option");
			opt.text = "Closed";
			$(open_filter).append(opt);
			 //open_filter.value = that.o_f;
			 open_filter.onchange = function () {
				var locations = that.model.data["data"];
				open_filter.focus();
			    that.updateView(that, locations);
				
			 };
			 		 is_open.appendChild(open_filter);
					 
					 
			 var hrs = headers.insertCell(3);
			 hrs.innerHTML = "Hours"
			 hrs.style.fontWeight = "bolder";
			  args = args.sort(function (a,b){
				 var res = 0;
				 if (that.sort_name == null){
					 
				 return 0;
				 }
				 if (a["outlet_name"] < b["outlet_name"]){
					 res = -1;
				 }else if (a["outlet_name"] > b["outlet_name"]){
						 res = 1;
				 }
				 if (that.sort_name){
					 res = res * -1;
				 }
				 return res;
			 });
			 var l_f = that.l_f;
			 if (!(l_f == null || l_f == "")){
				 
				 args = args.filter(function (build){
					var re = new RegExp(l_f, 'i');
					return !(build["building"].match(re) == null);
					 
				 });
			 }
			 var o_f = that.o_f;
			  if (!(o_f == null || o_f == "All")){
				  var t = false;
				    if (o_f == "Open"){
						t = true;
					}
						
				 args = args.filter(function (b){
					var re = new RegExp(l_f, 'i');
					return (b["is_open_now"] == t);
					 
				 });
			 }
			 //alert(args["outlets"].length);
			 _.forEach(args, function (outlet, index){
				var row = table.insertRow(index + 1);
				//row.rowSpan = "7"
				if (index %2 == 0){
					row.style.backgroundColor = '#FDFEFE'
				} else {
					row.style.backgroundColor = '#2ECC71'
				}
			
			    //Add outlet
				var outlet_name = row.insertCell(0);
				//outlet_name.setAttribute("colspan" ,2);
				outlet_name.align = "left"
				outlet_name.innerHTML = outlet["outlet_name"];
				outlet_name.setAttribute("word-wrap", "break-word");
				//outlet_name.style.backgroundColor = '#4A235A'
				//Add Location
				var loc = row.insertCell(1);
				//loc.setAttribute("colspan" ,7);
				loc.innerHTML = outlet["building"];
				loc.align = "left";
				var hours = outlet["opening_hours"];
				var weekdays = ["Sunday", "Monday" ,"Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
				var today = new Date();
				var actual_day = weekdays[today.getDay()];
				var op = row.insertCell(2);
				if (outlet["is_open_now"]){
					op.innerHTML = 'OPEN';
				} else {
					op.innerHTML = 'CLOSED';
				}
				
				var d = row.insertCell(3);
				
				for (var day in hours) {
					
					d.setAttribute("colspan" ,2);
					var opening = hours[day]["opening_hour"];
					var closing = hours[day]["closing_hour"];
					if (opening == null || closing == null){
						d.innerHTML = d.innerHTML + day + ": CLOSED" + "<br>";
					} else {
						d.innerHTML = d.innerHTML + day + ": " + opening + "-" + closing + "<br>"
					}
					d.align = "left";
				}
				
			 });
			 
			 
        };        
    }

	/*
		Function that will be called to start the app.
		Complete it with any additional initialization.
	*/
    exports.startApp = function() {
        var model = new AppModel();
        var view = new AppView(model, "div#viewContent");
		model.loadData();
    }

})(window);
