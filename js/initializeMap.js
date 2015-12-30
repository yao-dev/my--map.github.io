// var map, departure, arrived, places;
// var monument = [];

// New application
var map, infowindow, departure, arrived;
var markerArray = [];
var service;
var directionsService;
var directionsDisplay;
var geolocationAPI;
var onoff = false;
var paris;
var myLoc;
var namePointInterest = ['monument', 'museum'];
var pointInterest = [];
	pointInterest['all'] = ['monument', 'museum'];
var tabCheckPoint = [];
var travelType = 'DRIVING'
var mode;
var tabParam = [];

function initMap() 
{
	$("#viewRoute").hide();
	paris = {lat: 48.8534100, lng: 2.3488000};

	directionsService = new google.maps.DirectionsService;
	directionsDisplay = new google.maps.DirectionsRenderer;

	document.getElementById('departure').value = "Paris, France";

	// Autocomplétion sur le départ et l'arrivé
	departure = new google.maps.places.Autocomplete((document.getElementById('departure')), {types: ['geocode']});
	arrived = new google.maps.places.Autocomplete((document.getElementById('arrived')), {types: ['geocode']});  

	// Création de la map et centrage sur Paris
	map = new google.maps.Map(document.getElementById('map'), {
	center: paris,
	zoom: 14
	});


	if (typeof sessionStorage != 'undefined') 
	{
		var trajet = sessionStorage.getItem('trajet');
		if (trajet != null) 
		{
			directionsDisplay.setDirections(trajet);
		}
	}	

	// Fullscreen
	var amap = document.getElementById('map');
		$("#full").click(function(e)
		{
			e.preventDefault();
			if (amap.requestFullscreen) {
			  amap.requestFullscreen();
			} else if (amap.mozRequestFullScreen) {
			  amap.mozRequestFullScreen();
			} else if (amap.webkitRequestFullscreen) {
			  amap.webkitRequestFullscreen();
			}		
		});

	infowindow = new google.maps.InfoWindow();

	/* FONCTION POUR CHANGER LA LOCATION SI LA GEOLOC EST ACTIVÉ */
	$( "header input[type=checkbox]" ).on( "click", checked );

	directionsDisplay.setMap(map);

	/* FONCTION POUR AFFICHER LES MONUMENT AU CHARGEMENT DE LA MAP */
	localizePlaces(paris);

	/* FONCTION POUR CHOISIR LE MODE DE NAVIGATION */
	$("#select-action li").click(function()
	{
		$("#select-action li").removeAttr('id');
		$(this).attr('id','selectedParam');
		parameter = $(this).attr('data-option');
		actionParameter(parameter);
	});

	/* FONCTION POUR TRACER UN ITINÉRAIRE D'UN POINT A à B */
	$('#iti').click(function(e)
	{
		e.preventDefault();
		traceDirection(directionsService, directionsDisplay);
		$("#waypoints").css({"height": 430});
		$("#moreDetails").remove();
		$("#buttonNav").append("<input id=moreDetails type=submit value='Voir mon itinéraire'>");
	});

	/* FONCTION POUR TRACER UN PARCOURS A PARTIR DES ETAPE CHOISIS */
	// rajouter un bouton aller retour, quand il est cliqué sa efface l'arrivé s'il y'en à une sinon le depart devient aussi l'arrivé
	$('#options').on('click', '#viewDirection' ,function(e)
	{
		e.preventDefault();
		addressArrived = $('#arrived').val();
		if (addressArrived == '')
		{
			alert('Veuillez indiquer une adresse d\'arrivé');
			return false;
		}
		traceDirection(directionsService, directionsDisplay);
		$("#waypoints").css({"height": 430});
		$("#moreDetails").remove();
		$("#buttonNav").append("<input id=moreDetails type=submit value='Voir mon itinéraire'>");
	});

	$("#options").on('click', '#moreDetails', function(e)
	{
		e.preventDefault();
		$("#options p").html("Itinéraire");
		$("#choosePlace").hide();

		$("#wrapPoints").hide();
		$("#buttonNav").empty();
		$("#choosePlace").css({"height": 490, "overflow": "auto"});
		directionsDisplay.setPanel(document.getElementById('viewRoute'));
		$("#viewRoute").show();
		$("#options form").append("<input id=return type=submit value=Retour>");
	});

	$("#options").on('click', '#return', function(e)
	{
		e.preventDefault();
		$("#options p").html("Points d'interêts");
		$("#viewRoute").hide();
		$("#choosePlace").show();
		$("#return").remove();
		$("#choosePlace").css({"height": 450});
		$("#buttonNav").append(
			"<input id=viewDirection type=submit value=Rechercher />" + 
			"<input id=moreDetails type=submit value='Voir mon itinéraire'>"
		);
	});
}

