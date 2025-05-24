d3.csv("data/studentAlcData/student-mat.csv").then(rawData => {
  rawData.forEach(d => {
    d.Dalc = +d.Dalc;
    d.Walc = +d.Walc;
  });

  const tip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background-color", "white")
  .style("padding", "5px 10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("opacity", 0)
  .style("z-index", 1000)
  .html("");


  const filteredData = rawData.filter(d =>
    (d.Pstatus === "T" || d.Pstatus === "A") &&
    (d.famsize === "LE3" || d.famsize === "GT3")
  );

  const processedData = [];
  ["T", "A"].forEach(pstatus => {
    ["LE3", "GT3"].forEach(famsize => {
      const group = filteredData.filter(d => d.Pstatus === pstatus && d.famsize === famsize);
      const avgDalc = group.length ? d3.mean(group, d => d.Dalc) : 0;
      const avgWalc = group.length ? d3.mean(group, d => d.Walc) : 0;

      processedData.push({ Pstatus: pstatus, famsize, type: "Dalc", value: avgDalc });
      processedData.push({ Pstatus: pstatus, famsize, type: "Walc", value: avgWalc });
    });
  });

  // SVG setup
  const svgWidth = 600, svgHeight = 400;
  const margin = { top: 50, right: 30, bottom: 60, left: 50 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Grouping by famsize and Pstatus
  const x0 = d3.scaleBand()
    .domain(["LE3", "GT3"])
    .range([0, width])
    .padding(0.2);

  const x1 = d3.scaleBand()
    .domain(["T", "A"])
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const x2 = d3.scaleBand()
    .domain(["Dalc", "Walc"])
    .range([0, x1.bandwidth()])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(processedData, d => d.value)])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(["Dalc", "Walc"])
    .range(["#f7b6d2", "#b2e2b3"]);

  // Draw grouped bars
  const famGroups = g.selectAll(".famsize")
    .data(["LE3", "GT3"])
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x0(d)},0)`);

  famGroups.each(function(fam) {
    const group = d3.select(this);

    group.selectAll("g")
      .data(["T", "A"])
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x1(d)},0)`)
      .selectAll("rect")
      .data(pstatus => processedData.filter(d => d.famsize === fam && d.Pstatus === pstatus))
      .enter()
      .append("rect")
      
      .on("mouseover", function(d) {
        d3.select(this).attr("fill", "#ffff99");

        tip.style("opacity", 1)
           .html(`Pstatus: ${d.Pstatus}<br/>Famsize: ${d.famsize}<br/>${d.type}: ${d.value.toFixed(2)}`)
           .style("left", (d3.event.pageX + 10) + "px")
           .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mousemove", function(event) {
        tip.style("left", (d3.event.pageX + 10) + "px")
           .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this).attr("fill", color(d.type));
        tip.style("opacity", 0);
      })
      
      .attr("x", d => x2(d.type))
      .attr("y", d => y(d.value))
      .attr("width", x2.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.type));
  });
  

  // Axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0));

  g.append("g")
    .call(d3.axisLeft(y).ticks(5));

  // Labels
  svg.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight - 15)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Family Size (<=3 or >3)");
    

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -svgHeight / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .text("Average Alcohol Consumption");

  svg.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", 17)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Avg Dalc vs Walc by Family Status");

    ["LE3", "GT3"].forEach(famsize => {
      // Label for Together (T)
      g.append("text")
        .attr("x", x0(famsize) + x1("T") + x1.bandwidth() / 2)
        .attr("y", -7)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("T");
    
      // Label for Not Together (A)
      g.append("text")
        .attr("x", x0(famsize) + x1("A") + x1.bandwidth() / 2)
        .attr("y", -7)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("A");
    });
    
const legendText = [
  { label: "T = Parents Together", x: 10, y: height + margin.bottom + 20 },
  { label: "A = Parents Not Together", x: 10, y: height + margin.bottom + 35 },
  { label: "Pink = Dalc", x: 450, y: height + margin.bottom + 25 },
  { label: "Green = Walc", x: 450, y: height + margin.bottom + 38 }
];

legendText.forEach(item => {
  svg.append("text")
    .attr("x", item.x)
    .attr("y", item.y)
    .attr("alignment-baseline", "middle")
    .style("font-size", "12px")
    .style("font-weight", "normal")
    .text(item.label);

  svg.append("text")
    .attr("x", svgWidth - 60)
    .attr("y", 50)
    .attr("text-anchor", "start")
    .style("font-size", "15px")
    .style("font-style", "italic")
    .style("fill", "blue")
    .style("pointer-events", "none")
    .text("Hover!");
  
});

}).catch(error => {
  console.error(error);
});



