// Function to handle mouseover event
function handleMouseOverCountry(event, item) {
  console.log(item);
  updateCountry(item, "red");
  updateCountry(selectedCountry, "green");
  updateRegion(selectedRegion, "green");
}

// Function to handle mouseout event
function handleMouseOutCountry(event, item) {
  updateCountry(item, "black");
  updateCountry(selectedCountry, "green");
  updateRegion(selectedRegion, "green");
}

// Function to handle click event
function handleClickCountry(event, item) {
  if (selectedCountry === 0) {
    if (selectedRegion !== 0) {
      updateRegion(selectedRegion, "black");
      selectedRegion = 0;
    }
    updateCountry(item, "green");
    selectedCountry = item;
  } else if (d3.select(this).attr("stroke") === "green") {
    updateCountry(item, "black");
    selectedCountry = 0;
  } else {
    updateCountry(selectedCountry, "black");
    updateCountry(item, "green");
    selectedCountry = item;
  }
}

// Function to update stroke of matching elements
function updateCountry(item, color) {
  if(item !== 0) {
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
      .raise();
  }
}

function handleMouseOverRegion(event, item) {
  updateRegion(item, "red");
  updateCountry(selectedCountry, "green");
  updateRegion(selectedRegion, "green");
}

function handleMouseOutRegion(event, item) {
  updateRegion(item, "black");
  updateCountry(selectedCountry, "green");
  updateRegion(selectedRegion, "green");
}

function handleClickRegion(event, item) {
  if (selectedRegion === 0) {
    if (selectedCountry !== 0) {
      updateCountry(selectedCountry, "black");
      selectedCountry = 0;
    }
    updateRegion(item, "green");
    selectedRegion = item;
  } 
  else if (d3.select(item).attr("stroke") === "green") {
    updateRegion(item, "black");
    selectedRegion = 0;
  } 
  else {
    updateRegion(selectedRegion, "black");
    updateRegion(item, "green");
    selectedRegion = item;
  }
}

function updateRegion(item, color) {
  if (item !== 0) { 
    region = d3.select(item).attr("region");
    d3.select(item).attr("stroke", color);
    d3.selectAll(".circle.data").each(function (d) {
      if(d.region===region) {
        updateCountry(d, color);
      }
    });
  }
}