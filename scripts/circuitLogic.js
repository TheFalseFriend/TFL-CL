var svgWorkbenchArea = d3.select("#buildArea")
				.append("svg")
	            .attr('width', $("#buildArea").width())
	            .attr('height',  $("#buildArea").height());

	    

	    	var drag = d3.behavior.drag()
	    		.on("drag", gateMoved)
	    		.on("dragstart", dragBegun)
	    		.on("dragend", dragEnded);
          

	    	function gateMoved(d) {
	    		var x = d3.event.x;
	    		var y = d3.event.y;

	    		d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
	    	}

	    	function dragBegun() {
	    		d3.select(this).transition()
			      .ease("elastic")
			      .duration(500)
			      .attr("r", 48);
	    	}

	    	function dragEnded() {
	    		d3.select(this).transition()
			      .ease("elastic")
			      .duration(500)
			      .attr("r", 30);
	    	}

            // Invoke to add a single gate of type 'gateType' to the workbench area
            function addGate(event) {
            	svgWorkbenchArea.append("circle")
            		.attr("r", 30)
            		.attr("class", event.data.gateType)
            		.attr("transform", "translate(" + $("#buildArea").width() / 2 + "," +  $("#buildArea").height() / 2 + ")")
            		.call(drag)
            }

            function clearWorkbench() {
            	svgWorkbenchArea.selectAll(".gate").remove();
            }

            $("#addAND").click({ gateType: 'andGate gate' }, addGate)
            $("#addOR").click({ gateType: 'orGate gate' }, addGate)
            $("#addNOT").click({ gateType: 'notGate gate' }, addGate)

            $("#executeClear").click(clearWorkbench)