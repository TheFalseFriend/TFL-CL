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

var zDepressed = false
var ctrlDepressed = false;

// line displayed when dragging new nodes
var drag_line = svgWorkbenchArea.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');


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


var force = d3.layout.force()
    .size([width, height])
    .nodes([]) // initialize with a single node
    .links([])
    .linkDistance(200)
    .gravity(0)
    .charge(-20)
    .chargeDistance(50)
    .on("tick", tick);

var nodes = force.nodes(),
    links = force.links(),
    node = svgWorkbenchArea.selectAll('use'),
    link = svgWorkbenchArea.selectAll('.link');



function tick() {
     link.attr("x1", function(d) { return getEntryExitPoint(d.source,'out')[0]; })
           .attr("y1", function(d) { return getEntryExitPoint(d.source,'out')[1]; })
           .attr("x2", function(d) { return getEntryExitPoint(d.target,'in')[0]; })
           .attr("y2", function(d) { return getEntryExitPoint(d.target,'in')[1]; });

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


var mouseDownNode = null;
var mouseUpNode = null;

var leavingXPts = {'andGate' : 34, 'orGate' : 45, 'notGate' : 30, 'oneInput' : 0, 'zeroInput' :0};
var leavingYPts = {'andGate' : 20.1, 'orGate' : 20.5, 'notGate' : 20.5, 'oneInput' : 0, 'zeroInput' : 0};

var enteringXPts = {'andGate' : 0, 'orGate' : 8, 'notGate' : 0};
var enteringYPts = {'andGate' : 20.1, 'orGate' : 20.5, 'notGate' : 20.5};


function getEntryExitPoint(gate, inout) {
    if(inout == 'out') {
        var x = leavingXPts[gate.type] + gate.x;
        var y = leavingYPts[gate.type] + gate.y ;
        return [x,y];
    } else if(inout == 'in') {
        var x = enteringXPts[gate.type] + gate.x;
        var y = enteringYPts[gate.type] + gate.y ;
        return [x,y];
    }
}

function restart() {

    link = link.data(links);
    link.enter().append('line')
        .attr('class', 'connection');

    node = node.data(nodes);

    node.enter().append('use')
        .attr('xlink:href', function(d) { return 'svgs/gateSVGS.svg#' + d.type + 'Glyph'; })
        .attr('id', function(d) {return d.id})
        .on('mouseup', function(d) {
            if(!mouseDownNode) return;

            mouseUpNode = d;

            drag_line.classed('hidden', true);

            if(mouseDownNode === mouseUpNode) { return; }

            var newLink;

            newLink = { source: mouseDownNode, target:mouseUpNode };

            links.push(newLink);

            mouseDownNode = null;
            mouseUpNode = null;
            restart();

        })
        .on('mousedown', function(d) {
            if(ctrlDepressed) return;


            var lineLeavePt = getEntryExitPoint(d,'out');
            mouseDownNode = d;

            if(d.type == 'zeroInput' && zDepressed) {
                svgWorkbenchArea.select('#' + d.id)
                    .attr('xlink:href', 'svgs/gateSVGS.svg#oneInputGlyph')
                d.type = 'oneInput'
                return
            } else if (d.type == 'oneInput' && zDepressed) {
                svgWorkbenchArea.select('#' + d.id)
                    .attr('xlink:href', 'svgs/gateSVGS.svg#zeroInputGlyph')
                d.type = 'zeroInput'
                return
            }

            drag_line
                .style('marker-end', 'url(#end-arrow)')
                .classed('hidden', false)
                .attr('d', 'M' + lineLeavePt[0] + ',' + lineLeavePt[1] + 'L' + lineLeavePt[0] + ',' + lineLeavePt[1]);

            restart();
        });
    force.start();
}

function clearWorkbench() {
    svgWorkbenchArea.selectAll('use').remove();
    svgWorkbenchArea.selectAll('line').remove();
}


var inputTerminalCount = 0

function mDownOnCanvas() {
    console.log('outer')
    if(ctrlDepressed || mouseDownNode) return;
    console.log('inner')
    var point = d3.mouse(this)
    var newNode = { x: point[0],
        y: point[1],
        id: 'input_'+ inputTerminalCount,
        inputs:'START',
        outputVal: 1,
        outputLine: null,
        type: 'oneInput'
    };
    inputTerminalCount++;
    nodes.push(newNode)
    restart()

}

function mMoveOnCanvas() {
    if(!mouseDownNode) return;

    var leavePt = getEntryExitPoint(mouseDownNode, 'out');
    // update drag line
    drag_line.attr('d', 'M' + leavePt[0] + ',' + leavePt[1] + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

    restart();

}

function mUpOnCanvas() {
    if(mouseDownNode) {

        // hide drag line
        drag_line
            .classed('hidden', true)
            .style('marker-end', '');
    }
    mouseDownNode = null
}

var lastKeyDown = -1

function keydown() {

    if(lastKeyDown != -1) return

    lastKeyDown = d3.event.keyCode
    if (d3.event.ctrlKey) {
        ctrlDepressed = true;
        node.call(force.drag);
    } else if(d3.event.keyCode === 90) {
        zDepressed = true;
    }

}

function keyup() {

    lastKeyDown = -1;

    if (d3.event.keyCode === 17) { // ctrl
        ctrlDepressed = false;
        node.on('mousedown.drag', null);
    } else if(d3.event.keyCode === 90) {
        zDepressed = false;
        mouseDownNode = null
    }
}

svgWorkbenchArea.on('mousedown', mDownOnCanvas)
    .on('mouseup', mUpOnCanvas)
    .on('mousemove', mMoveOnCanvas);

d3.select(window)
    .on('keydown', keydown)
    .on('keyup', keyup);

restart();



