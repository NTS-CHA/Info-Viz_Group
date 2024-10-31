const margin4 = { top: 30, right: 10, bottom: 100, left: 10 };
const width4 = 1400 - margin4.left - margin4.right;;
const height4 = 600 - margin4.top - margin4.bottom;

const svg4 = d3.select("#map").append("svg")
    .attr("width", width4)
    .attr("height", height4);

const tooltip = d3.select(".tooltip2");

const projection = d3.geoMercator()
    .center([103.851959, 1.290270])
    .scale(70000)
    .translate([width4 / 2, height4 / 2]);

const path = d3.geoPath().projection(projection);

d3.json("SingaporeBoundaries.geojson").then(function(data) {
    svg4.append("g")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("class", "land")
        .attr("d", path)
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                   .style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 20) + "px")
                   .html(`<strong>${d.properties.Name}</strong><br>${d.properties.ED_DESC}`)
                   .transition()
                   .duration(200)
                   .style("opacity", 1);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                   .duration(200)
                   .style("opacity", 0)
                   .on("end", () => tooltip.style("display", "none"));
        });

    // Load the Tourist Attractions GeoJSON data
    d3.json("TouristAttractions.geojson").then(function(geojson) {
        // Function to extract details from the description
        function extractDetails(description) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(description, 'text/html');

            const rows = doc.querySelectorAll("tr");
            let details = {
                pageTitle: '',
                overview: '',
                address: ''
            };

            rows.forEach(row => {
                const key = row.querySelector("th") ? row.querySelector("th").innerText.trim() : '';
                const value = row.querySelector("td") ? row.querySelector("td").innerText.trim() : '';

                switch (key) {
                    case 'PAGETITLE':
                        details.pageTitle = value;
                        break;
                    case 'OVERVIEW':
                        details.overview = value;
                        break;
                    case 'ADDRESS':
                        details.address = value;
                        break;
                }
            });

            return details;
        }

        svg4.selectAll("circle")
            .data(geojson.features)
            .enter().append("circle")
            .attr("class", "map-pin")
            .attr("r", 3)
            .attr("transform", d => {
                const coords = projection([d.geometry.coordinates[0], d.geometry.coordinates[1]]);
                return `translate(${coords[0]}, ${coords[1]})`;
            })
            .on("mouseover", function(event, d) {
                d3.select(this)
                  .transition().duration(200)
                  .attr("fill", "#FF9800");

                // Extract details from the description
                const details = extractDetails(d.properties.Description);

                // Display extracted information in the tooltip
                tooltip.style("display", "block")
                       .style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 10) + "px")
                       .html(`
                           <strong>${details.pageTitle}</strong><br><br>
                           <strong>Overview:</strong> ${details.overview}<br><br>
                           <strong>Address:</strong> ${details.address}
                       `)
                       .transition()
                       .duration(200)
                       .style("opacity", 1);
            })
            .on("mouseout", function() {
                d3.select(this)
                  .transition().duration(200)
                  .attr("fill", "#FF5722");

                tooltip.transition()
                       .duration(200)
                       .style("opacity", 0)
                       .on("end", () => tooltip.style("display", "none"));
            });
    }).catch(function(error) {
        console.log("Error loading the Tourist Attractions GeoJSON file:", error);
    });
}).catch(function(error) {
    console.error("Error loading GeoJSON:", error);
});