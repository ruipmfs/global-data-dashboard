// Declare global variables to hold data for countries and capita
var globalDataCountries;
var globalDataAttributes;
var globalMeanByRegion;

var selectedRegions = ["All"];
var selectedAttribute = "happiness_score";

let selectedCountry = 0;
let selectedRegion = 0;

let globalYears;
let allRegions = ["Western Europe",
"Southeast Asia",
 "Central and Eastern Europe",
 "Commonwealth of Independent States",
 "East Asia",
 "Latin America and Caribbean",
 "Middle East and North Africa",
 "North America and ANZ",
 "South Asia",
 "Sub-Saharan Africa",
];

// Define margin and dimensions for the charts
const margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 80,
};
const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Function to start the dashboard
function startDashboard() {
  // Helper functions to load JSON and CSV files using D3's d3.json and d3.csv
  function loadJSON(file) {
    return d3.json(file);
  }
  function loadCSV(file) {
    return d3.csv(file);
  }

  // Function to import both files (data.json and gapminder.csv) using Promise.all
  function importFiles(file1, file2, file3, file4) {
    return Promise.all([loadJSON(file1), loadCSV(file2), loadCSV(file3), loadCSV(file4)]);
  }

  // File names for JSON and CSV files
  const file1 = "data.json";
  const file2 = "./datasets/mean_by_country.csv";
  const file3 = "./datasets/mean_by_region.csv";
  const file4 = "./datasets/means_by_region_overall.csv";

  // Import the files and process the data
  importFiles(file1, file2, file3, file4).then(function (results) {
    // Store the JSON data into globalDataCountries using topojson.feature
    globalDataCountries = topojson.feature(results[0], results[0].objects.countries);

    // Store the CSV data into globalDataAttributes
    globalDataAttributes = results[1];

    // Store the CSV region data (for the line chart) into regionDataAttributes
    regionDataAttributes = results[2];

    globalMeanByRegion = results[3];

    // Convert data to numbers
    globalDataAttributes.forEach(function (d) {
      d.happinessscore = +d.happinessscore;
      d.socialsupport = +d.socialsupport;
      d.healthylifeexpectancy = +d.healthylifeexpectancy;
      d.freedomtomakelifechoices = +d.freedomtomakelifechoices;
      d.wellbeingindex = +d.wellbeingindex;
    });

    // Convert data to numbers
    regionDataAttributes.forEach(function (d) {
      d.happinessscore = +d.happinessscore;
      d.socialsupport = +d.socialsupport;
      d.healthylifeexpectancy = +d.healthylifeexpectancy;
      d.freedomtomakelifechoices = +d.freedomtomakelifechoices;
      d.wellbeingindex = +d.wellbeingindex;
    });

    document.querySelectorAll('input[name="choices"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        selectedAttribute = this.id;
        updateCharts(selectedAttribute, selectedRegions);
        console.log("Region: ", selectedRegions);
        console.log("Attribute: ", selectedAttribute);
      });
    });

    document.querySelectorAll('input[name="regions"]').forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
          console.log(this.value);
          if (this.value === "All") {
              if (selectedRegions[0] !== "All") {
                selectedRegions = ["All"];
                document.querySelectorAll('input[name="regions"]').forEach(function (allCheckbox) {
                  allCheckbox.checked = false;
                });
              }
              this.checked = true;
          } else {
              if (selectedRegions.includes(this.value)) {
                  selectedRegions = selectedRegions.filter(region => region !== this.value);
                  this.checked = false;
              } else if (selectedRegions[0] === "All") {
                  selectedRegions = [this.value];
              } else {
                  selectedRegions.push(this.value);
              }
              document.querySelector('input[value="All"]').checked = false; 
          }
          updateCharts(selectedAttribute, selectedRegions);
          console.log("Region: ", selectedRegions);
          console.log("Attribute: ", selectedAttribute);
      });
  });

    //createBoxPlot(globalDataAttributes, 'happiness_score', 'Central and Eastern Europe');
    createBoxPlots();
    createChoroplethMap();
    createLineChart();
    createScatterPlot();
  });
}

