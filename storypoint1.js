    // Set dimensions for both charts
    const margin = { top: 50, right: 30, bottom: 50, left: 90 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Line Chart for Total International Arrivals
    const lineSvg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Bar Chart for Visitor Arrivals by Region
    const barSvg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse the date for the line chart
    const parseDate = d3.timeParse("%Y-%m");

    // Scales for the line chart
    const xLine = d3.scaleTime().range([0, width]);
    const yLine = d3.scaleLinear().range([height, 0]);

    // Scales for the bar chart
    const xBar = d3.scaleBand().range([0, width]).padding(0.2);
    const yBar = d3.scaleLinear().range([height, 0]);

    // Load both CSV datasets
    Promise.all([
        d3.csv("TotalVisitorInternationalArrivalsMonthly.csv"),   // Line chart data
        d3.csv("VisitorInternationalArrivalstoSingaporebyCountryMonthly.csv")  // Bar chart data
    ]).then(([monthlyData, regionData]) => {

        // ======= Line Chart Setup =======
        // Format the data for the line chart
        monthlyData.forEach(d => {
            d.Date = parseDate(d.Date);
            d.Arrivals = +d.Arrivals;
        });

        // Set the domains for x and y scales (line chart)
        xLine.domain(d3.extent(monthlyData, d => d.Date));
        yLine.domain([0, d3.max(monthlyData, d => d.Arrivals)]);

        // Add the X axis (line chart)
        lineSvg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xLine))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add the Y axis (line chart)
        lineSvg.append("g")
            .call(d3.axisLeft(yLine));

        // Add the line to the chart with animation
        const linePath = lineSvg.append("path")
            .datum(monthlyData)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => xLine(d.Date))
                .y(d => yLine(d.Arrivals))
            );

        // Animate the line chart drawing
        const totalLength = linePath.node().getTotalLength();
        linePath
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(3000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Add and animate circles for data points
        lineSvg.selectAll("circle")
            .data(monthlyData)
            .enter().append("circle")
            .attr("cx", d => xLine(d.Date))
            .attr("cy", d => yLine(d.Arrivals))
            .attr("r", 0)  // Initially set radius to 0 for animation
            .attr("fill", "red")
            .transition()
            .duration(1000)
            .delay((d, i) => i * 10)  // Stagger the appearance of circles
            .attr("r", 5);  // Animate to final size

        // ======= Bar Chart Setup =======
        // Format the data for the bar chart
        const aggregatedRegionData = d3.rollups(
            regionData,
            v => d3.sum(v, d => +d.no_of_visitor_arrivals),
            d => d.region
        ).map(([region, totalArrivals]) => ({ region, totalArrivals }));

        // Set the domains for x and y scales (bar chart)
        xBar.domain(aggregatedRegionData.map(d => d.region));  // Regions on x-axis
        yBar.domain([0, d3.max(aggregatedRegionData, d => d.totalArrivals)]);  // Number of visitor arrivals on y-axis

        // Add the X axis (bar chart)
        barSvg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xBar))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add the Y axis (bar chart)
        barSvg.append("g")
            .call(d3.axisLeft(yBar));

        // Add and animate bars
        barSvg.selectAll(".bar")
            .data(aggregatedRegionData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xBar(d.region))
            .attr("y", height)  // Start from the bottom of the chart
            .attr("width", xBar.bandwidth())
            .attr("height", 0)  // Start with height 0 for animation
            .attr("fill", "red")
            .transition()
            .duration(10000)
            .delay((d, i) => i * 100)  // Stagger the appearance of bars
            .attr("y", d => yBar(d.totalArrivals))  // Animate to final position
            .attr("height", d => height - yBar(d.totalArrivals));  // Animate to final height
    });