function actionParameter(parameter)
{
	addressArrived = $('#arrived').val();
	if (addressArrived == '')
	{
		alert('Veuillez indiquer une adresse d\'arrivé');
		$("#select-action li").removeAttr('id');
		switch (parameter) 
		{
		    case 'save':
				alert('Itinéraire sauvegardé');	
				// sessionStorage
		    break;
		    case 'Transit':
		    	removeLayer(tabParam ,mode);
				mode = new google.maps.TransitLayer();
		  		tabParam.push(mode);	
		    	travelType = 'TRANSIT';
		  		mode.setMap(map);
		    break;
		    case 'Bicycling':
		    	removeLayer(tabParam ,mode);
				mode = new google.maps.BicyclingLayer();
		  		tabParam.push(mode);	
		    	travelType = 'BICYCLING';
		  		mode.setMap(map);
		    break;
		    case 'Driving':
		    	removeLayer(tabParam ,mode);
				mode = new google.maps.TrafficLayer();
		  		tabParam.push(mode);	
		    	travelType = 'TRAFFIC';
		  		mode.setMap(map);
		    break;
		    case 'Walking':
		    	removeLayer(tabParam ,mode);
		    	travelType = 'WALKING';
		    break;
		}	
	} else {

		switch (parameter) 
		{
		    case 'save':
				alert('Itinéraire sauvegardé');	
				// sessionStorage
		    break;
		    case 'Transit':
		    	removeLayer(tabParam ,mode);
				mode = new google.maps.TransitLayer();
		  		tabParam.push(mode);	
		    	travelType = 'TRANSIT';
		  		mode.setMap(map);
				traceDirection(directionsService, directionsDisplay);
		    break;
		    case 'Bicycling':
		    	removeLayer(tabParam ,mode);
				mode = new google.maps.BicyclingLayer();
		  		tabParam.push(mode);	
		    	travelType = 'BICYCLING';
		  		mode.setMap(map);
				traceDirection(directionsService, directionsDisplay);
		    break;
		    case 'Driving':
		    	removeLayer(tabParam ,mode);
				mode = new google.maps.TrafficLayer();
		  		tabParam.push(mode);	
		    	travelType = 'DRIVING';
		  		mode.setMap(map);
				traceDirection(directionsService, directionsDisplay);
		    break;
		    case 'Walking':
		    	removeLayer(tabParam ,mode);
		    	travelType = 'WALKING';
				traceDirection(directionsService, directionsDisplay);
		    break;
		}	
	}
}

function removeLayer(tabParam, mode)
{
	for (var i = 0; i < tabParam.length; i++) 
	{
		mode.setMap(null);
	}
}

function checked()
{
	if (onoff === false) 
	{
		onoff = true;
		cleanMarker();
		geolocationAPI = navigator.geolocation;
		geolocationAPI.getCurrentPosition(successfunction, errorfunction);
	}
	else
	{
		onoff = false;
		cleanMarker();
		$('#departure').attr('disabled', true);
		$('#departure').val('Paris, France');
		centerMap(map, paris, 14);
		localizePlaces(paris);
	}
}

function traceDirection(directionsService, directionsDisplay)
{
  var waypts = [];
  var checkboxArray = document.getElementById('waypoints');
  for (var i = 0; i < checkboxArray.length; i++) {
    if (checkboxArray.options[i].selected) {
      waypts.push({
        location: checkboxArray[i].value,
        stopover: true
      });
    }
  }

  directionsService.route({
    origin: document.getElementById('departure').value,
    destination: document.getElementById('arrived').value,
    waypoints: waypts,
    travelMode: google.maps.TravelMode[travelType]
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      sessionStorage.setItem('trajet', response);
      map.setZoom(14);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });	
}