d3.csv("data/studentAlcData/student-mat.csv").then(data => {
  // Data preprocessing
  data.forEach(d => {
    d.goout = +d.goout;
    d.absences = +d.absences;
    d.G3 = +d.G3;
    d.dalc = +d.Dalc;
  });

  const margin = { top: 70, right: 200, bottom: 40, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svgContainer = d3.select("#scatter-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  
  const svg = svgContainer.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.absences)])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, 20])
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain([1, 2, 3, 4, 5])
    .range(d3.schemeSet2);

  const size = d3.scaleLinear()
    .domain([1, 5])
    .range([3, 10]);

  // X axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Y axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

  // Circles
  const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.absences))
    .attr("cy", d => y(d.G3))
    .attr("r", d => size(d.dalc))
    .attr("fill", d => color(d.goout))
    .attr("opacity", 0.75)
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5);

  // Axis labels and title (same as before)
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .text("School Absences");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .text("Final Grade (G3)");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Impact of School Absences on Final Grades");

  // Legend for Goout (color) with click filtering
const gooutLegend = svg.append("g")
.attr("transform", `translate(${width + 20}, 20)`);

// Title for the legend
gooutLegend.append("text")
.attr("x", 0)
.attr("y", -30)
.text("Going Out Level")
.attr("font-size", "12px")
.attr("font-weight", "bold");

// Add the "Click to filter!" instruction once, above the legend
gooutLegend.append("text")
.attr("x", 0)
.attr("y", -10)
.text("Click square to filter!")
.attr("font-size", "12px")
.attr("font-style", "italic")
.attr("fill", "#555")
.style("user-select", "none");

// Keep track of currently selected goout level (null means no filter)
let selectedGoout = null;

[1, 2, 3, 4, 5].forEach((val, i) => {
gooutLegend.append("rect")
  .attr("x", 0)
  .attr("y", i * 20)
  .attr("width", 15)
  .attr("height", 15)
  .attr("fill", color(val))
  .style("cursor", "pointer")
  .on("click", function() {
    if (selectedGoout === val) {
      selectedGoout = null;
      circles.attr("opacity", 0.75).attr("pointer-events", "all");
      gooutLegend.selectAll("rect").attr("stroke", null);
    } else {
      selectedGoout = val;
      circles
        .attr("opacity", d => d.goout === val ? 1 : 0.1)
        .attr("pointer-events", d => d.goout === val ? "all" : "none");
      gooutLegend.selectAll("rect").attr("stroke", null);
      d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
    }
  });

gooutLegend.append("text")
  .attr("x", 22)
  .attr("y", i * 20 + 12)
  .text(val)
  .attr("font-size", "12px")
  .style("user-select", "none");
});

  // Legend for Dalc (size) - unchanged for now
  const sizeLegend = svg.append("g")
    .attr("transform", `translate(${width + 20}, 160)`);

    sizeLegend.append("text")
    .attr("x", 0)
    .attr("y", -5)
    .text("Click circles to filter!")
    .attr("font-size", "12px")
    .attr("font-style", "italic")
    .attr("fill", "#555")
    .style("user-select", "none");
  
  sizeLegend.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .text("Weekday Drinking (Dalc)")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");
  

  const sizeLabels = [
    { label: "Low", value: 1 },
    { label: "Medium", value: 3 },
    { label: "High", value: 5 }
  ];

  sizeLabels.forEach((d, i) => {
    sizeLegend.append("circle")
      .attr("cx", 10)
      .attr("cy", i * 30 + 10)
      .attr("r", size(d.value))
      .attr("fill", "none")
      .attr("stroke", "#555");

    sizeLegend.append("text")
      .attr("x", 30)
      .attr("y", i * 30 + 14)
      .text(d.label)
      .attr("font-size", "12px");
  })
  // Keep track of currently selected dalc level (null means no filter)
let selectedDalc = null;

sizeLabels.forEach((d, i) => {
  sizeLegend.append("circle")
    .attr("cx", 10)
    .attr("cy", i * 30 + 10)
    .attr("r", size(d.value))
    .attr("fill", "none")
    .attr("stroke", "#555")
    .style("cursor", "pointer")
    .on("click", function() {
      if (selectedDalc === d.value) {
        // toggle off filter
        selectedDalc = null;
        circles.attr("opacity", 0.75).attr("pointer-events", "all");
        sizeLegend.selectAll("circle").attr("stroke-width", 1);
      } else {
        selectedDalc = d.value;
        circles
          .attr("opacity", c => c.dalc === d.value ? 1 : 0.1)
          .attr("pointer-events", c => c.dalc === d.value ? "all" : "none");
        sizeLegend.selectAll("circle").attr("stroke-width", 1);
        d3.select(this).attr("stroke-width", 3);
      }
    });

  sizeLegend.append("text")
    .attr("x", 30)
    .attr("y", i * 30 + 14)
    .text(d.label)
    .attr("font-size", "12px");
}) 
});



