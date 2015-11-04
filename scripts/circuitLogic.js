var width = $('#buildArea').width(),
	height = $('#buildArea').height();

var svgWorkbenchArea = d3.select('#svgDrawArea')
				.attr('oncontextmenu', 'return false;')
	            .attr('width', width)
	            .attr('height', height);

// Register our button handlers 
$('#addAND').click({ gateType:'andGate' }, restart)
$('#addOR').click({ gateType: 'orGate' }, restart)
$('#addNOT').click({ gateType: 'notGate' }, restart)
$('#executeClear').click(clearWorkbench)

ctrlDepressed = false;

d3.select(window)
	.on('keydown', keydown)
	.on('keyup', keyup);



function keydown() {
	if (d3.event.ctrlKey) { ctrlDepressed = true; }
}

function keyup() {
	if (d3.event.keyCode === 17) { // ctrl
		if (mouseDepressed) { svgWorkbenchArea.select('.newConnectionBody').remove(); }
		ctrlDepressed = false; 
	}
}



svgWorkbenchArea.on('mousedown', mousedown)
				.on('mousemove', mousemove)
				.on('mouseup', mouseup);

var newConnectionStartPt = null;
var mouseDepressed = false;
var newConnection = null;

function mousedown() {
	if (ctrlDepressed) {

		mouseDepressed = true;

		var x = d3.mouse(this)[0],
			y = d3.mouse(this)[1];

		newConnectionStartPt=[x,y];

		newConnection = svgWorkbenchArea.append('path')
							.attr('d', 'M ' + newConnectionStartPt[0] + ',' + newConnectionStartPt[1] + ' L ' + newConnectionStartPt[0] + ',' + newConnectionStartPt[1])
							.attr('stroke', 'black')
							.attr('class', 'newConnectionBody');
	}
}

function mousemove() {
	if (ctrlDepressed && mouseDepressed) {
			newConnection.attr('d', 'M ' + newConnectionStartPt[0] + ',' + newConnectionStartPt[1] + ' L ' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
	}
}

function mouseup() {
	if(ctrlDepressed) {
		svgWorkbenchArea.select('.newConnectionBody').remove();
		newConnection = null;
		newConnectionStartPt = null;	
	}
	

	mouseDepressed = false;
}

var force = d3.layout.force()
    .size([width, height])
    .nodes([]) // initialize with a single node
    .linkDistance(30)
    .gravity(0)
    .charge(-20)
    .chargeDistance(50)
    .on("tick", tick);

var nodes = force.nodes(),
    links = force.links(),
    node = svgWorkbenchArea.selectAll(".node"),
    link = svgWorkbenchArea.selectAll(".link");

function tick() {
	// link.attr("x1", function(d) { return d.source.x; })
	//       .attr("y1", function(d) { return d.source.y; })
	//       .attr("x2", function(d) { return d.target.x; })
	//       .attr("y2", function(d) { return d.target.y; });

	node.attr('x', function(d) { return d.x; })
	    .attr('y', function(d) { return d.y; });
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function restart(event) {
	console.log(event.data);
	var newNode = {x:randomRange(0,width-40), y:randomRange(0,height-40)}
	nodes.push(newNode)

	link = link.data(links);

	// link.enter().insert("line", ".node")
 //    	.attr("class", "link");

	node = node.data(nodes);

  	node.enter().append('use')
        	.attr('xlink:href','svgs/gateSVGS.svg#' + event.data.gateType + 'Glyph')
            .call(force.drag);

	force.start();
}

function clearWorkbench() {
	svgWorkbenchArea.selectAll('use').remove();
}

