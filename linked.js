// Function to handle mouseover event
function handleMouseOverCountry(event, item) {
  updateCountry(item, "red");
  updateCountry(selectedCountry, "orange");
  updateRegion(selectedRegion, "orange");
}

// Function to handle mouseout event
function handleMouseOutCountry(event, item) {
  updateCountry(item, "black");
  updateCountry(selectedCountry, "orange");
  updateRegion(selectedRegion, "orange");
}

// Function to handle click event
function handleClickCountry(event, item) {
  if (selectedCountry === 0) {
    if (selectedRegion !== 0) {
      updateRegion(selectedRegion, d3.interpolateBlues(0.6));
      selectedRegion = 0;
    }
    updateCountry(item, "orange");
    selectedCountry = item;
  } else if (d3.select(this).attr("stroke") === "orange") {
    updateCountry(item, "black");
    selectedCountry = 0;
  } else {
    updateCountry(selectedCountry, "black");
    updateCountry(item, "orange");
    selectedCountry = item;
  }
}

// Function to update stroke of matching elements
function updateCountry(item, color) {
  var strokeWidth = 1;
  if(item !== 0) {
    if (color !== "black") {
      strokeWidth = 2;
    }
    d3.selectAll(".data")
      .filter(function (d) {
        // Check if "properties" exist in both item and d objects
        if ("properties" in item) {
          if ("properties" in d) return item.properties.name == d.properties.name;
          else return item.properties.name == d.country;
        } else if ("properties" in d) {
          return item.country == d.properties.name;
        } else {
          return item.country == d.country;
        }
      })
      .attr("stroke", color) // Change the stroke color of the matching elements to color
      .attr("stroke-width", strokeWidth)
      .raise();
  }
}

function handleMouseOverRegion(event, item) {
  updateRegion(item, "red");
  updateCountry(selectedCountry, "orange");
  updateRegion(selectedRegion, "orange");
}

function handleMouseOutRegion(event, item) {
  updateRegion(item, d3.interpolateBlues(0.6));
  updateCountry(selectedCountry, "orange");
  updateRegion(selectedRegion, "orange");
}

function handleClickRegion(event, item) {
  if (selectedRegion === 0) {
    if (selectedCountry !== 0) {
      updateCountry(selectedCountry, "black");
      selectedCountry = 0;
    }
    updateRegion(item, "orange");
    selectedRegion = item;
  } 
  else if (d3.select(item).attr("stroke") === "orange" || d3.select(item).attr("fill") === "orange" ) {
    updateRegion(item, d3.interpolateBlues(0.6));
    selectedRegion = 0;
  } 
  else {
    updateRegion(selectedRegion, "black");
    updateRegion(item, "orange");
    selectedRegion = item;
  }
}

function updateRegion(item, color) {
  if (item !== 0) { 
    //Select regionn of item
    region = d3.select(item).attr("region");

    var mainColor = color;

    if (color === d3.interpolateBlues(0.6)) {
      mainColor = "black"
    }
    //Update line
    d3.select("#LineChart").selectAll(".line").filter(function(d) {
      return d3.select(this).attr("region") === region;
    }).attr("stroke", color).style("z-index", 9999).raise();

    d3.select("#LineChart").selectAll("circle").filter(function(d) {
      return d3.select(this).attr("region") === region;
    }).attr("fill", color).raise();

    //Update boxplot
    d3.select("#boxPlotContainer").selectAll(".box").filter(function(d) {
      return d3.select(this).attr("region") === region;
    }).attr("stroke", mainColor);

    //Update scatter and map
    d3.selectAll(".circle.data").each(function (d) {
      if(d.region===region) {
        updateCountry(d, mainColor);
      }
    });
  }
}