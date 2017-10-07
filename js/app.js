/*jshint loopfunc:true */

// Model
var Location = function (description, latitude, longitude) {
    this.description = description;
    this.latitude = latitude;
    this.longitude = longitude;
};

// View
var AppViewModel = function () {
    var self = this;

    this.locationArray = ko.observableArray();
    this.currentFilter = ko.observable(); // Property to store the filter

    // Add sample data
    this.locationArray.push(new Location('Lake Hallstatt', 47.55985, 13.64769));
    this.locationArray.push(new Location('Gosau', 47.58413, 13.53086));
    this.locationArray.push(new Location('Salzburg', 47.811195, 13.033229));
    this.locationArray.push(new Location('Bad Aussee', 47.606049, 13.783447));
    this.locationArray.push(new Location('Eisriesenwelt', 47.5030, 13.1902));


    // If filter is null, return all the array, else: filter the objects returned
    this.filterLocations = ko.computed(function () {
        if (!self.currentFilter()) {
            return self.locationArray();
        }
        else {
            var result = ko.utils.arrayFilter(self.locationArray(), function (loc) {
                return loc.description.indexOf(self.currentFilter()) !== -1; // perform a more dynamic / loose filtering of locations
            });
            return result;
        }
    });

    // If filterLocations changes, the markers displayed should also change
    this.filterLocations.subscribe(function (filter_array) {
        for (var i = 0; i < markers.length; i++) {
            exist = false;
            for (var j = 0; j < filter_array.length; j++) {
                if (markers[i].title == filter_array[j].description) {
                    exist = true;
                    markers[i].setVisible(true);
                }
            }
            if (!exist) {
                markers[i].setVisible(false);
            }
        }
    });
};

var selected_marker; // Global var

function selectMarker(element) {
    var self = this;
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].title == element.text) {
            google.maps.event.trigger(markers[i], 'click');
        }
    }
}

// Google Maps API
var map; // Global map variable

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 47.58413, lng: 13.53086 },
        zoom: 10
    });
    // Creates the InfoWindow for the clicked marker
    var infowindow = new google.maps.InfoWindow();

    addMarkers(appView.filterLocations(), infowindow);
}

var markers = [];
function addMarkers(locArray, infowindow) {

    //var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < locArray.length; i++) {
        // Get the position
        var lat = locArray[i].latitude;
        var lng = locArray[i].longitude;
        var title = locArray[i].description;

        var marker = new google.maps.Marker({
            map: map,
            position: { lat: lat, lng: lng },
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);

        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
            var self = this;
            getFlickerImages(this, infowindow);
        });
    }
}

appView = new AppViewModel();
ko.applyBindings(appView);


$(document).ready(function () {
    $('[data-toggle=offcanvas]').click(function () {
        $('.row-offcanvas').toggleClass('active');
    });
});


function getFlickerImages(marker, infowindow) {
    // Request photos to the Flicker API

    // The api_key and format have been hardcoded:
    url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6dcfd1ef636ddcf410d67ebfa3acefe1&per_page=3&nojsoncallback=1&format=json&text=' + marker.title;

    $.ajax({    //By default, all requests are sent asynchronously
        url: url, success: function (result) {
            imgString = '';
            $.each(result.photos.photo, function(){
                url = 'https://farm'+this.farm+'.staticflickr.com/'+this.server+'/'+this.id+'_'+this.secret+'_s.jpg';
                imgString+= '<img src="'+url+'" width="42" height="42">';
            });
            // Creates the InfoWindow for the clicked marker
            infowindow.setContent(
                '<h5>' + marker.title + '</h5>' + imgString + '<p>Images by <a href="https://www.flickr.com"> Flicker</p>'
            );
            // Add animation to the clicked marker
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 750); // maps duration of one bounce
            infowindow.open(map, marker);
        },
        // Data requests that fail are handled gracefully using common fallback techniques (i.e. AJAX error or fail methods)
        error: function (jqXHR, textStatus, errorThrown){
            //A function to be called if the request fails.
            msg = '<div class="alert alert-danger alert-dismissable">'+
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+
            '<strong>Something went wrong :( </strong> Error: '+ textStatus +'</div>';
            $('#feedback-messages').append(msg);

        }
    });
}