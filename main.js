let keyframeIndex = 0;

let keyframes = [
    {
        activeVerse: 1,
        activeLines: [1],
        svgUpdate: [drawQuintileData, () => updateLeftColumnContent(0)]
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
        activeLines: [1]
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
        activeLines: [1]
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

let chart;
let chartWidth;
let chartHeight;
let xScale;
let yScale;
let textData = [
    "This is the interactive section of the blocks, will be developed in M5.",
    "Here's the second block of text with more information.",
    "Finally, this is the third block of text."
  ];

let isPie = false;
let currentZoomLevel = 1;

document.getElementById("forward-button").addEventListener("click", forwardClicked);
document.getElementById("backward-button").addEventListener("click", backwardClicked);
document.getElementById("forward-button2").addEventListener("click", forwardVerseClicked);
document.getElementById("backward-button2").addEventListener("click", backwardVerseClicked);
// document.addEventListener('mousewheel', scrollControl, {passive: false});
// Add event listeners to the zoom buttons
document.getElementById('zoom-in').addEventListener('click', zoomIn);
document.getElementById('zoom-out').addEventListener('click', zoomOut);


async function loadData() {
    await d3.json("data/quintile.json").then(data => {
        quintileChartData = data;
    });
}

function drawQuintileData() {
    console.log("Drawing the quintile data bar chart");
    console.log(quintileChartData);
    updateBarChart(quintileChartData, "Education distribution of different Quintile in US");
}

function updateBarChart(data, title = "") {
    console.log("xScale:", xScale);
    console.log("yScale:", yScale);

    const blocks = ['Block1', 'Block2', 'Block3', 'Block4', 'Block5'];
    const colorScale = d3.scaleOrdinal()
    .domain(['Block1', 'Block2', 'Block3', 'Block4', 'Block5'])
    .range(['#0D3B66', '#14466A', '#1E6F72', '#3C8DAD', '#28AFB0']);

    const series = d3.stack().keys(blocks)(data);
    console.log("Stacked data", series);

    xScale.domain(data.map(d => d.Wealth));

    const maxVal = d3.max(series, d => d3.max(d, d => d[1]));
    yScale.domain([0, maxVal]).nice();

    const barGroups = chart.selectAll(".bar-group")
        .data(series, d => d.key);

    barGroups.enter().append("g")
        .attr("class", "bar-group")
        .attr("fill", (d, i) => colorScale(i));

    chart.selectAll(".bar-group")
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => xScale(d.data.Wealth))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]));

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
    if (keyframeIndex < keyframes.length - 1) {
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
      document.querySelector('.left-column-content').innerText = textData[index];
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
    updateBarChart(quintileChartData);
}

function zoomOut() {
    currentZoomLevel *= zoomLevels.out;
    xScale.range([0, chartWidth * currentZoomLevel]).padding(0.1 / currentZoomLevel);
    updateBarChart(quintileChartData);
}


  

async function initialise() {
    await loadData();
    initialiseSVG();
    drawKeyframe(keyframeIndex);
}


initialise();
