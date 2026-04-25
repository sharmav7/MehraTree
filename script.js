const marginTop = 20;
const marginRight = 40;
const marginBottom = 20;
const marginLeft = 40;

const width = window.innerWidth;
const height = window.innerHeight;

d3.json("data.json").then(data => {

  const root = d3.hierarchy(data);

  const dx = 25;
  const dy = (width - marginRight - marginLeft) / (1 + root.height);

  const tree = d3.tree().nodeSize([dx, dy]);

  const diagonal = d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  const svg = d3.select("svg")
    .attr("width", width)
    .style("max-width", "100%")
    .style("height", "auto")
    .style("font", "12px sans-serif")
    .style("user-select", "none");

  const gLink = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5);

  const gNode = svg.append("g")
    .attr("cursor", "pointer");

  function update(event, source) {
    const duration = 250;

    tree(root);

    const nodes = root.descendants();
    const links = root.links();

    // ✅ REAL bounds
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    root.each(node => {
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    });

    const treeWidth = maxY - minY;
    const treeHeight = maxX - minX;

    // ✅ CENTER BOTH AXES
    const offsetX = (width - treeWidth) / 2;
    const offsetY = (height - treeHeight) / 2;

    svg.transition()
      .duration(duration)
      .attr("height", height)
      .attr("viewBox", [
        minY - offsetX,
        minX - offsetY,
        width,
        height
      ]);

    // ---- NODES ----
    const node = gNode.selectAll("g")
      .data(nodes, d => d.id);

    const nodeEnter = node.enter().append("g")
      .attr("transform", `translate(${source.y0},${source.x0})`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .on("click", (event, d) => {
        d.children = d.children ? null : d._children;
        update(event, d);
      });

    nodeEnter.append("circle")
      .attr("r", 3)
      .attr("fill", d => d._children ? "#555" : "#999");

    nodeEnter.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d._children ? -8 : 8)
      .attr("text-anchor", d => d._children ? "end" : "start")
      .text(d =>
        d.data.nickname
          ? `${d.data.name} (${d.data.nickname})`
          : d.data.name
      )
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("paint-order", "stroke");

    node.merge(nodeEnter)
      .transition()
      .duration(duration)
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);

    node.exit().remove();

    // ---- LINKS ----
    const link = gLink.selectAll("path")
      .data(links, d => d.target.id);

    const linkEnter = link.enter().append("path")
      .attr("d", d => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      });

    link.merge(linkEnter)
      .transition()
      .duration(duration)
      .attr("d", diagonal);

    link.exit().remove();

    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // ---- INITIAL STATE ----
  root.x0 = 0;
  root.y0 = 0;

  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
  });

  root.children?.forEach(d => {
    if (d.children) d.children = null;
  });

  update(null, root);
});