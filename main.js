let keyframeIndex = 0;

let keyframes = [
    {
        activeVerse: 1,
        activeLines: [1],
        svgUpdate: [drawLocationData, ()=>updateLeftColumnContent(0)]
    },
    {
        activeVerse: 1,
        activeLines: [2]
    },
    {
        activeVerse: 1,
        activeLines: [3]
    },
    {
        activeVerse: 1,
        activeLines: [4]
    },
    {
        activeVerse: 2,
        activeLines: [1],
        svgUpdate: [drawPrimaryData, ()=>updateLeftColumnContent(1)]
    },
    {
        activeVerse: 2,
        activeLines: [2]
    },
    {
        activeVerse: 2,
        activeLines: [3]
    },
    {
        activeVerse: 2,
        activeLines: [4]
    },
    {
        activeVerse: 3,
        activeLines: [1],
        svgUpdate: [drawQuintileData, ()=>updateLeftColumnContent(1)]
    },
    {
        activeVerse: 3,
        activeLines: [2]
    },
    {
        activeVerse: 3,
        activeLines: [3]
    },
    {
        activeVerse: 3,
        activeLines: [4]
    },
    {
        activeVerse: 4,
        activeLines: [1]
    },
    {
        activeVerse: 4,
        activeLines: [2]
    },
    {
        activeVerse: 4,
        activeLines: [3]
    },
    {
        activeVerse: 4,
        activeLines: [4]
    }
]

let svg = d3.select("#svg");
let quintileChartData;
let locationChartData;
let primaryChartData;
let chartNum;
let colorScale;

let chart;
let chartWidth;
let chartHeight;
let xScale;
let yScale;
let textData = [
    "Introduction: \n \There are discernible distinctions between rural and urban places in the US educational landscape.\
    There is a slight greater rate of early educational attrition in rural areas (13% against 11%), when the population has less than a high school education.\
    Additionally, 35% of high school graduates in rural areas complete their education, compared to 25% in metropolitan areas. Higher education reverses this trend:\
    in rural areas, just 10% of people have an associate degree, and 21% have a bachelor's degree or beyond; in urban areas, these numbers jump to 9% and a significantly higher 36%, respectively.\
    Based on available statistics, it appears that a bigger percentage of people live in urban regions than in less populous places.\
    This could potentially be attributed to the variety of opportunities and easier access to higher education that these areas offer.\ ",
    "Introduction: \n This chart"
  ];

let isPie = false;
let currentZoomLevel = 1;

document.getElementById("forward-button").addEventListener("click", forwardClicked);
document.getElementById("backward-button").addEventListener("click", backwardClicked);
document.getElementById("forward-button2").addEventListener("click", forwardVerseClicked);
document.getElementById("backward-button2").addEventListener("click", backwardVerseClicked);
document.addEventListener('mousewheel', scrollControl, {passive: false});
document.getElementById('zoom-in').addEventListener('click', zoomIn);
document.getElementById('zoom-out').addEventListener('click', zoomOut);
d3.select('#dropdown').on('change', handleChartChange);


async function loadData() {
    await d3.json("data/quintile.json").then(data => {
        quintileChartData = data;
    });
    await d3.json("data/location.json").then(data => {
        locationChartData = data;
    });
    await d3.json("data/primary.json").then(data => {
        primaryChartData = data;
    });
}

function drawLocationData() {
    console.log("Drawing the location data bar chart");
    console.log(locationChartData);
    updateBarChart(locationChartData, "Education distribution of different Locations in US");
    drawLegend();
}

function drawPrimaryData() {
    console.log("Drawing the primary data bar chart");
    console.log(primaryChartData);
    updateBarChart2(primaryChartData, "Primary education completion of different Quintiles in US");
}

function drawQuintileData() {
    console.log("Drawing the quintile data bar chart");
    console.log(quintileChartData);
    updateBarChart(quintileChartData, "Education distribution of different Quintiles in US");
    drawLegend();
}

function handleChartChange() {
    const selectedValue = d3.select('#dropdown').node().value;
    console.log(selectedValue);
    if (selectedValue == 'option1') {
        updateBarColors({
            'Block1': '#0D3B66',
            'Block2': '#14466A',
            'Block3': '#1E6F72',
            'Block4': '#3C8DAD',
            'Block5': '#28AFB0'
            });
        updateLegendColors({
            'Block1': '#0D3B66',
            'Block2': '#14466A',
            'Block3': '#1E6F72',
            'Block4': '#3C8DAD',
            'Block5': '#28AFB0'
            });
    } 
    else if (selectedValue == 'option2') {
        updateBarColors({
            'Block1': '#FF4136',
            'Block2': '#0074D9', 
            'Block3': '#2ECC40', 
            'Block4': '#FFDC00', 
            'Block5': '#E6E6E6'
            });
        updateLegendColors({
            'Block1': '#FF4136',
            'Block2': '#0074D9', 
            'Block3': '#2ECC40', 
            'Block4': '#FFDC00', 
            'Block5': '#E6E6E6'
            });
    }
}

