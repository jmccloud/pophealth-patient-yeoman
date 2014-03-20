

margin = {top:50, bottom: 10, left:10, right:10}

width = 750 
height = 300
cluster = d3.layout.tree().size([width- margin.left - margin.right,height - margin.top - margin.bottom])
root = null
i = 0
duration = 500

depth = {
	"0": ""
	"1": "Region "
	"2": "Facilty "
	"3": ""
}

heightScale = d3.scale.linear().range([0,height/3,height/2])

svg = d3.select("#region").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("overflow", "visible;")
	.append("g").attr("transform", "translate(0,#{margin.top})")
diagonal = d3.svg.diagonal()
	.projection((d) -> [d.x, d.y])
d3.json "REGIONs.json", (json) ->
	root = json
	root.x0 = width/2
	root.y0 = height/2

	collapse = (d) ->
		if d.children?
			d._children = d.children
			d.children = null
			d._children.forEach(collapse)
		else
			d.children = d._children
			d._children = null

	root.children.forEach(collapse)
	root.active = true
	update(root)
		


update = (source) => 
	nodes = cluster.nodes(root)
	links = cluster.links(nodes)
	cluster.separation((a,b) -> 25)
	heightScale.domain(d3.extent(nodes, (d) -> d.depth))
	# Normalize for constant height
	nodes.forEach (d) -> 
		d.y = heightScale(d.depth)
		if not d.size? then d.size = 3
	

	

	# We need to make the VISN Names human readable
	# nodes.forEach (d) -> if d.depth == 1 then d.name = visns.filter((visn) -> visn.visn == d.name )[0].name

	node = svg.selectAll("g.node")
		.data(nodes, (d) -> d.id || d.id = ++i)

	nodeEnter = node.enter().append("g")
		.attr("class", "node")
		.attr("transform", "translate(#{source.x0}, #{source.y0})")
		.on("click", click)
		# .on("mouseover", highlight)
		# .on("mouseout", highlight)

	nodeEnter.append("circle")
		.attr("r", 1e-6)
		.style("fill", (d) -> if d.children? then "lightsteelblue" else "#fff")

	nodeEnter.append("text")
		.transition().duration(duration)
		.attr("transform", "rotate(45, -9, 4.5)")
		.style("fill-opacity", 1.0)
		

	nodeUpdate = node.transition()
		.duration(duration)
		.attr("transform", (d) -> "translate(#{d.x}, #{d.y})")

	nodeUpdate.select("circle")
		.attr("r", (d) -> d.size)
		.style("fill", (d) -> if d._children? then "lightsteelblue" else "#fff")
		.attr("fill-opacity", (d) -> if d.hidden then .3 else 1)

	nodeUpdate.select("text")
		.text((d) -> if d.hidden then "" else "#{depth[d.depth]}#{d.name}")
		.attr("transform", (d) -> if d.active then "translate(0, 15) rotate(0)" else "rotate(45, -9, 4.5)")


	nodeExit = node.exit()
		.transition()
		.duration(duration)
		.attr("transform", (d) -> "translate(#{source.x}, #{source.y})")
		.remove()
	node.exit().select("text").remove()

	nodeExit.select("circle")
		.attr("r", 1e-6)


	link = svg.selectAll("path.link")
		.data(links, (d) -> d.target.id)

	link.enter().insert("path", "g")
		.classed("link", true)
		.attr("target", (d) -> d.target.id)
		.attr("d", (d)-> 
			o = {x: source.x0, y: source.y0}
			return diagonal({source: o, target: o}))


	
	link.transition()
		.duration(duration)
		.attr("d", diagonal)


	link.exit().transition()
		.duration(duration)
		.attr("d", (d)-> 
			o = {x: source.x, y: source.y}
			return diagonal({source: o, target: o}))
		.remove()

	nodes.forEach (d) -> 
		d.x0 = d.x
		d.y0 = d.y



highlight = (d, value) => 
	links = d3.selectAll($("path.link[target=#{d.id}]"))
	# debugger
	if links.node()? then links.classed("active", value)
	if d.parent? and value then highlight(d.parent, value)



click = (d) =>

	if d.children?
		d.active = false
		d._children = d.children
		d.children = null
		d.parent?.children.forEach((d) -> d.hidden = false)
		d.size = 3.5
		highlight(d,false)

	else if d._children?
		highlight(d,true)
		d.active=true
		d.size = 6
		d.parent?.children.forEach((d) -> 
			d.hidden = true
		)
		d.hidden = false
		d.children = d._children
		d._children = null
	else
	update(d)  		
