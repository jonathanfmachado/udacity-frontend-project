// Model
var Location = function (description, latitude, longitude) {
    this.description = ko.observable(description);
    this.latitude = ko.observable(latitude);
    this.longitude = ko.observable(longitude);
}

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
                return stringStartsWith(loc.description(), self.currentFilter());
            });
            return result;
        }
    });

    this.filterLocations.subscribe(function (filter_array) {
        for (var i = 0; i < markers.length; i++) {
            markers[0];
            exist = false;
            for (var j = 0; j < filter_array.length; j++) {
                if (markers[i].title == filter_array[j].description()) {
                    exist = true;
                    markers[i].setMap(map);
                }
            };
            if (!exist) {
                markers[i].setMap(null);
            };
        };
    });
}

// Checks if a given string 'starts with' a second given string
var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length).toLowerCase() === startsWith.toLowerCase();
};

var selected_marker;
function selectMarker(element) {
    var self = this;

    for (var i = 0; i < markers.length; i++) {
        if (markers[i].title == element.text) {
            google.maps.event.trigger(markers[i], 'click');
        }
    };
};

// Google Maps API
var map; // Global map variable

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 47.58413, lng: 13.53086 },
        zoom: 10
    });

    addMarkers(app_view.filterLocations())
}

var markers = [];
function addMarkers(loc_array) {

    //var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < loc_array.length; i++) {
        // Get the position
        var lat = loc_array[i].latitude();
        var lng = loc_array[i].longitude();
        var title = loc_array[i].description();

        var marker = new google.maps.Marker({
            map: map,
            position: { lat: lat, lng: lng },
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        //bounds.extend(markers[i].position);

        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
            var self = this;
            getFlickerImages(this);


        });
    };
    // Extend the boundaries of the map for each marker
    //map.fitBounds(bounds);

};


app_view = new AppViewModel()
ko.applyBindings(app_view);



$(document).ready(function () {
    $('[data-toggle=offcanvas]').click(function () {
        $('.row-offcanvas').toggleClass('active');
    });
});



function getFlickerImages(marker) {
    url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6dcfd1ef636ddcf410d67ebfa3acefe1&per_page=3&nojsoncallback=1&format=json&text=' + marker.title;
    $.ajax({
        url: url, success: function (result) {
            image_url_array = []
            img_string = ''
            $.each(result.photos.photo, function(){
                url = 'https://farm'+this.farm+'.staticflickr.com/'+this.server+'/'+this.id+'_'+this.secret+'_s.jpg';
                img_string+= '<img src="'+url+'" width="42" height="42">';
            });
            
            var infowindow = new google.maps.InfoWindow({
                content: '<h5>' + marker.title + '</h5>' + img_string + '<p>Images by <a href="https://www.flickr.com"> Flicker</p>'
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 750); // maps duration of one bounce
            infowindow.open(map, marker);

        }
    });
}