function updateBarChart(data, title = "") {
    chart.selectAll(".bar").remove();
    console.log("xScale:", xScale);
    console.log("yScale:", yScale);

    const blocks = ['Block1', 'Block2', 'Block3', 'Block4', 'Block5'];
    colorScale = d3.scaleOrdinal()
    .domain(['Block1', 'Block2', 'Block3', 'Block4', 'Block5'])
    .range(['#0D3B66', '#14466A', '#1E6F72', '#3C8DAD', '#28AFB0']);

    const series = d3.stack().keys(blocks)(data);
    console.log("Stacked data", series);

    if (data.length > 0 && data[0].hasOwnProperty('Location')) {
        xScale.domain(data.map(d => d.Location));
        chartNum = 1;
    } 
   
    else if (data.length > 0 && data[0].hasOwnProperty('Wealth')) {
        xScale.domain(data.map(d => d.Wealth));
        chartNum = 2;
    }

    let tooltip = d3.select("#tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("display", "none")
            .style("background", "#fff")
            .style("border", "1px solid #000")
            .style("padding", "10px")
            .style("pointer-events", "none");
    }

    const maxVal = d3.max(series, d => d3.max(d, d => d[1]));
    yScale.domain([0, maxVal]).nice();

    const barGroups = chart.selectAll(".bar-group")
        .data(series, d => d.key);

    barGroups.enter().append("g")
        .attr("class", "bar-group")
        .attr("fill", (d, i) => colorScale(i));

    barGroups.exit().remove();

    if (data.length > 0 && data[0].hasOwnProperty('Location')) {
        chart.selectAll(".bar-group")
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => xScale(d.data.Location))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 0.7);
            const key = d3.select(this.parentNode).datum().key;
            const displayName = getDisplayName(key);
            const blockData = d.data[key];
            const dataString = `${displayName}: ${blockData}`;
            tooltip
                .html(dataString)
                .style('display', 'block')
                .style('left', `${event.pageX - 400}px`)
                .style('top', `${event.pageY - 200}px`);
        })
        .on("mouseout", function() {
            d3.select(this).style("opacity", 1);
            tooltip.style('display', 'none');
        });
    } 
   
    else if (data.length > 0 && data[0].hasOwnProperty('Wealth')) {
        chart.selectAll(".bar-group")
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => xScale(d.data.Wealth))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 0.7);
            const key = d3.select(this.parentNode).datum().key;
            const displayName = getDisplayName(key);
            const blockData = d.data[key];
            const dataString = `${displayName}: ${blockData}`;
            tooltip
                .html(dataString)
                .style('display', 'block')
                .style('left', `${event.pageX - 400}px`)
                .style('top', `${event.pageY - 200}px`);
        })
        .on("mouseout", function() {
            d3.select(this).style("opacity", 1);
            tooltip.style('display', 'none');
        });
    }

    chart.select(".x-axis")
        .transition()
        .duration(500)
        .call(d3.axisBottom(xScale));

    chart.select(".y-axis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale));

    if (title.length > 0) {
        svg.select("#chart-title")
            .transition()
            .duration(250)
            .style("opacity", 0)
            .on("end", () => {
                svg.select("#chart-title")
                    .text(title)
                    .transition()
                    .duration(250)
                    .style("opacity", 1);
            });
    }
}