// Function to create the choropleth map
function createChoroplethMap() {
  // Filter the data to remove entries with missing incomeperperson values
  currentData = globalDataAttributes.filter(function (d) {
    return d.happinessscore != "";
  });

  const choroplethWidth = 530;
  const choroplethHeight = 350;

  // Create an SVG element to hold the map
  const svg = d3
    .select("#choropleth")
    .append("svg")
    .attr("width", choroplethWidth)
    .attr("height", choroplethHeight);

  // Create a group to hold the map elements
  const mapGroup = svg.append("g");

  // Create a color scale for the happinessscore values
  const colorScale = d3
    .scaleLog()
    .domain([
      d3.min(currentData, (d) => d.happiness_score),
      d3.max(currentData, (d) => d.happiness_score),
    ])
    .range([0, 1]);

  // Create a projection to convert geo-coordinates to pixel values
  const projection = d3
    .geoMercator()
    .fitSize([choroplethWidth, choroplethHeight], globalDataCountries);

  // Create a path generator for the map
  const path = d3.geoPath().projection(projection);

  // Create a tooltip div element
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #000")
    .style("padding", "5px");

  // Add countries as path elements to the map
  mapGroup
    .selectAll(".country")
    .data(globalDataCountries.features)
    .enter()
    .append("path")
    .attr("class", "country data")
    .attr("d", path)
    .attr("stroke", "black")
    .on("mouseover", function (event, d) {
      // Show the tooltip with "abc" when hovering over a country
      tooltip.style("opacity", 0.9);
      tooltip.html("Country: " + d.properties.name + "<br/>Happiness Score: " + getHappinessScore(d.properties.name));
      handleMouseOverCountry(event, d);
    })
    .on("mousemove", function (event) {
      // Update the tooltip position as the mouse moves
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function (event, d) {
      // Hide the tooltip when moving away from the country
      tooltip.style("opacity", 0)
        .style("left", "10px")
        .style("top", "10px");
      handleMouseOutCountry(event, d);
    })
    .on("click", handleClickCountry);

  // Function to get happiness score by country name
  function getHappinessScore(countryName) {
    const data = currentData.find((item) => item.country === countryName);
    return data ? data.happiness_score : "N/A";
}

  // Set the fill color of each country based on its incomeperperson value
  mapGroup
    .selectAll("path")
    .attr("fill", function (d) {
      const countryName = d.properties.name;
      const matchingData = currentData.find((item) => item.country === countryName);
      if (matchingData) {
        return d3.interpolateBlues(colorScale(matchingData.happiness_score));
      } else {
        return "lightgray"; // returns light grey for countries with no data
      }
    });

  // Create zoom behavior for the map
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([
      [0, 0],
      [choroplethWidth, choroplethHeight],
    ])
    .on("zoom", zoomed);

  // Apply zoom behavior to the SVG element
  svg.call(zoom);

  // Function to handle the zoom event
  function zoomed(event) {
    mapGroup.attr("transform", event.transform);
  }

  // Create a legend for the choropleth map
  const svg2 = d3
    .select("#choroplethLabel")
    .append("svg")
    .attr("width", width * 0.2)
    .attr("height", height);

  // Create a gradient for the legend color scale
  const defs = svg2.append("defs");
  const gradient = defs
    .append("linearGradient")
    .attr("id", "colorScaleGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.interpolateBlues(0));

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.interpolateBlues(1));

  // Create the legend rectangle filled with the color scale gradient
  const legend = svg2.append("g").attr("transform", `translate(0, 40)`);
  const legendHeight = height - 40;
  const legendWidth = 20;

  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#colorScaleGradient)");

  legend
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -legendHeight / 2)
    .attr("y", -margin.right + 35)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Happiness Score");

  //Calculate the tick values
  const tickValues = d3.range(0, 1.1, 0.25); // Erzeugt [0, 0.25, 0.5, 0.75, 1]

// Add tick marks and labels to the legend
for (const tick of tickValues) {
  legend
    .append("text")
    .attr("x", legendWidth + 5)
    .attr("y", legendHeight * tick)
    .text(tick.toFixed(2));
}
}

