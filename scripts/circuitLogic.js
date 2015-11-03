var svgWorkbenchArea = d3.select('#svgDrawArea')
	            .attr('width', $('#buildArea').width())
	            .attr('height',  $('#buildArea').height());

	    

	    	var drag = d3.behavior.drag()
	    		.on('drag', gateMoved)
	    		.on('dragstart', dragBegun)
	    		.on('dragend', dragEnded);
          

	    	function gateMoved(d) {
	    		var x = d3.event.x;
	    		var y = d3.event.y;

	    		d3.select(this).attr('x',x)
	    					   .attr('y',y);
	    	}

	    	function dragBegun() {
	    		d3.select(this).transition()
			      .ease('elastic')
			      .duration(500)
			      .select('path')
			      .attr('stroke','red')
			      .attr('stroke-width', '6');
	    	}

	    	function dragEnded() {
	    		d3.select(this).transition()
			      .ease('elastic')
			      .duration(500)
			      .selectAll('g')
			      .attr('stroke-width', 1);
	    	}

            // Invoke to add a single gate of type 'gateType' to the workbench area
            function addGate(event) {
            	switch(event.data.gateType) {
            		case 'andGate':
            			svgWorkbenchArea.append('use')
            							.attr('xlink:href','svgs/gateSVGS.svg#andGateGlyph')
            							.attr('x',$('#svgDrawArea').width() / 2)
            							.attr('y',$('#svgDrawArea').height() / 2)
            							.call(drag);
            			break;

            		case 'orGate':
            			svgWorkbenchArea.append('use')
            							.attr('xlink:href','svgs/gateSVGS.svg#orGateGlyph')
            							.attr('x',$('#svgDrawArea').width() / 2)
            							.attr('y',$('#svgDrawArea').height() / 2)
            							.call(drag);
            			break;
            		case 'notGate':
            			svgWorkbenchArea.append('use')
            							.attr('xlink:href','svgs/gateSVGS.svg#notGateGlyph')
            							.attr('x',$('#svgDrawArea').width() / 2)
            							.attr('y',$('#svgDrawArea').height() / 2)
            							.call(drag);
            			break;
            		default:
            			alert('dead')
            			break;
            	}
            }

            function clearWorkbench() {
            	svgWorkbenchArea.selectAll('use').remove();
            }

            $('#addAND').click({ gateType:'andGate' }, addGate)
            $('#addOR').click({ gateType: 'orGate' }, addGate)
            $('#addNOT').click({ gateType: 'notGate' }, addGate)

            $('#executeClear').click(clearWorkbench)