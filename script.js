const width = 800;
const radius = width / 2;

const tree = d3.tree()
  .size([2 * Math.PI, radius - 100]);

const svg = d3.select("svg")
  .attr("viewBox", [-width / 2, -width / 2, width, width]);

d3.json("data.json").then(data => {

  const root = d3.hierarchy(data);
  tree(root);

  // LINKS
  svg.append("g")
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("class", "link")
    .attr("d", d3.linkRadial()
      .angle(d => d.x)
      .radius(d => d.y)
    );

  // NODES
  const node = svg.append("g")
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `
      rotate(${d.x * 180 / Math.PI - 90})
      translate(${d.y},0)
    `);

  node.append("circle")
    .attr("r", 4);

  node.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.x < Math.PI ? 6 : -6)
    .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
    .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
    .text(d => d.data.name);

});