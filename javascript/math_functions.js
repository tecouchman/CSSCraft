Math.degToRad = function(deg)
{
	return deg * (Math.PI / 180);
}

Math.pointOnCircle = function(radius, angle)
{
    var z = radius * Math.cos(Math.degToRad(angle));
    var x = radius * Math.sin(Math.degToRad(angle));
    return { x: x, z: z};   
}

Math.maxRad = Math.PI*2;

Math.wrapRad = function(rad)
{		
    if (rad > Math.maxRad)
        rad -= Math.maxRad;
    else if (rad < 0)
        rad += Math.maxRad;
    return rad;
}

Math.lerp = function(from, to, t) {
	return (1-t) * from + t * to;
}