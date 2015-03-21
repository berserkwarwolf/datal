
multimarkersUsed = [];
multimarker.prototype = new google.maps.OverlayView();

/** @constructor */
function multimarker(latlong, value, map, joinIntersectedClusters) {
  // Initialize all properties.
  this.marker_ = latlong; // {lat: 444, long:9999}
  this.value_ = value;
  this.map_ = map;
  this.div_ = null;
  this.pathImages = "/media_core/images/nicemarkers/";
  this.sizes = [53, 56, 66, 78, 90];
  this.iconSelected = null;
  this.boundRatio = 2; //radio in degrees for zoom on click cluster
  this.joinIntersectedClusters = (joinIntersectedClusters === undefined) ? true : joinIntersectedClusters;
  // Explicitly call setMap on this overlay.
  this.setMap(this.map_);
}

multimarker.prototype.remove = function(){
	this.setMap(null);
	this.value_ = 0;
	this.map_ = null;
};

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
multimarker.prototype.onAdd = function() {

  var div = document.createElement('div');
  $(div).addClass("clustermarker");
  $(div).css("position","absolute");
  
  //select image by value
  	var icons = [];
  	for (var i=1; i<6; i++) {icons.push(this.pathImages + "m" + i + ".png");}
  	
	ixm = 0;
	count = this.value_;
	if (count > 10000) ixm = 4;
	else if (count > 2000) ixm = 3;
	else if (count > 500) ixm = 2;
	else if (count > 200) ixm = 1;
	this.iconSelected = ixm;
	
  // Create the img element and attach it to the div.
  var img = document.createElement('img');
  img.src = icons[ixm];
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.position = 'absolute';
  div.appendChild(img);

  var p = document.createElement('p');
  p.innerHTML = this.value_;
  $(p).css("z-index", "900");
  $(p).css("text-align", "center");
  $(p).css("font-size", "14px");
  mrg = (this.sizes[this.iconSelected]/2) - 7;
  $(p).css("width", "100%");
  $(p).css("margin", mrg + 'px auto 0');
  $(p).css("color", "black");
  $(p).css("position", "absolute");
  
  this.pValue = p;
  div.appendChild(p);
  this.div_ = div;

  // Add the element to the "overlayLayer" pane.
  /*
  mapPane is the lowest pane and is above the tiles. It may not receive DOM events. (Pane 0).
  overlayLayer contains polylines, polygons, ground overlays and tile layer overlays. It may not receive DOM events. (Pane 1).
  overlayShadow contains the marker shadows. It may not receive DOM events. (Pane 2).
  overlayImage contains the marker foreground images. (Pane 3).
  floatShadow contains the info window shadow. It is above the overlayImage, so that markers can be in the shadow of the info window. (Pane 4).
  overlayMouseTarget contains elements that receive DOM mouse events, such as the transparent targets for markers. It is above the floatShadow, so that markers in the shadow of the info window can be clickable. (Pane 5).
  floatPane contains the info window. It is above all map overlays. (Pane 6).
  */
  
  var panes = this.getPanes();
  //panes.overlayLayer.appendChild(div);
  panes.overlayMouseTarget.appendChild(div);
  
  //set onClick function for clustered marker
  var that = this;
  google.maps.event.addDomListener(this.div_, 'click', function() {
	  try
		  {
		  var newCenter = new google.maps.LatLng(that.marker_.lat, that.marker_.long);
		  
		  }
	  catch(error)
	  	{
		//console.log("Error al centrar");
		//console.log(error);
		
	  	}
	  var z = that.map_.getZoom();
	  var mz = that.map_.maxZoom || 19;
	  if (z < mz) z++;
	  //that.map_.setZoom(z);
	  //that.map_.setCenter(newCenter);
	  //2 in 1, so the events do not duplicate
	  that.map_.setOptions({center: newCenter, zoom: z});
  });
  
};