// Sankey Chart
d3.csv("data/studentAlcData/student-mat.csv").then(function(data) {
  const margin = { top: 20, right: 20, bottom: 25, left: 40 };
  const width = 1250 - margin.left - margin.right;
  const height = 270 - margin.top - margin.bottom;

  
  const svg = d3.select("#sankey-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    
  const stages = ["famsup", "schoolsup", "internet", "activities", "higher", "alc_use"];


    // Create a lookup table to map original values to select names
    const labelMapping = {
      "famsup_no": "No Fam Support",
      "famsup_yes": "Fam Support",
      "schoolsup_no": "No School Support",
      "schoolsup_yes": "School Support",
      "internet_no": "No Internet",
      "internet_yes": "Internet",
      "activities_no": "No Activities",
      "activities_yes": "Activities",
      "higher_no": "No Higher Education",
      "higher_yes": "Higher Education",
      "alc_use": "Alcohol Use"
    };

    const colorMapping = {
      "No Fam Support": "#b3d9ff",
      "Fam Support": "#3399ff",
      "No School Support": "#ffb3b3",
      "School Support": "#ff6666",
      "No Internet": "#d6aaff",
      "Internet": "#99cc99",
      "No Activities": "#ffff99",
      "Activities": "#66b3ff",
      "No Higher Education": "#ff9933", 
      "Higher Education": "#a8e6cf",
      "Alcohol Use": "#ffcc00"
    };    
  
  data.forEach(d => {
    d.Dalc = +d.Dalc;
    d.Walc = +d.Walc;
    const avg = (d.Dalc + d.Walc) / 2;
    d.alc_use = avg >= 3 ? "High Alc Use" : "Low Alc Use";
  });

  const links = [];
  stages.forEach((stage, i) => {
    if (i === stages.length - 1) return;

    const sourceStage = stage;
    const targetStage = stages[i + 1];
    const stageMap = {};

    data.forEach(d => {
      const source = d[sourceStage];
      const target = d[targetStage];
      if (!source || !target) return;

      const sourceKey = sourceStage === "alc_use" ? source : `${sourceStage}_${source}`;
      const targetKey = targetStage === "alc_use" ? target : `${targetStage}_${target}`;
      const key = `${sourceKey}->${targetKey}`;
      stageMap[key] = (stageMap[key] || 0) + 1;
    });

    for (let key in stageMap) {
      const [sourceFull, targetFull] = key.split("->");
      links.push({
        source: sourceFull,
        target: targetFull,
        value: stageMap[key]
      });
    }
  });

  const nodeNames = Array.from(new Set(links.flatMap(link => [link.source, link.target])));
  const nodes = nodeNames.map(name => ({ name }));
  const nodeIndex = {};
  nodeNames.forEach((name, i) => { nodeIndex[name] = i; });

  // Replace node names with their descriptive labels from the lookup table
  nodes.forEach((node) => {
    node.name = labelMapping[node.name] || node.name;  
  });

  links.forEach(link => {
    link.source = nodeIndex[link.source];
    link.target = nodeIndex[link.target];
  });

  const sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(15)
    .extent([[0, 0], [width, height]]);

  const sankeyData = sankey({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
  });

   // Draw links with dynamic color based on categories
svg.append("g")
  .selectAll("path")
  .data(sankeyData.links)
  .enter()
  .append("path")
  .attr("d", d3.sankeyLinkHorizontal())
  .attr("stroke", "#888")
  .attr("stroke-width", function(d) { return Math.max(1, d.width); })
  .attr("fill", "none")
  .attr("opacity", 0.5)
  .style("stroke", function(d) {
  // Get the source and target node names
  const sourceName = sankeyData.nodes[d.source.index].name;
  const targetName = sankeyData.nodes[d.target.index].name;

  // Map source and target names to their labels
  const sourceCategory = labelMapping[sourceName] || sourceName;
  const targetCategory = labelMapping[targetName] || targetName;

  // Choose the color based on either the source or target category
  // Fallback to gray if no match is found
  return colorMapping[sourceCategory] || colorMapping[targetCategory] || "#888";
});

// Add labels to the links (values)
svg.append("g")
.selectAll("text")
.data(sankeyData.links)
.enter()
.append("text")
.attr("x", function(d) { return (d.source.x1 + d.target.x0) / 2; })
.attr("y", function(d) { return (d.source.y1 + d.target.y0) / 2; })
.attr("dy", "-0.5em")
.attr("text-anchor", "middle")
.text(function(d) { return d.value; })
.style("font-size", "12px")
.style("fill", "#000");

// Draw nodes
svg.append("g")
.selectAll("rect")
.data(sankeyData.nodes)
.enter()
.append("rect")
.attr("x", function(d) { return d.x0; })
.attr("y", function(d) { return d.y0; })
.attr("width", function(d) { return d.x1 - d.x0; })
.attr("height", function(d) { return Math.max(1, d.y1 - d.y0); })
.attr("fill", "#69b3a2")
.attr("stroke", "#333");

// Add labels above each node 
svg.append("g")
  .selectAll("text")
  .data(sankeyData.nodes)
  .enter()
  .append("text")
  .attr("x", d => (d.x0 + d.x1) / 2)
  .attr("y", d => d.y0 - 3) 
  .attr("text-anchor", "middle")
  .style("font-size", "12.5px")
  .style("font-weight", "bold")

  .text(d => d.name);

  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", margin.top + 220)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("The Ripple Effect: From Support Networks to Student Alcohol Use");

});
