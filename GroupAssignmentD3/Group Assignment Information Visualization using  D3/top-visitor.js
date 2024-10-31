// script.js
const margin = {top: 20, right: 40, bottom: 40, left: 150};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// List of years from 1978 to 2024
const years = d3.range(1978, 2025);

d3.csv("top-visitor.csv").then(data => {
    const totalData = years.map(year => {
        const yearData = {};
        data.forEach(d => {
            const totalVisitors = d3.sum(d3.range(1, 13).map(month => {
                const monthKey = `${year} ${d3.timeFormat("%b")(new Date(year, month - 1, 1))}`; // Format: "YYYY Mon"
                return +d[monthKey] || 0; // Sum all visitors for that year
            }));
            yearData[d["Data Series"]] = totalVisitors;
        });

        return { year: year, data: yearData };
    });

    let index = 0;
    const maxIndex = totalData.length - 1; // Adjust maxIndex for the last year

    // Create a caption text element
    const caption = svg.append("text")
        .attr("class", "caption")
        .attr("x", width)
        .attr("y", height - 10)
        .attr("text-anchor", "end")
        .style("font-weight", "bold") // Make the year text bold
        .text(`Year: ${years[index]}`); // Initial caption

    function updateData() {
        if (index > maxIndex) return; // Stop updates after 2024

        const currentData = totalData[index].data;

        // Convert to array for sorting
        const topCountries = Object.keys(currentData).map(country => ({
            country: country,
            visitors: currentData[country]
        }));

        // Sort and get top 8 countries
        const sortedCountries = topCountries.sort((a, b) => b.visitors - a.visitors).slice(0, 8);

        // Update scales
        const x = d3.scaleLinear()
            .domain([0, d3.max(sortedCountries, d => d.visitors)])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(sortedCountries.map(d => d.country))
            .range([0, height])
            .padding(0.1);

        // Update bars
        const bars = svg.selectAll(".bar")
            .data(sortedCountries, d => d.country);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.country))
            .attr("width", 0) // Start width at 0 for animation
            .attr("height", y.bandwidth())
            .attr("fill", "#ef3340") // Set bar color
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("width", d => x(d.visitors))
            .attr("y", d => y(d.country)); // Position correctly

        // Immediately move bars out of view for those not in the top 8
        bars.exit()
            .attr("y", height) // Move out of view immediately
            .remove();

        // Update country names inside the bars
        const labels = svg.selectAll(".bar-text")
            .data(sortedCountries, d => d.country);

        labels.enter()
            .append("text")
            .attr("class", "bar-text")
            .attr("x", 5) // Position text inside the bar
            .attr("y", d => y(d.country) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .merge(labels)
            .transition()
            .duration(1000)
            .attr("x", 5)
            .attr("y", d => y(d.country) + y.bandwidth() / 2) // Move with the bar
            .text(d => d.country); // Display country names

        labels.exit().remove(); // Remove labels that are no longer needed

        // Update visitor numbers outside the bars
        const valueLabels = svg.selectAll(".value-label")
            .data(sortedCountries, d => d.country);

        valueLabels.enter()
            .append("text")
            .attr("class", "value-label")
            .attr("x", d => x(d.visitors) + 10) // Position to the right of the bar
            .attr("y", d => y(d.country) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .merge(valueLabels)
            .transition()
            .duration(1000)
            .tween("text", function(d) {
                const currentValue = d3.select(this).text() || 0; // Get current value
                const i = d3.interpolateRound(currentValue, d.visitors); // Interpolate between current and new value
                return function(t) {
                    d3.select(this).text(i(t)); // Update text with interpolated value
                };
            })
            .attr("x", d => Math.min(x(d.visitors) + 10, width - 10)) // Keep within the canvas
            .attr("y", d => y(d.country) + y.bandwidth() / 2);

        valueLabels.exit().remove(); // Remove any value labels no longer needed

        // Update the caption text with the current year
        caption.transition()
            .duration(1000)
            .text(`Year: ${years[index]}`); // Update caption text

        index++; // Increment index for the next update
    }

    // Start the update interval, stopping after 2024
    const interval = setInterval(() => {
        if (index <= maxIndex) {
            updateData();
        } else {
            clearInterval(interval); // Stop updating after 2024
        }
    }, 2000); // Update every 2 seconds
});
