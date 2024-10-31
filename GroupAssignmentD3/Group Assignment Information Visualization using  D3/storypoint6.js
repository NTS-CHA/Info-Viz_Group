// Width and height
var w = 700;
var h = 200;

// Original data
var dataset = [
    { Shopping: 26, Accommodation: 24, FB: 23, OtherComponents: 27 },
    { Shopping: 32, Accommodation: 14, FB: 13, OtherComponents: 41 },
    { Shopping: 12, Accommodation: 20, FB: 12, OtherComponents: 56 },
    { Shopping: 28, Accommodation: 20, FB: 15, OtherComponents: 37 },
    { Shopping: 10, Accommodation: 26, FB: 13, OtherComponents: 51 },
    { Shopping: 9, Accommodation: 25, FB: 14, OtherComponents: 52 },
    { Shopping: 22, Accommodation: 21, FB: 21, OtherComponents: 36 },
    { Shopping: 12, Accommodation: 25, FB: 13, OtherComponents: 50 },
    { Shopping: 29, Accommodation: 17, FB: 18, OtherComponents: 36 },
    { Shopping: 18, Accommodation: 29, FB: 18, OtherComponents: 35 },
];

var labelsText = ["China", "Indonesia", "Australia", "India", "USA", "UK", "Malaysia", "Japan", "Philippines", "South Korea"];

var pieData = [
    { label: "Shopping", value: 2562542746 },
    { label: "Accommodation", value: 2458211231 },
    { label: "F&B", value: 2050858887 },
    { label: "Other Components", value: 4478437269 },
];

// Set up stack method
var stack = d3.stack()
    .keys(["Shopping", "Accommodation", "FB", "OtherComponents"])
    .order(d3.stackOrderDescending);

// Data, stacked
var series = stack(dataset);

// Set up scales
var xScale = d3.scaleBand()
    .domain(d3.range(dataset.length)) // 使用数据集的长度设置x轴范围
    .range([0, w])
    .paddingInner(0.1);

var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, function (d) {
        return d.Shopping + d.Accommodation + d.FB + d.OtherComponents;
    })
    ])
    .range([h, 0]);

// Easy colors accessible via a 10-step ordinal scale
var colorStory = d3.scaleOrdinal([
    "#ff5c5c", 
    "#ffa7a7", 
    "#ffeded", 
    "#ef3340" 
]);

// Create SVG element
var svg = d3.select("#tourism-receipt").append("svg")
    .attr("width", 800)  // 设置为窗口宽度
    .attr("height", 400) // 设置为窗口高度
    .append("g")
    .attr("transform", "translate(50,150)"); // 图表向右上角偏移

svg.append("text")
    .attr("x", w / 2)  // 水平居中
    .attr("y", -60)     // 垂直位置
    .attr("text-anchor", "middle") // 文本居中对齐
    .attr("font-size", "17px") // 字体大小
    .attr("fill", "black") // 字体颜色
    .text("Tourism Receipts By Place of Residences & Major Components"); // 文本内容

svg.append("text")
    .attr("x", 1030)  // 水平居中
    .attr("y", -60)     // 垂直位置
    .attr("text-anchor", "middle") // 文本居中对齐
    .attr("font-size", "17px") // 字体大小
    .attr("fill", "black") // 字体颜色
    .text("Overall Tourism Receipts By Major Components"); // 文本内容

// 创建右下角的文本框
var textBox = svg.append("foreignObject")
    .attr("x", 950) // 设置x坐标
    .attr("y", 300) // 设置y坐标
    .attr("width", 395) // 设置文本框宽度
    .attr("height", 300); // 设置文本框高度

