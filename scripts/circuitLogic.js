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
	var newNode = {x:randomRange(0,width), y:randomRange(0,height)}
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