function updateBarChart2(data, title = "") {
    chart.selectAll(".bar-group").remove();
    chartNum = 0;
    console.log("xScale:", xScale);
    console.log("yScale:", yScale);

    xScale.domain(data.map(d => d.Wealth));
    yScale.domain([0, d3.max(data, d => d.comp_prim_v2_m)]).nice();
    const bars = chart.selectAll(".bar").data(data, d => d.Wealth);

    bars.exit()
        .transition()
        .duration(500)
        .attr("y", chartHeight)
        .attr("height", 0)
        .remove();

    bars.transition()
        .duration(500)
        .attr("x", d => xScale(d.Wealth))
        .attr("y", d => yScale(d.comp_prim_v2_m))
        .attr("height", d => chartHeight - yScale(d.comp_prim_v2_m))
        .attr("width", xScale.bandwidth());

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Wealth))
        .attr("y", chartHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", 0) 
        .attr("fill", "#3C8DAD")
        .transition() 
        .duration(1000) 
        .attr("y", d => yScale(d.comp_prim_v2_m))
        .attr("height", d => chartHeight - yScale(d.comp_prim_v2_m));
        
    chart.select(".x-axis")
        .transition()
        .duration(500)
        .call(d3.axisBottom(xScale));

    chart.select(".y-axis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale));

    if (title.length > 0) {
        svg.select("#chart-title")
            .transition()
            .duration(250)
            .style("opacity", 0)
            .on("end", () => {
                svg.select("#chart-title")
                    .text(title)
                    .transition()
                    .duration(250)
                    .style("opacity", 1);
            });
    }
}

function getDisplayName(key) {
    let nameMapping;
    if(chartNum == 1){
        nameMapping = {
            'Block1': 'Less than high school',
            'Block2': 'High school',
            'Block3': 'Some college',
            'Block4': 'Associate degree',
            'Block5': 'Bachelor\'s degree or higher'
        };
    }
    else if(chartNum = 2){
        nameMapping = {
            'Block1': 'Primary completion rate',
            'Block2': 'Lower secondary completion rate',
            'Block3': 'Upper secondary completion rate',
            'Block4': 'Lower sec comp rate for age 15-24',
            'Block5': 'Upper se comp rate for age 20-29'
        };
    }
    return nameMapping[key];
  }

function updateBarColors(blockColorMapping) {
    const blocks = ['Block1', 'Block2', 'Block3', 'Block4', 'Block5'];
    const updatedColors = blocks.map(block => blockColorMapping[block] || colorScale(block));
    colorScale.range(updatedColors);
    chart.selectAll(".bar-group")
        .transition()
        .duration(500)
        .attr("fill", d => colorScale(d.key));
}

function drawLegend() {
    let blocks;
    if (chartNum == 1) {
        blocks = ["Less than high school", "High school", "Some college", "Associate degree", "Bachelor's degree or higher"];
    } else if (chartNum == 2) {
        blocks = ["Primary completion rate", "Lower secondary completion rate", 
        "Upper secondary completion rate", "Lower sec comp rate for age 15-24", "Upper se comp rate for age 20-29"];
    }
    const selectedValue = d3.select('#dropdown').node().value;
    let colorScale;
    if (selectedValue == 'option1') {
         colorScale = d3.scaleOrdinal()
            .domain(blocks)
            .range(['#0D3B66', '#14466A', '#1E6F72', '#3C8DAD', '#28AFB0']);
    }
    else if (selectedValue == 'option2') {
        colorScale = d3.scaleOrdinal()
           .domain(blocks)
           .range(['#FF4136','#0074D9', '#2ECC40', '#FFDC00', '#E6E6E6']);
   }
    const legendSvg = d3.select("#legend-svg");
    const legendMargin = { top: 10, left: 20, bottom: 10, right: 20 };
    const legendItemSize = 18;
    const legendSpacing = 6;
    const legendHeight = blocks.length * (legendItemSize + legendSpacing);

    legendSvg.selectAll("*").remove();

    legendSvg.attr("height", legendHeight + legendMargin.top + legendMargin.bottom);

    const legend = legendSvg.append("g")
        .attr("transform", `translate(${legendMargin.left},${legendMargin.top})`);

    legend.selectAll("rect")
        .data(blocks)
        .enter()
        .append("rect")
        .attr("width", legendItemSize)
        .attr("height", legendItemSize)
        .attr("y", (d, i) => i * (legendItemSize + legendSpacing))
        .style("fill", colorScale);

    legend.selectAll("text")
        .data(blocks)
        .enter()
        .append("text")
        .attr("x", legendItemSize + legendSpacing)
        .attr("y", (d, i) => i * (legendItemSize + legendSpacing) + (legendItemSize / 2))
        .attr("dy", "0.35em")
        .text(d => d);

    console.log("draw legend done");
}

function updateLegendColors(colorMapping) {
    const blocks = ['Block1', 'Block2', 'Block3', 'Block4', 'Block5'];
    const colorScale = d3.scaleOrdinal()
        .domain(blocks)
        .range(blocks.map(block => colorMapping[block] || '#000'));
    const legendSvg = d3.select("#legend-svg");
    const legend = legendSvg.select("g");
    legend.selectAll("rect")
        .data(blocks)
        .style("fill", colorScale); 
}


function forwardClicked() {
    if (keyframeIndex < keyframes.length - 1) {
        keyframeIndex++;
        drawKeyframe(keyframeIndex);
    }
}

function backwardClicked() {
    if (keyframeIndex > 0) {
        keyframeIndex--;
        drawKeyframe(keyframeIndex);
      }
}

function forwardVerseClicked() {
    if (keyframeIndex < keyframes.length - 4) {
        // console.log(keyframeIndex);
        keyframeIndex = keyframeIndex + 4 - keyframeIndex % 4;
        drawKeyframe(keyframeIndex);
    }
}

function backwardVerseClicked() {
    if (keyframeIndex > 0) {
        keyframeIndex = keyframeIndex - 4 - keyframeIndex % 4 ;
        drawKeyframe(keyframeIndex);
      }
}

function scrollControl(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.deltaY > 0) {
        forwardClicked();
    } else if (event.deltaY < 0) {
        backwardClicked();
    }
}