// 在文本框中添加内容
// textBox.append("xhtml:div")
//     .style("font-size", "18px") // 设置字体大小
//     .style("color", "white") // 设置文本颜色
//     .style("background", "rgba(0, 0, 0, 0.5)") // 背景颜色，半透明黑色
//     .style("padding", "10px") // 内边距
//     .style("border-radius", "8px") // 边框圆角
//     .html("<strong><span style='font-size: 24px;'>Consumption Analysis</span></strong><br>" +
//         "Other consumption categories, such as entertainment and cultural activities, increased significantly. This shows that tourists are more inclined to experience local culture and activities rather than just make material purchases. For example, Singapore’s rich nightlife, cultural activities and tourism options attract tourists to explore in depth. This trend may be influenced by the efforts of the Singapore government and the Tourism Board to promote cultural and entertainment activities.");


// Add a group for each row of data
var groups = svg.selectAll("g")
    .data(series)
    .enter()
    .append("g")
    .style("fill", function (d, i) {
        return colorStory(i % colorStory.range().length);
    })
    .attr("class", "stack"); // 添加 class 以便调试

// Add a rect for each data value
var rects = groups.selectAll("rect")
    .data(function (d) { return d; }) // 选择每个数据点
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
        return xScale(i); // 设置条形图 x 位置
    })
    .attr("y", function (d) {
        return yScale(d[1]);  // y坐标基于堆叠值的上边界
    })
    .attr("height", function (d) {
        return yScale(d[0]) - yScale(d[1]);  // 高度基于堆叠区间
    })
    .attr("width", xScale.bandwidth());

// 添加每个堆叠部分的值标签
groups.selectAll("text.myValueLabel")
    .data(function (d) {
        return d; // 返回每个堆叠部分
    })
    .enter()
    .append("text")
    .attr("class", "myValueLabel")
    .attr("x", function (d, i, j) {
        return xScale(i) + xScale.bandwidth() / 2; // 每个条形中间
    })
    .attr("y", function (d) {
        return yScale((d[0] + d[1]) / 2); // 在每个堆叠的中间位置
    })
    .text(function (d) {
        return d[1] - d[0]; // 显示当前堆叠部分的值
    });

// 添加底部标签
var labels = svg.selectAll("text.myLabel")
    .data(labelsText)
    .enter()
    .append("text")
    .attr("class", "myLabel")
    .attr("x", function (d, i) {
        return xScale(i) + xScale.bandwidth() / 2; // 将标签放在每个 bar 的中间
    })
    .attr("y", h + 30) // 调整标签位置，设置在 bars 的底部
    .attr("text-anchor", "middle") // 文本居中对齐
    .text(function (d) {
        return d; // 使用自定义标签文本
    });

var pieWidth = 400; // 饼图的宽度
var pieHeight = 200; // 饼图的高度

var pieRadius = Math.min(pieWidth, pieHeight) / 2; // 饼图半径

// 计算扇形图的数据
var pie = d3.pie()
    .value(function (d) { return d.value; });

var arc = d3.arc()
    .innerRadius(0) // 内半径
    .outerRadius(pieRadius); // 外半径

// 在SVG中添加饼图的容器
var pieGroup = svg.append("g")
    .attr("transform", "translate(1030, 110)"); // 右上角的位置

// 生成饼图的扇形
var pieDataReady = pie(pieData); // 准备数据

pieGroup.selectAll("slice")
    .data(pieDataReady)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", function (d, i) { return colorStory(i % colorStory.range().length); }) // 使用颜色比例尺
    .attr("stroke", "white") // 扇形边框颜色
    .style("stroke-width", "2px");

// 在饼图中添加标签
pieGroup.selectAll("text.label")
    .data(pieDataReady)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("transform", function (d) {
        // 计算扇形的中心点
        var centroid = arc.centroid(d);
        var x = centroid[0] * 1.1; // 向外移动，调整 x 位置
        var y = centroid[1] * 1.1; // 向外移动，调整 y 位置
        return "translate(" + x + "," + y + ")"; // 移动标签到新的位置
    })
    .text(function (d) {
        return d.data.label; // 显示标签
    })
    .attr("text-anchor", "middle") // 文本居中对齐
    .attr("fill", "black") // 标签颜色
    .attr("font-size", "9px"); // 标签字体大小