var width = $('#buildArea').width(),
	height = $('#buildArea').height();

var svgWorkbenchArea = d3.select('#svgDrawArea')
				.attr('oncontextmenu', 'return false;')
	            .attr('width', width)
	            .attr('height', height);

// Register our button handlers 
$('#addAND').click({ gateType:'andGate' }, addNewGate)
$('#addOR').click({ gateType: 'orGate' }, addNewGate)
$('#addNOT').click({ gateType: 'notGate' }, addNewGate)
$('#executeClear').click(clearWorkbench)

ctrlDepressed = false;

d3.select(window)
	.on('keydown', keydown)
	.on('keyup', keyup);



function keydown() {
	if (d3.event.ctrlKey) { ctrlDepressed = true; }

	// ctrl - for dragging
	if(d3.event.keyCode === 17) {
		node.call(force.drag);
	}
}

function keyup() {
	if (d3.event.keyCode === 17) { // ctrl
		if (mouseDepressed) { svgWorkbenchArea.select('.newConnectionBody').remove(); }
		ctrlDepressed = false; 
	}
}



svgWorkbenchArea.on('mousedown', mousedown)
				.on('mousemove', mousemove)
				.on('mouseup.t', mouseup);

var newConnectionStartPt = null;
var mouseDownGate = null;
var mouseUpGate = null;
var mouseDepressed = false;
var newConnection = null;
var gateFunctions = {
						'andGate': function(inputs) { 
														for (var index in inputs) {
														    if (inputs[index] == false) return false;
														}
														return true;
													},

						'orGate': function(inputs)  { 
														for (var index in inputs) {
														    if (inputs[index] === true) return true;
														}
														return false;
													},

						'notGate': function(inputs) { if (inputs[0] == true) return false; else return true; }	
					};

var gateCount = 0;
var linkCount = 0;

function mousedown() {
	if (mouseDownGate) return;
	// if (ctrlDepressed) {

	// 	mouseDepressed = true;

	// 	var x = d3.mouse(this)[0],
	// 		y = d3.mouse(this)[1];

	// 	newConnectionStartPt=[x,y];

	// 	newConnection = svgWorkbenchArea.append('path')
	// 						.attr('d', 'M ' + newConnectionStartPt[0] + ',' + newConnectionStartPt[1] + ' L ' + newConnectionStartPt[0] + ',' + newConnectionStartPt[1])
	// 						.attr('stroke', 'black')
	// 						.attr('class', 'newConnectionBody');
	// }
}

function mousemove() {
	if (!mouseDownGate) return;

	newConnection.attr('d', 'M ' + mouseDownGate.x + ',' + mouseDownGate.y + ' L ' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
	restart();
	// if (ctrlDepressed && mouseDepressed) {
	// 		newConnection.attr('d', 'M ' + newConnectionStartPt[0] + ',' + newConnectionStartPt[1] + ' L ' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
	// }
}

function mouseup() {
	// console.log('overall mouseup');
	// if(ctrlDepressed ) {
	// 	svgWorkbenchArea.select('.newConnectionBody').remove();
	// 	mouseDepressed = false;	
	// }
}

var force = d3.layout.force()
    .size([width, height])
    .nodes([]) // initialize with a single node
    .links([])
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

function addNewGate(event) {

	var newNode = { x: randomRange(0,width-40), 
				    y: randomRange(0,height-40), 
				    id: gateCount + '_' + event.data.gateType,
				    inputs:[],
				    outputVal: gateFunctions[event.data.gateType],
				    outputLine: null,
				    type: event.data.gateType
				  };
	nodes.push(newNode);
	gateCount++;
	restart();
}
var firstLink = true; // HAX

function restart() {
	

	

	
	

	link = link.data(links);
	link.enter().append("line")
    	.attr("class", "link");

	node = node.data(nodes);

  	node.enter().append('use')
        	.attr('xlink:href', function(d) { return 'svgs/gateSVGS.svg#' + d.type + 'Glyph'; })
            // .call(force.drag)
            .on('mouseup', function(d) {
            		
            	console.log(mouseDownGate);
            	console.log(mouseUpGate);
            	if (!mouseDownGate) return;

            	mouseUpGate = d;

            	// if (mouseUpGate === mouseDownGate) return; // drag to self

            	if (firstLink) {
	            	var newLink = { source: mouseDownGate, target:mouseUpGate, id: 'link_' + linkCount, value: false }
	            	firstLink = false;
            	} else {
            		var newLink = { source: mouseDownGate, target:mouseUpGate, id: 'link_' + linkCount, value: mouseDownGate.outputVal(mouseDownGate.inputs) }
            		mouseUpGate.inputs = newLink;
            	}
            	
            	linkCount++;
            	links.push(newLink);
            	console.log('connection values: ');
            	$.each(links, function(i,val) { 
            		console.log(val); }
            	);
            	restart();



     //        	console.log(newConnection);
     //        	if (newConnection) {
     //        		var newStartNode = { x:newConnectionStartPt[0],y:newConnectionStartPt[1],fixed:true};
     //        		nodes.push(newStartNode);
     //        		var newInputLine = { source: newStartNode, target: d};
     //        		links.push(newInputLine);
					// link = link.data(links);
					// node = node.data(nodes);
					// node.enter().append('circle')
					// 			.attr('fill','red');
					// link.enter().append('line')
					// 			.attr('fill','red');
					// 			console.log('here');
					// newConnection = null;
					// newConnectionStartPt = null;
            	// }
            })
            .on('mousedown', function(d) {
            	mouseDownGate = d;
            	// console.log(mouseDownGate);
            	newConnection = svgWorkbenchArea.append('path')
							.attr('d', 'M ' + mouseDownGate.x + ',' + mouseDownGate.y + ' L ' + mouseDownGate.x + ',' + mouseDownGate.y)
							.attr('stroke', 'black')
							.attr('class', 'newConnectionBody');
				restart();


            });
	force.start();
}

function clearWorkbench() {
	svgWorkbenchArea.selectAll('use').remove();
}