function localizePlaces(pos)
{	
	service = new google.maps.places.PlacesService(map);

	var request = {
	bounds: map.getBounds(),		
	location: pos,
	radius: 2500,
	keyword: pointInterest['all']
	};

	service.radarSearch(request, callback);	
}

function callback(results, status)
{
	if (status !== google.maps.places.PlacesServiceStatus.OK) 
	{
		console.error(status);
		return;
	}
    for (var i = 0; i < results.length; i++) 
    {
    	getPlace(i, results[i].place_id);
	}	
}

function getPlace(number, place_id){
	$.post('/JavaScript_Avance_my_maps/place.php',{ place_id: place_id}).done(function(data){
		var data = JSON.parse(data);
		var refused = false;

		$.each(data, function(key, value)
		{
		    for (var i = 0; i < data.result.types.length; i++) 
		    {
				if (data.result.types[i] == "lodging") 
				{
					refused = true;
					break;
				}
			}				

		});

		if (refused === false)
		{
			createMarker(data.result);
			displayListMonument(number, data.result);
		}			
	});
}

// function getInfoPlace()
// {
// 	name = place.name;
// 	type = place.type[0];
// 	location = place.formatted_address;
// 	phone = place.formatted_number;
// }

function createMarker(place) {
	// getInfoPlace(place);

	var placeLoc = place.geometry.location;

	var img = {
	  url: place.icon,
	  size: new google.maps.Size(32, 32),
	  origin: new google.maps.Point(0, 0),
	  anchor: new google.maps.Point(0, 32),
	  scaledSize: new google.maps.Size(25, 25)
	};

	var marker = new google.maps.Marker({
	map: map,
	position: placeLoc,
	icon: img,
	animation: google.maps.Animation.DROP,    
	title: place.name
	});

	markerArray.push(marker);

	google.maps.event.addListener(marker, 'click', function() {
	infowindow.setContent(place.name);
	infowindow.open(map, this);
	});
}	

function displayListMonument(number, data)
{
	var addressPlace = data.formatted_address;

    tabCheckPoint.push(addressPlace);
    
	$('#waypoints').append('<option class=waypoints-'+ number +'>' + data.name + '</option>');
	$('.waypoints-' + number).attr('value', addressPlace);
}

function errorfunction(error)
{
    console.log(error);
    alert('Un problème est survenu lors de la géolocalisation.');
}
function successfunction(position)
{
    myLatitude = position.coords.latitude;
    myLongitude = position.coords.longitude;
    getAddress();
}

function getAddress()
{
    var latlng = new google.maps.LatLng(myLatitude, myLongitude);
    geocoder = new google.maps.Geocoder();
    geoOptions = {
        "latLng" : latlng
    };
    geocoder.geocode( geoOptions, function(results, status) 
    {
        /* Si les coordonnées ont pu être geolocalisées */
        if (status == google.maps.GeocoderStatus.OK) 
        {
            var address = results[0].formatted_address;
            centerMap(map, latlng, 14);
            addMarker(map, address, latlng);
            document.getElementById('departure').value = address;

			localizePlaces(latlng);
        } 
        else 
        {
            alert("Les nouvelles coordonnées n'ont pu être géocodées avec succès.");
        }
    });
}

function centerMap(map, coords, zoom)
{
    map.panTo(coords);
    map.setZoom(zoom);
}

function addMarker(map, body, location) 
{
	var img = {
	  url: './img/moi.png',
	  size: new google.maps.Size(32, 32),
	  origin: new google.maps.Point(0, 0),
	  anchor: new google.maps.Point(0, 32)
	};
	  
    myLoc = new google.maps.Marker({
        map : map, 
        position : location,
        title: 'Je suis ici',
        icon: img,
        animation: google.maps.Animation.BOUNCE,
        draggable : false
    });

    markerArray.push(myLoc);

    var infowindow = new google.maps.InfoWindow({
        content : body
    });

    new google.maps.event.addListener(myLoc, "click", function() {
        infowindow.open(map, myLoc);
    });
}



function cleanMarker() 
{
	for (var i = 0; i < markerArray.length; i++) 
	{
		markerArray[i].setMap(null);
	}

	markerArray = [];
}

function removeList()
{
	$('#waypoints').empty();
}


