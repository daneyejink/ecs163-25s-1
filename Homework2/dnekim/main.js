d3.csv("data/studentAlcData/student-mat.csv").then(rawData => {
  rawData.forEach(d => {
    d.Dalc = +d.Dalc;
    d.Walc = +d.Walc;
  });

  // Filter and compute averages
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
  const svgWidth = 450, svgHeight = 350;
  const margin = { top: 40, right: 30, bottom: 60, left: 50 };
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
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Avg Dalc vs Walc by Family Status");

    ["LE3", "GT3"].forEach(famsize => {
      // Label for Together (T)
      g.append("text")
        .attr("x", x0(famsize) + x1("T") + x1.bandwidth() / 2)
        .attr("y", -3)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .text("T");
    
      // Label for Not Together (A)
      g.append("text")
        .attr("x", x0(famsize) + x1("A") + x1.bandwidth() / 2)
        .attr("y", -3)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .text("A");
    });
    
const legendText = [
  { label: "T = Parents Together", x: 10, y: height + margin.bottom + 10 },
  { label: "A = Parents Not Together", x: 10, y: height + margin.bottom + 25 },
  { label: "Pink = Dalc", x: 350, y: height + margin.bottom + 15 },
  { label: "Green = Walc", x: 350, y: height + margin.bottom + 28 }
];

legendText.forEach(item => {
  svg.append("text")
    .attr("x", item.x)
    .attr("y", item.y)
    .attr("alignment-baseline", "middle")
    .style("font-size", "12px")
    .style("font-weight", "normal")
    .text(item.label);
});


}).catch(error => {
  console.error(error);
});


// Scatter Plot
d3.csv("data/studentAlcData/student-mat.csv").then(data => {

  data.forEach(d => {
    d.goout = +d.goout;  
    d.absences = +d.absences;     
    d.G3 = +d.G3;    
    d.dalc = +d.Dalc;           
  });

  // Set dimensions and margins
  const margin = { top: 70, right: 20 * 0.7, bottom: 20, left: 60 * 0.8 };
  const width = 600 * 0.7 - margin.left - margin.right;
  const height = 450 * 0.7 - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select("#scatter-plot")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale: absences
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.absences)])
    .range([0, width * 0.9]);

  // Y scale: final grade (G3)
  const y = d3.scaleLinear()
    .domain([0, 20]) // Final grade (G3) is assumed to be between 0 and 20
    .range([height * 0.95, 0]);

  // Color scale: How much a student goes out (1–5)
const color = d3.scaleOrdinal()
.domain([1, 2, 3, 4, 5])
.range(d3.schemeSet2);

const size = d3.scaleLinear()
  .domain([1, 5])    // Dalc range
  .range([3, 10]);   // Circle radius in pixels


  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - 20})`)
    .call(d3.axisBottom(x))

  // Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Circles (data points)
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => x(d.absences))    // Position by absences (X axis)
      .attr("cy", d => y(d.G3))          // Position by G3 (Y axis)
      .attr("r", d => size(d.Dalc))                       // Static size for simplicity
      .attr("fill", d => color(d.goout))     // Color by G3 (final grade)
      .attr("opacity", 0.75)
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5);

  // X Axis Label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .text("School Absences");

  // Y Axis Label
  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .attr("transform", "rotate(-90)")
    .text("Final Grade (G3)");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .attr("font-weight", "bold")
    .text("Impact of School Absences on Final Grades");

// Legend for "Going Out" levels
const gooutLegend = svg.append("g")
  .attr("transform", `translate(${width + 30}, 20)`);  // Adjust position as needed

// Title for the "Going Out" scale
gooutLegend.append("text")
  .attr("x", -80)
  .attr("y", -10)
  .text("Going Out")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");

// Go Out levels
const gooutLevels = [0, 1, 2, 3, 4, 5];

// Rectangles for goout levels, skip 0
gooutLegend.selectAll("rect")
  .data(gooutLevels.filter(d => d !== 0))  // remove 0 from rect data
  .enter()
  .append("rect")
    .attr("x", -50)
    .attr("y", (d, i) => (i + 0) * 20)   // shift y by 1 to keep spacing correct
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", d => color(d));
    
// Text labels for all levels (0-5)
gooutLegend.selectAll("text")
  .data(gooutLevels)
  .enter()
  .append("text")
    .attr("x", -60)
    .attr("y", (d, i) => i * 20 - 10)
    .attr("dy", "0.35em")
    .text(d => d)
    .attr("font-size", "12px");


// Legend for circle sizes (Dalc)
const sizeLegend = svg.append("g")
  .attr("transform", `translate(${width - 120}, 20)`);  // Adjust position if needed

// Title
sizeLegend.append("text")
  .attr("x", 0)
  .attr("y", -10)
  .text("DALC")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");

// Define levels
const sizeLabels = [
  { label: "Low", value: 1 },
  { label: "Medium", value: 3 },
  { label: "High", value: 5 }
];

sizeLegend.selectAll("circle")
  .data(sizeLabels)
  .enter()
  .append("circle")
    .attr("cy", (d, i) => i * 30 + 15)
    .attr("cx", 15)
    .attr("r", d => size(d.value))
    .attr("fill", "none")
    .attr("stroke", "#555");

sizeLegend.selectAll("text.size-label")
  .data(sizeLabels)
  .enter()
  .append("text")
    .attr("class", "size-label")
    .attr("x", 35)
    .attr("y", (d, i) => i * 30 + 15)
    .attr("dy", "0.35em")
    .text(d => d.label)
    .attr("font-size", "12px");

});



// Sankey Chart

d3.csv("data/studentAlcData/student-mat.csv").then(function(data) {
  const margin = { top: 20, right: 20, bottom: 25, left: 40 };
  const width = 850 - margin.left - margin.right;
  const height = 220 - margin.top - margin.bottom;

  
  const svg = d3.select("#sankey-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    
  const stages = ["famsup", "schoolsup", "internet", "activities", "higher", "alc_use"];


    // Create a lookup table to map original values to descriptive names
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
      "No Higher Education": "#ff9933",  // Changed to orange
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
    node.name = labelMapping[node.name] || node.name;  // Use original name if no mapping exists
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

  // Map source and target names to their descriptive labels
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

// Add labels above each node (cleaner and not inside the box)
svg.append("g")
  .selectAll("text")
  .data(sankeyData.nodes)
  .enter()
  .append("text")
  .attr("x", d => (d.x0 + d.x1) / 2)
  .attr("y", d => d.y0 - 3) // place above the box; use d.y1 + 14 to put below
  .attr("text-anchor", "middle")
  .style("font-size", "8.5px")
  .style("font-weight", "bold")

  .text(d => d.name);

  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", margin.top + 170)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("The Ripple Effect: From Support Networks to Student Alcohol Use");

});