function createBoxPlot(data, attributeId, region, svgGroup) {
  // Filter data for the specified region
  data = data.filter(item => region.includes(item.region));

  // Compute summary statistics used for the box
  var sorted_data = data.map(d => d[attributeId]).sort(d3.ascending);
  var q1 = d3.quantile(sorted_data, 0.25);
  var median = d3.quantile(sorted_data, 0.5);
  var q3 = d3.quantile(sorted_data, 0.75);
  var min = d3.min(sorted_data);
  var max = d3.max(sorted_data);

  var boxplotHeight = 200;
  var boxplotWidth = 50;

  // Create y scale for the boxplot
  const yScale = d3
    .scaleLinear()
    .domain([0, 1]) // Adjust the domain based on your data
    .range([boxplotHeight, 0]);

  // Append and style the main vertical line
  svgGroup
    .append("line")
    .attr("x1", boxplotWidth / 4)
    .attr("x2", boxplotWidth / 4)
    .attr("y1", yScale(min))
    .attr("y2", yScale(max))
    .attr("stroke", "black");

  // Append and style the box
  svgGroup
    .append("rect")
    .attr("x", boxplotWidth / 4 - boxplotWidth / 8)
    .attr("y", yScale(q3))
    .attr("height", yScale(q1) - yScale(q3))
    .attr("width", boxplotWidth / 4)
    .attr("stroke", "black")
    .style("fill", "steelblue");

  // Append and style the min, median, and max lines
  svgGroup
    .selectAll("line.boxplot-lines")
    .data([min, median, max])
    .enter()
    .append("line")
    .attr("class", "boxplot-lines")
    .attr("x1", boxplotWidth / 4 - boxplotWidth / 8)
    .attr("x2", boxplotWidth / 4 + boxplotWidth / 8)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d))
    .attr("stroke", "black");
}

function createBoxPlots() {
  const containerWidth = 700; // Width of the container
  const containerHeight = 200; // Height of each boxplot
  const numBoxPlots = 10; // Number of box plots to create

  const svg = d3
    .select("#boxPlotContainer")
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight)
    .append("g");

  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([containerHeight - 40, 0]);

  // Iterate through the regions and create box plots for each
  const regions = allRegions;

  for (let i = 0; i < numBoxPlots; i++) {
    // Calculate the Y position for each box plot
    const xPos = i * 50;

    // Create a group for each box plot and translate it to the appropriate position
    const boxPlotGroup = svg
      .append("g")
      .attr("transform", `translate(${xPos + margin.left},${margin.top})`);

    if (i === 0) {
      // Append the Y axis to each box plot
      boxPlotGroup
        .append("g")
        .attr("class", "y-axis")
        .call(
          d3
            .axisLeft(yScale)
            .tickFormat(d3.format(".1f"))
            .tickSizeOuter(0)
      );

      // Append Y axis labels to each box plot
      boxPlotGroup
        .append("text")
        .attr("class", "y-axis-label")
        .attr("x", -containerHeight / 2 + 15)
        .attr("y", -margin.left + 30)
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Happiness Score");
    }

    // Create a box plot for the current region
    const region = regions[i];
    createBoxPlot(globalDataAttributes, 'happiness_score', region, boxPlotGroup);
  }
}

