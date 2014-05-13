outlets = 2;	// outlets for azimuth and velocity

// Declare the locations of sensors as global variables
var s1, s2, s3, s4;
var TOLERANCE = 0.25;
var abs = Math.abs;

// Callback functions for array mapping
function fixie(val) {
	return val.toFixed(2);
}

function roundie(val) {
	return (Math.round(val / 0.0001) * 0.0001)
}

// Set the sensor locations
function setSensorLocs(ang1, ang2, ang3, ang4, ang5, d1, d2, d3, d4, d5) {
	
	//post("Set locs\n");

	s1 = [d1 * Math.sin(ang1 * Math.PI / 180), d1 * Math.cos(ang1 * Math.PI / 180)];
	s2 = [d2 * Math.sin(ang2 * Math.PI / 180), d2 * Math.cos(ang2 * Math.PI / 180)];
	s3 = [d3 * Math.sin(ang3 * Math.PI / 180), d3 * Math.cos(ang3 * Math.PI / 180)];
	s4 = [d4 * Math.sin(ang4 * Math.PI / 180), d4 * Math.cos(ang4 * Math.PI / 180)];
	s5 = [d5 * Math.sin(ang5 * Math.PI / 180), d5 * Math.cos(ang5 * Math.PI / 180)];
	
	post("Locs = (" + s1.map(fixie) + "), (" + s2.map(fixie) + 
			"), (" + s3.map(fixie) + "), (" + s4.map(fixie) + 
				"), (" + s5.map(fixie) +")\n");
				
}

// Function to calculate the intersection of three circles given the distance output from the sensors
// Returns azimuth and velocity of observer
function localize(d1, d2, d3, d4, d5) {
	
	// post("Test localize\n");

	var pos, angle;
	var vel = 500;
	
	a1 = [d1, s1];
	a2 = [d2, s2];
	a3 = [d3, s3];
	a4 = [d4, s4];
	a5 = [d5, s5];
	
	// Use closest three sensors for triangulation
	dists = [a1, a2, a3, a4, a5];
	dists.sort();
	
	sens01 = dists[0][1];
	r1 = dists[0][0];
	sens02 = dists[1][1];
	r2 = dists[1][0];
	sens03 = dists[2][1];
	r3 = dists[2][0];
	
	/*
	post("sens1 = " + sens01.map(fixie) + ", r = " + r1 + "\n");
	post("sens2 = " + sens02.map(fixie) + ", r = " + r2 + "\n");
	post("sens3 = " + sens03.map(fixie) + ", r = " + r3 + "\n");
	*/
	
	// Calculate intersections for circles from pairs of sensors
	var firstIntcpts = intersection(sens01[0], sens01[1], r1, sens02[0], sens02[1], r2);
	var secondIntcpts = intersection(sens02[0], sens02[1], r2, sens03[0], sens03[1], r3);
	
	//post("Xcpts = " + firstIntcpts + "; " + secondIntcpts +"\n");
	
	firstIntcpts = firstIntcpts.map(roundie);
	secondIntcpts = secondIntcpts.map(roundie);
	
	//firstIntcpts[0] = Math.round(firstIntcpts[0] * 10000) / 10000;
	//firstIntcpts[1] = Math.round(firstIntcpts[1] * 10000) / 10000;
	//secondIntcpts[0] = Math.round(secondIntcpts[0] * 10000) / 10000;
	//secondIntcpts[1] = Math.round(secondIntcpts[1] * 10000) / 10000;
	
	// post("Xcpts 1 = " + firstIntcpts + "\n");
	// post("Xcpts 2 = " + secondIntcpts +"\n");
	
	
	// Find the intersection that is the same for both pairs
	diffX1a = abs(firstIntcpts[0] - secondIntcpts[0]);
	diffY1a = abs(firstIntcpts[1] - secondIntcpts[1]);
	
	diffX1b = abs(firstIntcpts[0] - secondIntcpts[2]);
	diffY1b = abs(firstIntcpts[1] - secondIntcpts[3]);
	
	diffX2a = abs(firstIntcpts[2] - secondIntcpts[0]);
	diffY2a = abs(firstIntcpts[3] - secondIntcpts[1]);
	
	diffX2b = abs(firstIntcpts[2] - secondIntcpts[2]);
	diffY2b = abs(firstIntcpts[3] - secondIntcpts[3]);
	
	if (diffX1a < TOLERANCE && diffY1a < TOLERANCE) {
		pos = [firstIntcpts[0], firstIntcpts[1]];
	} else if (diffX1b < TOLERANCE && diffY1b < TOLERANCE) {
		pos = [firstIntcpts[0], firstIntcpts[1]];
	} else if (diffX2a < TOLERANCE && diffY2a < TOLERANCE) {
		pos = [firstIntcpts[2], firstIntcpts[3]];
	} else if (diffX2b < TOLERANCE && diffY2b < TOLERANCE) {
		pos =  [firstIntcpts[2], firstIntcpts[3]];
	} else {
		pos = false;
	}
	
	angle = Math.atan2(pos[0], pos[1]) * 180 / Math.PI;

	//post("Pos = " + pos + "\n");
	//post("Angle = " + angle + "\n");
	
	if (pos) {
		outlet(0, pos[0]);
		outlet(1, pos[1]);
	} else {
		return false;
	}
		
}

// Function to calculate the intersection points of two circles
function intersection(x0, y0, r0, x1, y1, r1) {
	
	// post("Calculate intersects\n")
	
	var a, dx, dy, d, h, rx, ry;
    var x2, y2;

	// dx and dy are the vertical and horizontal distances between the circle centers.
 	dx = x1 - x0;
    dy = y1 - y0;

    // Determine the straight-line distance between the centers.
    d = Math.sqrt((dy*dy) + (dx*dx));

    // Check for solvability.
    if (d > (r0 + r1)) {
    	// no solution. circles do not intersect.
		return false;
	}
	if (d < Math.abs(r0 - r1)) {
    	// no solution. one circle is contained in the other
		return false;
	}

	// 'point 2' is the point where the line through the circle
	// intersection points crosses the line between the circle
	// centers.  
	
	// Determine the distance from point 0 to point 2.
	a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

	// Determine the coordinates of point 2.
	x2 = x0 + (dx * a/d);
	y2 = y0 + (dy * a/d);

	// Determine the distance from point 2 to either of the intersection points.
	h = Math.sqrt((r0*r0) - (a*a));

	// Now determine the offsets of the intersection points from point 2.
	rx = -dy * (h/d);
	ry = dx * (h/d);

	// Determine the absolute intersection points.
	var xi = x2 + rx;
	var xi_prime = x2 - rx;
	var yi = y2 + ry;
	var yi_prime = y2 - ry;

	//post("int1 = " + xi.toFixed(2) + ", " + yi.toFixed(2) + "\n")
	//post("int2 = " + xi_prime.toFixed(2) + ", " + yi_prime.toFixed(2) + "\n")
	
    return [xi.toPrecision(4), yi.toPrecision(4), xi_prime.toPrecision(4), yi_prime.toPrecision(4)];

}