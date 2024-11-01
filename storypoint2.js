    // DEMOGRAPHICS (STORYPOINT 3)
    // Load and preprocess the dataset
    d3.csv('demographic.csv').then(function (data) {

        // Set up SVG dimensions and margins
        const margin2 = { top: 30, right: 100, bottom: 100, left: 60 };
        const width2 = 1150 - margin2.left - margin2.right;
        const height2 = 450 - margin2.top - margin2.bottom;
  
        // Create an SVG container
        const svg2 = d3.select('#demographic-chart')
          .attr('width', width2 + margin2.left + margin2.right)
          .attr('height', height2 + margin2.top + margin2.bottom)
          .append('g')
          .attr('transform', `translate(${margin2.left}, ${margin2.top})`);
  
        // Preprocess the data: handle missing values and convert to numerical values
        data.forEach(d => {
          Object.keys(d).forEach(key => {
            if (d[key] === "-" || d[key] === "") {
              d[key] = 0;
            }
            if (key !== "Data Series") {
              d[key] = +d[key];
            }
          });
        });
  
        // Function to extract the year from a month-year string (e.g., "2024 Sep")
        function getYear(monthYear) {
          return monthYear.split(" ")[0];  // Get the year part
        }
  
        // Aggregate data by year (sum monthly data)
        function aggregateDataByYear(data, ageGroup) {
          const years = {};
          const totalData = data.filter(d => d['Data Series'] === 'Total')[0];
          const maleData = data.filter(d => d['Data Series'] === 'Males')[0];
          const femaleData = data.filter(d => d['Data Series'] === 'Females')[0];
          const ageGroupData = data.filter(d => d['Data Series'] === ageGroup)[0];
  
          Object.keys(totalData).slice(1).forEach(month => {
            const year = getYear(month);  // Extract year from month
  
            if (!years[year]) {
              years[year] = { year: year, Total: 0, Males: 0, Females: 0, Unknown: 0 };
            }
            years[year].Males += maleData[month] * (ageGroupData[month] / totalData[month]);
            years[year].Females += femaleData[month] * (ageGroupData[month] / totalData[month]);
            years[year].Unknown += (totalData[month] - (maleData[month] + femaleData[month])) * (ageGroupData[month] / totalData[month]);
            years[year].Total = years[year].Males + years[year].Females + years[year].Unknown;

          });
  
          return Object.values(years);  // Convert object to array
        }
  
        // Define scales for X and Y axes
        const xScale = d3.scalePoint().range([0, width2]).padding(0.5);  // Use point scale for categorical years
        const yScale = d3.scaleLinear().range([height2, 0]);
  
        // Define the color scale (for males, females, and unknown)
        const colorScale = d3.scaleOrdinal()
          .domain(['Total','Males', 'Females', 'Unknown'])
          .range(['#994257','#1f77b4', '#d62728', '#7f7f7f']);  // Blue for males, red for females, grey for unknown
  
        // Add X and Y axes to the SVG
        const xAxis = svg2.append('g').attr('transform', `translate(0, ${height2})`);
        const yAxis = svg2.append('g');
  
        // Function to update the chart based on selected age group
        function updateChart(ageGroup) {
          // Aggregate data by year
          const timeSeriesData = aggregateDataByYear(data, ageGroup);
  
          // Update X and Y domains
          xScale.domain(timeSeriesData.map(d => d.year));
          yScale.domain([0, d3.max(timeSeriesData, d => d.Males + d.Females + d.Unknown)]);
  
          // Transition the X axis
          xAxis.transition().duration(1000).call(d3.axisBottom(xScale));
  
          // Transition the Y axis
          yAxis.transition().duration(1000).call(d3.axisLeft(yScale));
  
          // Define line generators for Males, Females, and Unknown
          const lineTotal = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.Total));

          const lineMales = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.Males));
  
          const lineFemales = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.Females));
  
          const lineUnknown = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.Unknown));
  
          // Remove existing lines and circles
          svg2.selectAll('.line').remove();
          svg2.selectAll('.circle').remove();
  
          // Function to draw the line with a stroke-dasharray effect
          function drawLine(lineGenerator, color) {
            const path = svg2.append('path')
              .datum(timeSeriesData)
              .attr('class', 'line')
              .attr('fill', 'none')
              .attr('stroke', color)
              .attr('stroke-width', 2)
              .attr('d', lineGenerator);
  
            // Get the length of the path
            const totalLength = path.node().getTotalLength();
  
            // Set up the stroke dash properties for animation
            path.attr('stroke-dasharray', totalLength)
              .attr('stroke-dashoffset', totalLength)
              .transition()
              .duration(2000)
              .ease(d3.easeLinear)
              .attr('stroke-dashoffset', 0);  // Draw the line
          }
  
          // Draw each line with animation
          drawLine(lineTotal, colorScale('Total'));
          drawLine(lineMales, colorScale('Males'));
          drawLine(lineFemales, colorScale('Females'));
          drawLine(lineUnknown, colorScale('Unknown'));
  
          // Add circles for data points with sequential appearance
          timeSeriesData.forEach((d, index) => {
            ['Total','Males', 'Females', 'Unknown'].forEach(key => {
              svg2.append('circle')
                .attr('class', 'circle')
                .attr('cx', xScale(d.year))
                .attr('cy', yScale(d[key]))
                .attr('r', 5)
                .attr('fill', colorScale(key))
                .attr('opacity', 0)  // Start invisible
                .transition()
                .delay(index * 110)  // Delay based on index
                .duration(1000)
                .attr('opacity', 1);  // Fade in
            });
          });
        }
  
        // Initial chart load (default to 'Under 15 Years')
        updateChart('Total');
  
        // Add event listener for the select box change
        d3.select('#ageGroup').on('change', function () {
          updateChart(this.value);
        });
  
        // Add X-axis title (Years)
        svg2.append("text")
          .attr("x", width2 / 2)
          .attr("y", height2 + margin2.bottom - 50)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text("Years");
  
        // Add Y-axis title (Total International Visitors)
        svg2.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height2 / 2)
          .attr("y", -margin2.left - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text("Total International Visitors");
  
        // Add Legend inside the chart
        const legend = svg2.append('g')
          .attr('transform', `translate(${width2 - 150}, ${20})`);  // Position it in the top right corner
  
        // Total (Dark moderate red)
        legend.append('rect')
          .attr('x', 50)
          .attr('y', -50)
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', '#994257');  // Dark moderate red color
  
        legend.append('text')
          .attr('x', 80)
          .attr('y', -35)
          .text('Total')
          .attr('alignment-baseline', 'middle');


        // Male (Blue)
        legend.append('rect')
          .attr('x', 50)
          .attr('y', -20)
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', '#1f77b4');  // Blue color
  
        legend.append('text')
          .attr('x', 80)
          .attr('y', -5)
          .text('Males')
          .attr('alignment-baseline', 'middle');
  
        // Female (Red)
        legend.append('rect')
          .attr('x', 50)
          .attr('y', 10)
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', '#d62728');  // Red color for females
  
        legend.append('text')
          .attr('x', 80)
          .attr('y', 25)
          .text('Females')
          .attr('alignment-baseline', 'middle');
  
        // Unknown (Grey)
        legend.append('rect')
          .attr('x', 50)
          .attr('y', 40)
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', '#7f7f7f');  // Grey color for unknown
  
        legend.append('text')
          .attr('x', 80)
          .attr('y', 55)
          .text('Unknown')
          .attr('alignment-baseline', 'middle');
  
      });