function drawKeyframe(kfi) {
    let kf = keyframes[kfi];
    resetActiveLines();
    updateActiveVerse(kf.activeVerse);
    for (line of kf.activeLines) {
        updateActiveLine(kf.activeVerse, line);
    }

    if(kf.svgUpdate && Array.isArray(kf.svgUpdate)){
        kf.svgUpdate.forEach(func => func());
    }
}

function scrollToActiveVerse(id) {
    var leftColumn = document.querySelector(".right-top-mid");
    
    var activeVerse = document.getElementById("verse" + id);
    
    var verseRect = activeVerse.getBoundingClientRect();
    var leftColumnRect = leftColumn.getBoundingClientRect();

    var desiredScrollTop = verseRect.top + leftColumn.scrollTop - leftColumnRect.top - (leftColumnRect.height - verseRect.height) / 2;
    leftColumn.scrollTo({
        top: desiredScrollTop,
        behavior: 'smooth'
    })
}

function resetActiveLines() {
    d3.selectAll(".line").classed("active-line", false);
}

function updateActiveLine(vid, lid) {
    let thisVerse = d3.select("#verse" + vid);
    thisVerse.select("#line" + lid).classed("active-line", true);
}

function updateActiveVerse(id) {
    d3.selectAll(".verse").classed("active-verse", false);
    d3.select("#verse" + id).classed("active-verse", true);
    scrollToActiveVerse(id);
}

function updateLeftColumnContent(index) {
    if (index >= 0 && index < textData.length) {
      document.querySelector('.content').innerText = textData[index];
    } else {
      console.error("Index out of bounds");
    }
  }
  
function initialiseSVG() {
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    const margin = { top: 80, right: 40, bottom: 80, left: 80 };
    chartWidth = width - margin.left - margin.right;
    chartHeight = height - margin.top - margin.bottom;
    chart = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    xScale = d3.scaleBand()
          .domain([])
          .range([0, chartWidth])
          .padding(0.1);
    
    yScale = d3.scaleLinear()
          .domain([])
          .nice()
          .range([chartHeight, 0]);
  
    chart.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${chartHeight})`)
          .call(d3.axisBottom(xScale))
          .selectAll("text");
    
    chart.append("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(yScale))
          .selectAll("text");
    
    svg.append("text")
          .attr("id", "chart-title")
          .attr("x", width / 2)
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .style("font-size", "18px")
          .style("fill", "white")
          .text("Title");
}

const zoomLevels = {
    in: 1.2,
    out: 1/1.2
};

function zoomIn() {
    currentZoomLevel *= zoomLevels.in;
    xScale.range([0, chartWidth * currentZoomLevel]).padding(0.1 / currentZoomLevel);
    if (chartNum == 1) {
        updateBarChart(locationChartData);
    } 
    else if (chartNum == 0){
        updateBarChart2(primaryChartData);
    }
    else if (chartNum == 2) {
        updateBarChart(quintileChartData);
    }
}

function zoomOut() {
    currentZoomLevel *= zoomLevels.out;
    xScale.range([0, chartWidth * currentZoomLevel]).padding(0.1 / currentZoomLevel);
    if (chartNum == 1) {
        updateBarChart(locationChartData);
    } 
    else if (chartNum == 0){
        updateBarChart2(primaryChartData);
    }
    else if (chartNum == 2) {
        updateBarChart(quintileChartData);
    }
}

async function initialize() {
    await loadData();
    initialiseSVG();
    drawKeyframe(keyframeIndex);
}


initialize();
