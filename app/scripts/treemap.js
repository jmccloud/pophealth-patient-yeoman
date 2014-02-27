(function() {
  var click, cluster, depth, diagonal, duration, height, heightScale, highlight, i, margin, root, svg, update, width,
    _this = this;

  margin = {
    top: 50,
    bottom: 10,
    left: 10,
    right: 10
  };

  width = 750;

  height = 300;

  cluster = d3.layout.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

  root = null;

  i = 0;

  duration = 500;

  depth = {
    "0": "",
    "1": "Region",
    "2": "Facilty ",
    "3": ""
  };

  heightScale = d3.scale.linear().range([0, height / 3, height / 2]);

  svg = d3.select("#region").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("overflow", "visible;").append("g").attr("transform", "translate(0," + margin.top + ")");

  diagonal = d3.svg.diagonal().projection(function(d) {
    return [d.x, d.y];
  });

  d3.json("REGIONs.json", function(json) {
    var collapse;
    root = json;
    root.x0 = width / 2;
    root.y0 = height / 2;
    collapse = function(d) {
      if (d.children != null) {
        d._children = d.children;
        d.children = null;
        return d._children.forEach(collapse);
      } else {
        d.children = d._children;
        return d._children = null;
      }
    };
    root.children.forEach(collapse);
    root.active = true;
    return update(root);
  });

  update = function(source) {
    var link, links, node, nodeEnter, nodeExit, nodeUpdate, nodes;
    nodes = cluster.nodes(root);
    links = cluster.links(nodes);
    cluster.separation(function(a, b) {
      return 25;
    });
    heightScale.domain(d3.extent(nodes, function(d) {
      return d.depth;
    }));
    nodes.forEach(function(d) {
      d.y = heightScale(d.depth);
      if (d.size == null) {
        return d.size = 3;
      }
    });
    node = svg.selectAll("g.node").data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });
    nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", "translate(" + source.x0 + ", " + source.y0 + ")").on("click", click);
    nodeEnter.append("circle").attr("r", 1e-6).style("fill", function(d) {
      if (d.children != null) {
        return "lightsteelblue";
      } else {
        return "#fff";
      }
    });
    nodeEnter.append("text").transition().duration(duration).attr("transform", "rotate(45, -9, 4.5)").style("fill-opacity", 1.0);
    nodeUpdate = node.transition().duration(duration).attr("transform", function(d) {
      return "translate(" + d.x + ", " + d.y + ")";
    });
    nodeUpdate.select("circle").attr("r", function(d) {
      return d.size;
    }).style("fill", function(d) {
      if (d._children != null) {
        return "lightsteelblue";
      } else {
        return "#fff";
      }
    }).attr("fill-opacity", function(d) {
      if (d.hidden) {
        return .3;
      } else {
        return 1;
      }
    });
    nodeUpdate.select("text").text(function(d) {
      if (d.hidden) {
        return "";
      } else {
        return "" + depth[d.depth] + d.name;
      }
    }).attr("transform", function(d) {
      if (d.active) {
        return "translate(0, 15) rotate(0)";
      } else {
        return "rotate(45, -9, 4.5)";
      }
    });
    nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) {
      return "translate(" + source.x + ", " + source.y + ")";
    }).remove();
    node.exit().select("text").remove();
    nodeExit.select("circle").attr("r", 1e-6);
    link = svg.selectAll("path.link").data(links, function(d) {
      return d.target.id;
    });
    link.enter().insert("path", "g").classed("link", true).attr("target", function(d) {
      return d.target.id;
    }).attr("d", function(d) {
      var o;
      o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal({
        source: o,
        target: o
      });
    });
    link.transition().duration(duration).attr("d", diagonal);
    link.exit().transition().duration(duration).attr("d", function(d) {
      var o;
      o = {
        x: source.x,
        y: source.y
      };
      return diagonal({
        source: o,
        target: o
      });
    }).remove();
    return nodes.forEach(function(d) {
      d.x0 = d.x;
      return d.y0 = d.y;
    });
  };

  highlight = function(d, value) {
    var links;
    links = d3.selectAll($("path.link[target=" + d.id + "]"));
    if (links.node() != null) {
      links.classed("active", value);
    }
    if ((d.parent != null) && value) {
      return highlight(d.parent, value);
    }
  };

  click = function(d) {
    var _ref, _ref1;
    if (d.children != null) {
      d.active = false;
      d._children = d.children;
      d.children = null;
      if ((_ref = d.parent) != null) {
        _ref.children.forEach(function(d) {
          return d.hidden = false;
        });
      }
      d.size = 3.5;
      highlight(d, false);
    } else if (d._children != null) {
      highlight(d, true);
      d.active = true;
      d.size = 6;
      if ((_ref1 = d.parent) != null) {
        _ref1.children.forEach(function(d) {
          return d.hidden = true;
        });
      }
      d.hidden = false;
      d.children = d._children;
      d._children = null;
    } else {

    }
    return update(d);
  };

}).call(this);