// Function to create the scatter plot
function createScatterPlot() {
  // Filter the data to remove entries with missing incomeperperson or alcconsumption values
  currentData = globalDataAttributes.filter(function (d) {
    return d.gdp_per_capita != "" && d.happiness_score != "" && d.generosity != "";
  });

  //const width = 350 - margin.left - margin.right;
  //const height = 280 - margin.top - margin.bottom;

  // Create an SVG element to hold the scatter plot
  const svg = d3
    .select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create x and y scales for the scatter plot
  const xScale = d3
    .scaleLinear()
    .domain([0, 2])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

  // Create a color scale based on the "generosity" attribute
  const colorScale = d3
    .scaleLinear()
    .domain([
      d3.min(currentData, (d) => d.generosity),
      d3.max(currentData, (d) => d.generosity),
    ])
    .range([d3.interpolateCool(0), d3.interpolateCool(1)]);

  // Create a tooltip div element
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #000")
    .style("padding", "5px");

  // Add circles to the scatter plot representing each country
  svg
    .selectAll(".circle")
    .data(currentData, (d) => d.country)
    .enter()
    .append("circle")
    .attr("class", "circle data")
    .attr("cx", (d) => xScale(d.gdp_per_capita))
    .attr("cy", (d) => yScale(d.happiness_score))
    .attr("r", 5)
    .attr("fill", (d) => colorScale(d.generosity))
    .attr("stroke", "black")
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 0.9);
      tooltip.html("Country: " + d.country + "<br/>Happiness Score: " + d.happiness_score + "<br/>GDP per Capita: " + d.gdp_per_capita + "<br/>Generosity: " + d.generosity);
      handleMouseOverCountry(event, d);
    })
    .on("mousemove", function (event) {
      // Update the tooltip position as the mouse moves
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function (event, d) {
      // Hide the tooltip when moving away from the country
      tooltip.style("opacity", 0)
        .style("top", "10px")
        .style("left", "10px");
        handleMouseOutCountry(event, d);
    })
    .on("click", handleClickCountry);
    
    // Function to handle mouseout event
    //.on("mouseover", handleMouseOver) // Function to handle mouseover event
    //.on("mouseout", handleMouseOut)   // Function to handle mouseout event
  

  // Create tick marks and labels for the x and y axes
  var xTicks = [];
  var yTicks = [];
  for (let index = 0; index <= 1; index += 0.25) {
    xTicks.push(Math.round(xScale.invert(index * width)));
    yTicks.push(Math.round(yScale.invert(index * height)));
  }

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat((d) => d)
        .tickValues(xTicks)
        .tickSizeOuter(0)
    );

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat((d) => d));;
  
  // Add labels for the x and y axes
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 20)
    .style("text-anchor", "middle")
    .text("GDP per Capita");

  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Happiness Score");
  
  // Create a legend for the scatterPlot
  const svg2 = d3
    .select("#scatterPlot")
    .append("svg")
    .attr("width", width * 0.35)
    .attr("height", height + 45);

  // Create a gradient for the legend color scale
  const defs = svg2.append("defs");
  const gradient = defs
    .append("linearGradient")
    .attr("id", "colorScale")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.interpolateCool(0));

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.interpolateCool(1));

  // Create the legend rectangle filled with the color scale gradient
  const legend = svg2.append("g").attr("transform", `translate(0, 40)`);
  const legendHeight = height - 60;
  const legendWidth = 20;

  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#colorScale)");

  // Calculate the tick values
  const tickValues = d3.range(0, 1.1, 0.25); // Erzeugt [0, 0.25, 0.5, 0.75, 1]

  // Add tick marks and labels to the legend
  for (const tick of tickValues) {
    legend
      .append("text")
      .attr("x", legendWidth + 5)
      .attr("y", legendHeight * tick)
      .text(tick.toFixed(2));
  }

  legend
      .append("text")
      .attr("x", legendWidth - 20)
      .attr("y", legendHeight - 300)
      .text("Generosity");
}

