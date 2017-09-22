var map;
var geocoder;
var bounds;
var fromLocation;
var toLocation;
var currentPos;
var circle;
var totalVisitors = 0;
var mapCenter = {lat: 10.315699, lng: 123.885437};
var dynamicMarkers = [];
var type_checked = [];
/*var restaurants = [
    ['Liam Restaurant', 'San Roque, MJ Cuenco, Cebu', 'Location 1 URL','Beef Steak','fastFood'],
    ['Ilocano Restaurant', 'Fuente, Cebu', 'Location 2 URL', 'Pakbet','ethnic'],
    ['Ilongo Restaurant', 'Zapatera, Cebu', 'Location 3 URL','Batchoy', 'casualDining']
];*/

var restaurants = [];

var restaurantRef = [];
var markers = [];
var mapScript = {
    getData: function(){
        var thisLib = this;
         $.getJSON("data.json", function(result){
            restaurants = result;

            /*SET TO OTHER TO PRESERVE THE ORIGINAL DATA FOR FILTER*/
            restaurantRef = restaurants;

            thisLib.initMap();
        });
        
    },
    initMap: function() {
        var thisLib = this;

        //SEARCH BOX
        $('#pac-input').click(function(){
            var search = $('#pac-input').val();
            //alert(search);
            /* $.post('../searchusers.php',{search: search},function(response){
                $('#userSearchResultsTable').html(response);
            }); */
        });
        $('#pac-input').keypress(function(e){
            if(e.which == 13){//Enter key pressed
                //$('#pac-input').click();//Trigger search button click event
                var search = $('#pac-input').val();
                thisLib.seachRestaurant(search);
            }
        });
        
        /*GET CURRENT LOCATION*/
        this.getCurrentLocation();
        
        /*FILTER BY TYPE*/
        $('input#restaurant_type').click(function() {
            
            var val_type = $(this).val();

                if($(this).is(':checked')){
                    type_checked.push(val_type);
                }else{
                    var index = type_checked.indexOf(val_type);
                    if (index > -1) {
                        type_checked.splice(index, 1);
                    }
                }
            
            //var typeFilter = $(this).attr("params");
            thisLib.filterMarkers(type_checked);
        });


        /*GET DIRECTION FORM CURRENT LOCATION*/
        
        $('#getDirection').click(function() {
            var directionsService = new google.maps.DirectionsService;
            //var directionsDisplay = new google.maps.DirectionsRenderer;
            
            var directionsDisplay = new google.maps.DirectionsRenderer({
                draggable: true,
                map: map
                //panel: document.getElementById('right-panel')
            });

            directionsDisplay.addListener('directions_changed', function() {
                thisLib.calculateAndDisplayRoute(directionsDisplay.getDirections());
            });
            thisLib.calculateAndDisplayRoute(directionsService,directionsDisplay);

            //directionsDisplay.setMap(map);
        });

        

        $('#getRadius').click(function() {
            thisLib.drawCircle();
        });
        
        /*SET DEFAULT LOCATION*/
        map = new google.maps.Map(document.getElementById('map'), {
            center: mapCenter,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: true,
            navigationControl: true,
            mapTypeControl: true,
            scaleControl: true,
            draggable: true
        });

        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: mapCenter,
          radius: 1000,
          type: ['restaurant']
        }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    //console.log(results[i]);
                    thisLib.geocodeAddress(results[i]);
                }
            }
        });

        

        google.maps.event.addListener(map, 'click', function(event) {
            thisLib.placeMarker(event.latLng);

        });
        
        google.maps.event.addListener(map,'bounds_changed', function() {
          bounds = new google.maps.LatLngBounds();
          bounds = map.getBounds();
        });

        geocoder = new google.maps.Geocoder();
        /*SET ALL RESTAURANTS FROM DATA*/
        for (i = 0; i < restaurantRef.length; i++) {
            //console.log(restaurants[i]);
            //this.geocodeAddress(restaurantRef[i]);
        }
        
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var marker = new google.maps.Marker({
          position: {lat: 10.315699, lng: 123.885437},
          map: map
        });

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: pyrmont,
          radius: 5000,
          type: ['restaurant']
        }, callback);
        
        /*var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(map);*/

    },
    seachRestaurant: function(val){
        /* var results = [];
        var searchField = "name";
        var searchVal = val.toUpperCase();

        for (var i=0 ; i < restaurants.length ; i++)
        {
            if (restaurants[i][searchField].toUpperCase() == searchVal) {
                results.push(restaurants[i]);
            }
        } */
        
        
            markers.forEach(function(element) {
                var elData = element.title.toUpperCase();
                //console.log(elData,elData.match(/val.toUpperCase().*/));
                if(elData.indexOf(val.toUpperCase()) >= 0){
                    if(element.visible == true && type_checked.length > 0){
                        element.setVisible(true);
                    }else if(type_checked.length == 0){
                        element.setVisible(true);
                    }
                    
                }else{
                    element.setVisible(false);
                }
                
            }, this);
        
        //console.log(results);
    },
    placeMarker: function(location) {
        
        if(circle != null){
            circle.setMap(null);
        }
        //if(dynamicMarkers != ""){
            dynamicMarkers = new google.maps.Marker({
                position: location,
                draggable: true, 
                map: map
            });

            fromLocation = {lat:location.lat(),lng:location.lng()};
        //}
    },
    geocodeAddress: function (locations, i) {
        var id = locations.id;
        var title = locations.name;
        var address = locations.vicinity;
        var url = locations.html_attributions[0];
        var customInfo = locations.specialty;
        var restaurantType = locations.types;
        let thisLib = this;
        let icon = locations.icon;
       /*  geocoder.geocode({
            'address': locations.vicinity
        }, */

        //function (results, status) {
            //console.log(status);
            //if (status == google.maps.GeocoderStatus.OK) {
                var marker = new google.maps.Marker({
                    icon: 'https://www.shareicon.net/data/32x32/2017/02/07/878508_fork_512x512.png',
                    map: map,
                    position: locations.geometry.location,
                    id: id,
                    title: title,
                    type: restaurantType,
                    animation: google.maps.Animation.DROP,
                    address: address,
                    url: url
                });
                
                thisLib.infoWindow(marker, map, title, address, url);
                bounds.extend(marker.getPosition());
                map.fitBounds(bounds);
                //console.log(marker);
                markers.push(marker);
            //} else {
                //alert("geocode of " + address + " failed:" + status);
            //}
        //});
    },
    infoWindow: function(marker, map, title, address, url) {
        var thisLib = this;

        google.maps.event.addListener(marker, 'click', function () {
            
            /*ADD NEW VISITOR*/
            totalVisitors = parseInt(marker.visitor)+1;
            marker.visitor = totalVisitors;
            //totalVisitors = noVisitor;
            /*UPDATE RECORD*/
            thisLib.updateVisitor(marker.id,totalVisitors);
            
            var html = "<div>"+
                        "<h3>" + title + "</h3>"+
                        "<p>" + address + "<br>"+
                        "</div>";
            iw = new google.maps.InfoWindow({
                content: html,
                maxWidth: 350
            });
            //thisLib.drawChart(marker);
            //iw.setContent(node);
            iw.open(map, marker);
            
            var latit = marker.getPosition().lat();
            var longit = marker.getPosition().lng();
            toLocation = {lat:latit,lng:longit};
            
            
            //console.log(latit,longit);
        });
        

    },
    drawChart: function(marker){
        var rowData = [];
        marker.revenue.forEach(function(row){
            rowData.push([row.revMonth,parseInt(row.totalRev)]);
        });
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows(rowData);

        // Set chart options
        var options = {'title':'Revenue of '+marker.title+' @ '+marker.getPosition().toString(),
                    'width':300,
                    'height':200};

        var node        = document.createElement('div'),
            infoWindow  = new google.maps.InfoWindow(),
            chart       = new google.visualization.PieChart(document.getElementById('chart_div'));

            chart.draw(data, options);
            //return node;
            //infoWindow.setContent(node);
            //infoWindow.open(marker.getMap(),marker);
    },
    updateVisitor: function(id,visitor){
        var thisLib = this;
        $.post( "update_data.php", { id: id, type: "visit" })
        .done(function( data ) {
            //$("#msg").html(thisLib.setMessage("No. of Visitors: "+visitor,"success"));
        });
    },
    filterMarkers: function(restaurant_types) {
        //console.log(restaurant_types.indexOf("Apple"))
        markers.forEach(function(element) {
            if(restaurant_types.indexOf(element.type) > -1 ){
                element.setVisible(true);
            }else{
                element.setVisible(false);
            }
        }, this);
    },
    calculateAndDisplayRoute: function(directionsService, directionsDisplay) {
        //directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
        
        //console.log(fromLocation);
        if(fromLocation != undefined && toLocation != undefined){
            directionsService.route({
                origin: fromLocation,
                destination: toLocation,
                travelMode: 'DRIVING',
            }, function(response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                } else {
                window.alert('Directions request failed due to ' + status);
                }
            });
        }else{
            $("#msg").html(this.setMessage("Please select destination","danger"));
        }
    },
    setMessage: function(message,type){
        return '<div class="alert alert-'+ type +' alert-dismissible" role="alert">'+
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
                    '<span aria-hidden="true">&times;</span></button>'+
                    message+
                '</div>'
    },
    getCurrentLocation: function() {

        var infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            currentPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(currentPos);
            infoWindow.setContent('Current Location');
            //infoWindow.open(map);
            map.setCenter(currentPos);
            
            /*SET CURRENT LOCATION FOR VARIABLE*/
            fromLocation = {lat:position.coords.latitude,lng:position.coords.longitude};

          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
    },
    drawCircle: function(){
        var toMeter = 0;
        var radius = $("#radius").val();
        if(radius == ""){
            $("#msg").html(this.setMessage("Please put km Radius","danger"));
            return false;
        }

        if(circle != null){
            circle.setMap(null);
        } 
        
        toMeter = parseInt(radius) * 1000;
        
        var fromCircle = new google.maps.Marker({
            map: map,
            draggable: true,
            position: new google.maps.LatLng(fromLocation.lat, fromLocation.lng),
            title: ''
        });

        circle = new google.maps.Circle({
            map: map,
            radius: toMeter,    //in metres
            fillColor: '#AA0000'
        });
        circle.bindTo('center', dynamicMarkers, 'position');
        
        var circle_bounds = circle.getBounds();
        var marker_found = 0;
        //console.log(circle_bounds.contains(latLngA));
        markers.forEach(function(element) {
            //console.log(google.maps.geometry.poly.containsLocation(element.getPosition(), circle));
            var latLng = new google.maps.LatLng(element.position.lat(), element.position.lng());
            //console.log(latLngA);
            if(circle_bounds.contains(latLng)) marker_found++;
            
        }, this);
        $("#msg").html(this.setMessage(marker_found+" found Restaurant(s) in "+radius+"Km Radius ","success"));
    }

}
google.load('visualization', '1.0', {'packages':['corechart']});                        