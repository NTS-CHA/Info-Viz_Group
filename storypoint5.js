const svg5 = d3.select("#top-spend-countries").append("svg")
    .attr("width", 1530)
    .attr("height", 875);
const tickDuration = 1500;
const top_n = 10;
const height5 = 400;
const width5 = 1250;

const margin5 = {
    top: 80,
    right: 0,
    bottom: 5,
    left: 0
};

const colors = [
    '#E63946', // 鲜艳红
    '#F1FAEE', // 温和白
    '#F1C40F', // 明亮黄
    '#A8DADC', // 浅蓝
    '#457B9D', // 深蓝
    '#F1A7A1', // 柔和粉
    '#2A9D8F', // 深绿松
    '#9D5B5B', // 温暖红褐色
    '#1D3557', // 深海军蓝
    '#D9BF77', // 浅褐色
    '#F6C9A6', // 浅桃
    '#FF6F61', // 珊瑚橙
    '#A2C2E0', // 冷静蓝
    '#6B4226', // 深棕
    '#D4A5A5'  // 柔和灰
];


let barPadding = (height5 - (margin5.bottom + margin5.top)) / (top_n * 5);

// variable declared with let is limted to block it is declared
// variable declared with var has global scope
let title = svg5.append('text')
    .attr('class', 'title')
    .attr('y', 24)
    .attr('x', 600)   // 将 x 设为 SVG 的宽度一半
    .attr('text-anchor', 'middle')  // 将文本锚点设为中间
    .text('Top 10 Countries Spending on Tourism in Singapore');

let subTitle = svg5.append("text")
    .attr("class", "subTitle")
    .attr("y", 55)
    .html("Tourism spending: $");

let caption = svg5.append('text')
    .attr('class', 'caption')
    .attr('x', width5)
    .attr('y', height5 - 5)
    .style('text-anchor', 'end')
    .html('Source: stan.stb.gov.sg');

let year = 2007;
let colourIndex = 0;

d3.csv('data-5.csv').then(function (data) {
    console.log(data);
    data.forEach(d => {
        d.value = +d.value,
            d.lastValue = +d.lastValue,
            d.value = isNaN(d.value) ? 0 : d.value,
            d.year = +d.year,
            d.colour = colors[colourIndex++ % colors.length] // 循环取色
        //d.colour = colors[Math.floor(Math.random() * colors.length)]
    });
    console.log(data);

    let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
        .sort((a, b) => b.value - a.value)
        .slice(0, top_n);

    yearSlice.forEach((d, i) => d.rank = i);

    console.log('yearSlice: ', yearSlice)

    let x = d3.scaleLinear()
        .domain([0, d3.max(yearSlice, d => d.value)])
        .range([margin5.left, width5 - margin5.right - 65]);

    let y = d3.scaleLinear()
        .domain([top_n, 0])
        .range([height5 - margin5.bottom, margin5.top]);

    let xAxis = d3.axisTop()
        .scale(x)
        .ticks(width5 > 500 ? 5 : 2)
        .tickSize(-(height5 - margin5.top - margin5.bottom))
        .tickFormat(d => d3.format(',')(d));

    svg5.append('g')
        .attr('class', 'axis xAxis')
        .attr('transform', `translate(0, ${margin5.top})`)
        .call(xAxis)
        .select('path')
        .style('display', 'none')
        .selectAll('.tick line')
        .classed('origin', d => d == 0);

    svg5.selectAll('rect.bar')
        .data(yearSlice, d => d.name)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', x(0) + 1)
        .attr('width', d => x(d.value) - x(0) - 1)
        .attr('y', d => y(d.rank) + 5)
        .attr('height', y(1) - y(0) - barPadding)
        .style('fill', d => d.colour);

    svg5.selectAll('text.label')
        .data(yearSlice, d => d.name)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.value) - 8)
        .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
        .style('text-anchor', 'end')
        .html(d => d.name);

    svg5.selectAll('text.valueLabel')
        .data(yearSlice, d => d.name)
        .enter()
        .append('text')
        .attr('class', 'valueLabel')
        .attr('x', d => x(d.value) + 5)
        .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
        .text(d => d3.format(',.0f')(d.lastValue));

    let yearText = svg5.append('text')
        .attr('class', 'yearText')
        .attr('x', width5 - margin5.right)
        .attr('y', height5 - 25)
        .style('text-anchor', 'end')
        .html(~~year) //~~ "double  tilde" convert to int (remove decimals) => shortcut for math.floor() function
        .call(halo, 10);

    let ticker = d3.interval(e => {      // e -> custom event object

        yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
            .sort((a, b) => b.value - a.value)
            .slice(0, top_n);

        yearSlice.forEach((d, i) => d.rank = i);
        //console.log('IntervalYear: ', yearSlice);

        x.domain([0, d3.max(yearSlice, d => d.value)]);

        svg5.select('.xAxis')
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .call(xAxis);

        let bars = svg5.selectAll('.bar').data(yearSlice, d => d.name);
        bars
            .enter()
            .append('rect')
            .attr('class', d => `bar ${d.name.replace(/\s/g, '_')}`)
            .attr('x', x(0) + 1)
            .attr('width', d => x(d.value) - x(0) - 1)
            .attr('y', d => y(top_n + 1) + 5)
            .attr('height', y(1) - y(0) - barPadding)
            .style('fill', d => d.colour)
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank) + 5);
        bars
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('width', d => x(d.value) - x(0) - 1)
            .attr('y', d => y(d.rank) + 5);
        bars
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('width', d => x(d.value) - x(0) - 1)
            .attr('y', d => y(top_n + 1) + 5)
            .remove();

        let labels = svg5.selectAll('.label')
            .data(yearSlice, d => d.name);
        labels
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.value) - 8)
            .attr('y', d => y(top_n + 1) + 5 + ((y(1) - y(0)) / 2))
            .style('text-anchor', 'end')
            .html(d => d.name)
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);
        labels
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value) - 8)
            .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);
        labels
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value) - 8)
            .attr('y', d => y(top_n + 1) + 5)
            .remove();

        let valueLabels = svg5.selectAll('.valueLabel').data(yearSlice, d => d.name);
        valueLabels
            .enter()
            .append('text')
            .attr('class', 'valueLabel')
            .attr('x', d => x(d.value) + 5)
            .attr('y', d => y(top_n + 1) + 5)
            .text(d => d3.format(',.0f')(d.lastValue))
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);
        valueLabels
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value) + 5)
            .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
            .tween("text", function (d) {
                let i = d3.interpolateRound(d.lastValue, d.value);
                return function (t) {
                    this.textContent = d3.format(',')(i(t));
                };
            });
        valueLabels
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value) + 5)
            .attr('y', d => y(top_n + 1) + 5)
            .remove();

        svg5.selectAll('.yearText').remove();
        // 添加新的 yearText 元素
        yearText = svg5.append('text')
            .attr('class', 'yearText')
            .attr('x', width5 - margin5.right)
            .attr('y', height5 - 25)
            .style('text-anchor', 'end')
            .html(~~year) //~~ "double  tilde" convert to int (remove decimals) => shortcut for math.floor() function
            .call(halo, 10);

        if (year == 2023) ticker.stop();
        year = d3.format('d')((+year) + 1);
    }, tickDuration);

});

// Format for yearText
const halo = function (text, strokeWidth) {
    text.select(function () { return this.parentNode.insertBefore(this.cloneNode(true), this); })
        .style('fill', '#ffffff')
        .style('stroke', '#ffffff')
        .style('stroke-width', strokeWidth)
        .style('stroke-linejoin', 'round')
        .style('opacity', 1);

}