multimarker.prototype.draw = function() {

	  // We use the south-west and north-east
	  // coordinates of the overlay to peg it to the correct position and size.
	  // To do this, we need to retrieve the projection from the overlay.
	  var overlayProjection = this.getProjection();

	  // Retrieve the south-west and north-east coordinates of this overlay
	  // in LatLngs and convert them to pixel coordinates.
	  // We'll use these coordinates to resize the div.
	  var position = new google.maps.LatLng(this.marker_.lat, this.marker_.long);
	  
	  var sw = overlayProjection.fromLatLngToDivPixel(position);
	  var move = parseInt(this.sizes[this.iconSelected]/2);
	  sw.x = sw.x - move;
	  sw.y = sw.y + move;
	  
	  var position = new google.maps.LatLng(this.marker_.lat, this.marker_.long);
	  var ne = overlayProjection.fromLatLngToDivPixel(position);
	  ne.x = ne.x + move;
	  ne.y = ne.y - move;
	  
	  // Resize the image's div to fit the indicated dimensions.
	  var div = this.div_;
	  div.style.left = sw.x + 'px';
	  div.style.top = ne.y + 'px';
	  div.style.width = (ne.x - sw.x) + 'px';
	  div.style.height = (sw.y - ne.y) + 'px';
	  
	  this.posLeft = sw.x;
	  this.posTop = ne.y;
	  this.posWidth = ne.x - sw.x;
	  this.posHeight = sw.y - ne.y;
	  
	  var isBad = false;
	  if (this.joinIntersectedClusters == true)
		  {
	  //check if this cluster intersect anothers
	    for (h=0; h < multimarkersUsed.length; h++ ){
			  var mu = multimarkersUsed[h];
			  if (this.intersectMe(mu))
			  		{
					  isBad = true;
					  //console.log("HIDDING ONE (" + this.value_ + ")")
					  $(this.div_).hide();
					  //add this value to that cluster
					  mu.value_ = parseInt(mu.value_) + parseInt(this.value_);
					  //and write down
					  mu.pValue.innerHTML = mu.value_;
					  mu.pValue.style.color = "white"
					  break; // don't intersect anymore!
					  }
			  
		  	}
		  }
	  if (isBad == false) 
		  multimarkersUsed.push(this);
	};
	
multimarker.prototype.intersectMe = function(another){
	var mu = another;
	
	/*console.log("COMPARE val " + this.value_ +","+ mu.value_);
	console.log("COMPARE " + this.posLeft +","+ mu.posLeft); 
	console.log("COMPARE " + this.posTop +","+ mu.posTop);
	console.log("COMPARE " + this.posWidth+","+mu.posWidth);
	console.log("COMPARE " + this.posHeight+","+mu.posHeight );*/
	
	if (this.posLeft > mu.posLeft && this.posLeft < (mu.posLeft + mu.posWidth))
	  {
	  if (this.posTop > mu.posTop && this.posTop < (mu.posTop + mu.posHeight))
		  {return true;}
	  }
	
	if ( (this.posLeft + this.posWidth) > mu.posLeft && (this.posLeft + this.posWidth) < (mu.posLeft + mu.posWidth))
	  {
	  if ( (this.posTop + this.posHeight) > mu.posTop && (this.posTop + this.posHeight) < (mu.posTop + mu.posHeight))
		  {return true;}
	  }
	
	if ( (this.posLeft) > mu.posLeft && (this.posLeft) < (mu.posLeft + mu.posWidth))
	  {
	  if ( (this.posTop + this.posHeight) > mu.posTop && (this.posTop + this.posHeight) < (mu.posTop + mu.posHeight))
		  {return true;}
	  }
	
	if ( (this.posLeft + this.posWidth) > mu.posLeft && (this.posLeft + this.posWidth) < (mu.posLeft + mu.posWidth))
	  {
	  if ( (this.posTop ) > mu.posTop && (this.posTop ) < (mu.posTop + mu.posHeight))
		  {return true;}
	  }
	
	return false;
	
};


	
	// The onRemove() method will be called automatically from the API if
	// we ever set the overlay's map property to 'null'.
multimarker.prototype.onRemove = function() {
	  this.div_.parentNode.removeChild(this.div_);
	  this.div_ = null;
	};