function createLineChart() {
  const regions = allRegions;

  // Filter for data from a region apart from "Africa" (because Africa has less record years)
  const asiaData = regionDataAttributes.filter((d) => d.region === regions[0]);

  // Create years array that is used for the y-axis
  const years = asiaData.map((d) => +d.year); 
  globalYears = years;

  // Set the sizes of the line chart
  const lineChartWidth = 570 - margin.left - margin.right;
  const lineChartHeight = 300 - margin.top - margin.bottom;

  // Create an SVG-element for the line chart
  const svg = d3
    .select("#LineChart")
    .append("svg")
    .attr("width", lineChartWidth + margin.left + margin.right + 100)
    .attr("height", lineChartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create x- and y-scales
  const xScale = d3.scaleLinear()
    .domain([d3.min(years), d3.max(years)])
    .range([0, lineChartWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([lineChartHeight, 0]);

  // Create a line-generator-function
  const line = d3.line()
    .x((d, i) => xScale(years[i]))
    .y((d, i) => yScale(d));

// Create a group for each region
regions.forEach((region, index) => {
const regionData = regionDataAttributes.filter(d => d.region === region);
const happinessScores = regionData.map(d => +d.happiness_score);

const lineGroup = svg.append("g");

// Create a tooltip div element
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background", "white")
  .style("border", "1px solid #000")
  .style("padding", "5px");

  lineGroup.append("path")
    .datum(happinessScores)
    .attr("class", "line")
    .attr("d", line)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("region", region)
    .on("mouseover", function (event) {
      // Show the tooltip when hovering over a country
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html("Region: " + region);

      handleMouseOverRegion(event, this);
    })
    .on("mousemove", function (event) {
      // Update the tooltip position as the mouse moves
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function (event) {
      // Hide the tooltip when moving away from the country
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      handleMouseOutRegion(event, this);
    })
    .on("click", function(event) {
      handleClickRegion(event, this);
    });
});

  // Add x-axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${lineChartHeight})`)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format("d")));

  // Add y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

  // Add labels to axis
  svg.append("text")
    .attr("class", "x-axis-label")
    .attr("x", lineChartWidth / 2)
    .attr("y", lineChartHeight + 30)
    .style("text-anchor", "middle")
    .text("Year");

  svg
  .append("text")
  .attr("class", "y-axis-label")
  .attr("x", -lineChartHeight / 2)
  .attr("y", -margin.left + 30)
  .style("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Happiness Score");
}

// Function to update the charts based on the selected attribute
function updateCharts(attributeId, regionName) {
  // Update the title of the choropleth map
  d3.select("#choroplethTitle")
  .text(attributeId)

  updateChoroplethMap(attributeId, regionName);
  updateScatterPlot(attributeId, regionName);
  updateLineChart(attributeId, [regionName]);
}

function updateChoroplethMap(attributeName, regions) {
    const currentData = globalDataAttributes.filter(function (d) {
      return d[attributeName] !== "";
    });

    // Create a color scale for the happinessscore values
  const colorScale = d3
    .scaleLog()
    .domain([
      d3.min(currentData, (d) => d.attributeName),
      d3.max(currentData, (d) => d.attributeName),
    ])
    .range([0, 1]);
}

function updateLineChart(attributeName, regionNames) {

  const currentData = globalDataAttributes.filter(function (d) {
    return d[attributeName] !== "" && (regionNames.includes('All') || regionNames.includes(d['region']));
  });

  if (regionNames.includes('All')) {
    regionNames = allRegions;
  }

  // Lösche das vorhandene Line-Chart, wenn es existiert
  d3.select("#LineChart").select("svg").remove();

  // Set the sizes of the line chart
  const lineChartWidth = 600 - margin.left - margin.right;
  const lineChartHeight = 200 - margin.top - margin.bottom;

  // Create an SVG-element for the line chart
  const svg = d3
    .select("#LineChart")
    .append("svg")
    .attr("width", lineChartWidth + margin.left + margin.right + 100)
    .attr("height", lineChartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create x- and y-scales
  const xScale = d3.scaleLinear()
    .domain([d3.min(globalYears), d3.max(globalYears)])
    .range([0, lineChartWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([lineChartHeight, 0]);

  // Create a line-generator-function
  const line = d3.line()
    .x((d, i) => xScale(globalYears[i]))
    .y((d, i) => yScale(d));

// Create a group for each region
regionNames.forEach((region, index) => {
const regionData = regionDataAttributes.filter(d => d.region === region);
const attributeValues = regionData.map(d => +d[attributeName]);

const lineGroup = svg.append("g");

// Create a tooltip div element
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background", "white")
  .style("border", "1px solid #000")
  .style("padding", "5px");

  lineGroup.append("path")
    .datum(attributeValues)
    .attr("class", "line")
    .attr("d", line)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .on("mouseover", function (event, d) {
      // color stroke of line red when mouse over
      d3.select(this).attr("stroke", "red");

      // Show the tooltip with "abc" when hovering over a country
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html("Region: " + region);
    })
    .on("mousemove", function (event) {
      // Update the tooltip position as the mouse moves
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function (d) {
      // Hide the tooltip when moving away from the country
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      // set red colored line back when mouse out
      d3.select(this).attr("stroke", "black");
    });
});

  // Add x-axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${lineChartHeight})`)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format("d")));

  // Add y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

  // Add labels to axis
  svg.append("text")
    .attr("class", "x-axis-label")
    .attr("x", lineChartWidth / 2)
    .attr("y", lineChartHeight + 30)
    .style("text-anchor", "middle")
    .text("Year");

  svg
  .append("text")
  .attr("class", "y-axis-label")
  .attr("x", -lineChartHeight / 2)
  .attr("y", -margin.left + 30)
  .style("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text(getAttributeName(attributeName));
}

function updateScatterPlot(attributeId, regions) {
  const svg = d3.select("#scatterPlot").select("svg").select("g");

  console.log("Here: ", attributeId)

  let currentData = globalDataAttributes;

if (regions[0] === "All") {
  // Filter data where the 'attributeName' is not empty
  currentData = currentData.filter(d => d[attributeId] !== "");
} else {
  // Filter data based on selected regions
  currentData = currentData.filter(item => regions.includes(item.region));
}

  console.log(currentData);

  const xScale = d3
    .scaleLinear()
    .domain([0, 2])
    .range([0, width]);

  // Update the y-axis scale for the scatter plot based on the selected attribute
  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

  // Create a color scale based on the "generosity" attribute
  const colorScale = d3
    .scaleLinear()
    .domain([
      d3.min(currentData, (d) => d.generosity),
      d3.max(currentData, (d) => d.generosity),
    ])
    .range([d3.interpolateCool(0), d3.interpolateCool(1)]);

  // Create a tooltip div element
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #000")
    .style("padding", "5px");

  // Update the y-axis of the scatter plot
  d3.select(".y-axis")
    .transition()
    .call(d3.axisLeft(yScale).tickFormat((d) => d));

  // Change the y-axis label
  svg.select(".y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text(getAttributeName(attributeId));    

  const allCircles = svg.selectAll(".circle");

    allCircles
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 0.9);
        tooltip.html("Country: " + d.country + "<br/>" + getAttributeName(attributeId) + ": " + d[attributeId] + "<br/>GDP per Capita: " + d.gdp_per_capita + "<br/>Generosity: " + d.generosity);
        handleMouseOverCountry(event, d);
      })
      .on("mousemove", function (event) {
        // Update the tooltip position as the mouse moves
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function (event, d) {
        // Hide the tooltip when moving away from the country
        tooltip.style("opacity", 0)
          .style("top", "10px")
          .style("left", "10px");
          handleMouseOutCountry(event, d);
      })
      .on("click", handleClickCountry);
    

  // Select all existing circles and bind the data to them
  const circles = svg.selectAll(".circle").data(currentData, (d) => d.country);

  // Update existing circles
  circles
    .transition()
    .duration(1000)
    .attr("cx", (d) => xScale(d.gdp_per_capita))
    .attr("cy", (d) => yScale(d[attributeId]))

  // Enter new circles
  circles
    .enter()
    .append("circle")
    .attr("class", "circle data")
    .attr("cx", (d) => xScale(d.gdp_per_capita))
    .attr("cy", (d) => yScale(d[attributeId]))
    .attr("r", 5)
    .attr("fill", (d) => colorScale(d.generosity))
    .attr("stroke", "black")
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 0.9);
      tooltip.html("Country: " + d.country + "<br/>" + getAttributeName(attributeId) + ": " + d[attributeId] + "<br/>GDP per Capita: " + d.gdp_per_capita + "<br/>Generosity: " + d.generosity);
      handleMouseOverCountry(event, d);
    })
    .on("mousemove", function (event) {
      // Update the tooltip position as the mouse moves
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function (event, d) {
      // Hide the tooltip when moving away from the country
      tooltip.style("opacity", 0)
        .style("top", "10px")
        .style("left", "10px");
        handleMouseOutCountry(event, d);
    })
    .on("click", handleClickCountry)
    .attr("r", 0)
    .transition()
    .duration(500)
    .attr("r", 5);

  // Remove any circles that are no longer in the updated data
  circles.exit().transition().duration(500).attr("r", 0).remove();
}

function getAttributeName(attributeId) {
 if (attributeId == "happiness_score") {
  return "Happiness Score"
 } else if (attributeId == "gdp_per_capita") {
  return "GDP per Capita"
 } else if (attributeId == "social_support") {
  return "Social Support"
 } else if (attributeId == "healthy_life_expectancy") {
  return "Healthy Life Expectancy"
 } else if (attributeId == "freedom_to_make_life_choices") {
  return "Freedom to make Life Choices"
 } else if (attributeId == "generosity") {
  return "Generosity"
 } else if (attributeId == "perceptions_of_corruption") {
  return "Perceptions of Corruption"
 } else if (attributeId == "well_being_index") {
  return "Well Being Index"
 } else {return "N.A."}
}
