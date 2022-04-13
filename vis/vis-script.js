var animationLock = false; //true if some function has acquired the lock
var currentDepth = 0; //current depth of zoom (0 for root node)

//lock for animations
function acquire() {
    if (animationLock == false) {
        animationLock = true;
        return true;
    } else {
        return false;
    }
}

function release() {
    animationLock = false;
}

//https://codepen.io/osublake/pen/vdzjyg (making blobs with d3)
//options can specify a centerX, centerY, xradius, and yradius
//specifying different xradius and yradius results in an oval-ish blob
//actual distance of blob edge from center ranges from 90-100% of the specified radius value
function getBlobPath(options) {
    var points = [];
    var slice = (Math.PI * 2) / options.numPoints;
    var startAngle = 0;

    for (var i = 0; i < options.numPoints; i++) {
        var angle = startAngle + i * slice;
        var minradius = Math.sqrt(Math.pow(options.xradius, 2) * Math.pow(Math.cos(angle), 2) + Math.pow(options.yradius, 2) * Math.pow(Math.sin(angle), 2));
        var radius = minradius * 0.9 + Math.random() * (minradius * 0.1);
        var point = {
            x: options.centerX + Math.cos(angle) * radius,
            y: options.centerY + Math.sin(angle) * radius
        };
        points.push(point);
    }
    options.points = points;
    return cardinal(points, true, 1);
}

// Cardinal spline - a uniform Catmull-Rom spline with a tension option
function cardinal(data, closed, tension) {
    if (data.length < 1) return "M0 0";
    if (tension == null) tension = 1;
    var size = data.length - (closed ? 0 : 1);
    var path = "M" + data[0].x + " " + data[0].y + " C";
    for (var i = 0; i < size; i++) {
        var p0, p1, p2, p3;
        if (closed) {
            p0 = data[(i - 1 + size) % size];
            p1 = data[i];
            p2 = data[(i + 1) % size];
            p3 = data[(i + 2) % size];
        } else {
            p0 = i == 0 ? data[0] : data[i - 1];
            p1 = data[i];
            p2 = data[i + 1];
            p3 = i == size - 1 ? p2 : data[i + 2];
        }
        var x1 = p1.x + (p2.x - p0.x) / 6 * tension;
        var y1 = p1.y + (p2.y - p0.y) / 6 * tension;
        var x2 = p2.x - (p3.x - p1.x) / 6 * tension;
        var y2 = p2.y - (p3.y - p1.y) / 6 * tension;
        path += " " + x1 + " " + y1 + " " + x2 + " " + y2 + " " + p2.x + " " + p2.y;
    }
    return closed ? path + "z" : path;
}

//definition of nodes
let nodes = [{
        "key": "", //number of digits in key is used for depth
        "id": "Wisdom", //unique identifier
        "url": "Wisdom", //unique identifier with special characters removed
        "brush": "white", //color of node
        "background": "white", //color of background when zoomed in
        "txtcolor": "black", //color of text
        "logo": "static/logo-cropped.png" //for root: logo at center of node
    },
    {
        "key": 1,
        "parent": 0, //for depth 1+ nodes: key of parent node
        "id": "Heart",
        "url": "Heart",
        "brush": "#FF9A3A",
        "background": "#FF9A3A",
        "vback": "#FFE9DE", //for depth 1 nodes: voronoi back color
        "txtcolor": "white",
        "vpattern": "heartback", //for depthh 1 nodes: voronoi pattern
        "gif": "heartcover.png" //for depth 1 nodes: special overlay
    },
    {
        "key": 11,
        "parent": 1,
        "id": "Romance",
        "url": "Romance",
        "brush": "#FFFC33",
        "background": "#FFE9DE",
        "txtcolor": "black",
        "carousel": ["fire","breakups","breakups2","yield","playground","friendswithbenefits", "friendswithex", "giving", "horizons", "ldr", "right", "roses", "sex", "soulmates", "talking", "waldo", "walls"]
        // ^ for depth 2 nodes: list of images to display in carousel
    },
    {
        "key": 12,
        "parent": 1,
        "id": "Family",
        "url": "Family",
        "brush": "#FF7141",
        "background": "#FFE9DE",
        "txtcolor": "black",
        "carousel": ["birds","parentchild", "sibling"]
    },
    {
        "key": 13,
        "parent": 1,
        "id": "Friends",
        "url": "Friends",
        "brush": "#FFD33C",
        "background": "#FFE9DE",
        "txtcolor": "black",
        "carousel": ["friends","tainting","accounting","coldwarm", "emptypromises", "misalignment", "pedestal", "proximity", "stairs"]
    },
    {
        "key": 2,
        "parent": 0,
        "id": "Mind",
        "url": "Mind",
        "brush": "#150E7E",
        "background": "#150E7E",
        "vback": "#E4FAFF",
        "vpattern": "mindback",
        "txtcolor": "white",
        "gif": "mindcover-compressed.gif"
    },
    {
        "key": 21,
        "parent": 2,
        "id": "Learning",
        "url": "Learning",
        "brush": "#7E9AFF",
        "background": "#E4FAFF",
        "txtcolor": "black",
        "carousel": ["breadthdepth","fools", "trees"]
    },
    {
        "key": 22,
        "parent": 2,
        "id": "Bias",
        "url": "Bias",
        "brush": "#8CE3F3",
        "background": "#E4FAFF",
        "txtcolor": "black",
        "carousel": ["chunking","merit","worth","confirmation", "correlation", "decoy", "forbidden", "proportion"]
    },
    {
        "key": 23,
        "parent": 2,
        "id": "Creation",
        "url": "Creation",
        "brush": "#FFFC33",
        "background": "#E4FAFF",
        "txtcolor": "black",
        "carousel": ["pyramid","loop","execution", "productivitycreativity", "tasking"]
    },
    {
        "key": 3,
        "parent": 0,
        "id": "Soul",
        "url": "Soul",
        "brush": "#59B371",
        "background": "#59B371",
        "txtcolor": "white",
        "vback": "#F4FFE7",
        "vpattern": "soulback",
        "gif": "soulcover.png"
    },
    {
        "key": 31,
        "parent": 3,
        "id": "Purpose",
        "url": "Purpose",
        "brush": "#FFFC33",
        "background": "#F4FFE7",
        "txtcolor": "black",
        "carousel": ["pleasure","breakfree", "fears", "heartofgold", "lifeapproaches", "path", "values", "voice"]
    },
    {
        "key": 32,
        "parent": 3,
        "id": "Experience",
        "url": "Experience",
        "brush": "#5BDD5B",
        "background": "#F4FFE7",
        "txtcolor": "black",
        "carousel": ["travel","turtles","sonder","drunk","plans","drugs","devotion", "scarecrow", "songs", "time"]
    },
    {
        "key": 33,
        "parent": 3,
        "id": "Emotions",
        "url": "Emotions",
        "brush": "#B3DC4E",
        "background": "#F4FFE7",
        "txtcolor": "black",
        "carousel": ["lettinggo","switch","deepend","closure", "elephant", "forgiving", "names", "onions", "peerpressure", "sadness", "sayingthenicething"]
    }
];

let root = nodes[0];

//some preprocessing (needed to set up force-directed layout)
nodes.forEach((d) => d.depth = d.key.toString().length);

let links = [];
nodes.forEach(function (d) {
    if (d.hasOwnProperty('parent')) {
        links.push({
            "source": nodes.find((x) => x.key == d.parent).id,
            "target": d.id,
        });
    }
});

//calculate width and height of d3 display area, 10% of screen height reserved for navbar
var width = window.innerWidth,
    height = window.innerHeight * 0.9;
var svg = d3.select("#vis").attr("width", width).attr("height", height);

var background = svg.append("rect") 
    .attr("id", "back")
    .attr("width", width)
    .attr("height", height)
    .attr("stroke", "black")
    .style("opacity", 1)
    .attr("fill", "none");

//this layer is for the image carousel overlay
var carouselLayer = svg.append("g");
//this layer will be transformed by the zoom, anything not in this layer will not be changed when zooming
var zoomable_layer = svg.append("g"); 

//for setting up voronoi background
var voronoi_backg = zoomable_layer.append("g");
var voronoi_pathsg = zoomable_layer.append("g");

var offsetX, offsetY, zoomLevel; //variables used to calculate zooming

var maxNodeSize = 180; //maximum node size (configurabe)

var widthScale = d3.scaleLinear().domain([0, 3]).range([maxNodeSize, maxNodeSize / 4]);

var selected; //holds selected node
//define forces
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id((d) => d.id)
        .strength(1)
        .distance(0)
    )
    .force("charge", d3.forceManyBody().strength(-10000))
    .force("centerX", d3.forceX(width / 2)
        .strength((d) => (d.hasOwnProperty('parent')) ? 0.1 : 1)
    )
    .force("centerY", d3.forceY(height * 1.2 / 2)
        .strength((d) => (d.hasOwnProperty('parent')) ? 0.1 : 1)
    )
    .force("collide", d3.forceCollide()
        .radius((d) => widthScale(d.depth))
    )
    .stop(); //do not start the simulation immediately

//create nodes and links
var link = zoomable_layer.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke", "silver")
    .attr("class", "links")
    .attr("stroke-width", 0);

var node = zoomable_layer.append("g")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("class", "nodes")
    .attr("id", (d) => d.url);

var blobs = node.append("path")
    .attr("fill", (d) => d.brush)
    .attr("d", (d) => getBlobPath({
        numPoints: 12,
        centerX: 0,
        centerY: 0,
        xradius: widthScale(d.depth),
        yradius: widthScale(d.depth),
    }))
    .attr("stroke", (d) => d.brush)
    .style("--animation-time", (d) => (2 * Math.random() + 3) + "s")
    .attr("class", "pulse");

var labels = node.append("text")
    .text((d) => d.key == "" ? "" : d.id)
    .attr('text-anchor', "middle")
    .attr('x', 0)
    .attr('y', 0)
    .attr("font-size", "25px")
    .attr("fill", (d) => d.hasOwnProperty("txtcolor") ? d.txtcolor : "black")
    .style("opacity", (d) => Math.abs(d.depth - currentDepth) > 2.5 ? 0 : 0.8);

//set up simlation
simulation.nodes(nodes);
simulation.force("link")
    .links(links);

//run the simuation without moving anything
for (var i = 0; i < 600; ++i) simulation.tick(); 
//place nodes and links in final positions
link.attr("x1", function (d) {
        return d.source.x;
    })
    .attr("y1", function (d) {
        return d.source.y;
    })
    .attr("x2", function (d) {
        return d.target.x;
    })
    .attr("y2", function (d) {
        return d.target.y;
    });

//move nodes to positions calculated by simulation
node.attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
});

//event handlers
node.on('click', nodeClick);
background.on("click", backgroundClick);

//voronoi_background - calculating the shapes for the 3 different patterns
var voronoi_nodes = nodes.filter((n) => n.key === 1 || n.key === 2 || n.key === 3);
var voronoi = d3.voronoi().extent([
    [-.45 * width, -.45 * height],
    [1.45 * width, 1.45 * height]
]);
var vertices = voronoi_nodes.map((n) => [n.x, n.y]);

var voronoi_back = voronoi_backg.selectAll("path") // shapes filled with solid color
    .data(voronoi.polygons(vertices))
    .enter().append("path")
    .attr("class", "vback")
    .attr("fill", (d, i) => voronoi_nodes[i].vback)
    .attr("d", (d) => "M" + d.join("L") + "Z");

var voronoi_paths = voronoi_pathsg.selectAll("path") // shapes filled with pattern
    .data(voronoi.polygons(vertices))
    .enter().append("path")
    .attr("class", "voronoi")
    .attr("fill", (d, i) => `url(#${voronoi_nodes[i].vpattern})`)
    .attr("d", (d) => "M" + d.join("L") + "Z")
    .attr("opacity", 0.75);

//treat these same as background
voronoi_paths.on("click", backgroundClick);
voronoi_back.on("click", backgroundClick);


//clear any overlay from the screen, restore hidden nodes and position of all nodes
function removeOverlay() {
    voronoi_paths.style("opacity", 0);
    node.classed("hidden", false);
    labels.classed("hidden", false);
    d3.selectAll(".overlay").remove();
    node.on("click", nodeClick);
    node.transition().duration(1000)
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
}

// standard node click function, called when node [d] is clicked, defaults to displaying carousel position 0
function nodeClick(d) {
    nodeClick_(d, 0);
}

//focus on node [d] and display image at carousel position [pos] (if applicable)
function nodeClick_(d, pos) {
    var changeNode = d.depth != currentDepth;
    //if clicking on a different node than the current focus node, acquire lock and animate
    if (changeNode && acquire()) {
        if (d3.event) {
            d3.event.stopPropagation();
        }
        var x = d.x,
            y = d.y,
            k = maxNodeSize / widthScale(d.depth) * 1.1;
        currentDepth = d.depth;

        if (changeNode) {
            removeOverlay();
            removeCarousel();
        }
        voronoi_paths.style("opacity", 0);

        voronoi_back.transition().duration(1500).style("opacity", d.depth == 0 ? 1 : 0);

        if (d.depth == 0) {//click root
            k = 1;
            labels.transition()
                .duration(500).style("opacity", 1);
            //special icon
            d3.select("#Wisdom").append('image')
                .attr('x', -80)
                .attr('y', -80)
                .attr('width', 160)
                .attr('height', 160)
                .attr("class", "overlay")
                .attr("xlink:href", "static/logo-cropped.png");
            setTimeout(() => {
                voronoi_paths.transition().duration(1500).style("opacity", 0.75);
            }, 1000);
        } else if (d.depth == 1) {//click topic node
            setTimeout(() => positionZoomedNodes(d, k, x, y), 1000);
            labels.transition()
                .duration(500).style("opacity", (d) => d.depth == currentDepth ? 0.8 : 0);
            setTimeout(() => drawCarouselImage(d.gif, false), 1500);
            setURL(d.url,null);
        } else if (d.depth == 2 && changeNode) { //deeper nodes get clicked cause graph to fade out and repositions nodes
            //click vis node that is different from current node
            setTimeout(() => positionZoomedNodes(d, k, x, y), 1000);
            labels.transition()
                .duration(500).style("opacity", (d) => d.depth == currentDepth ? 0.8 : 0);
            setTimeout(() => drawCarousel(d, pos), 1500);
        } else if (d.depth == 2) {
            //click vis node that is the same as current node
            setTimeout(() => drawCarousel(d, pos), 500);
        }

        //matrix zoom
        zoomable_layer.transition()
            .duration(1000)
            .style("transform", "matrix(" + k + ",0,0," + k + "," + (-x * (k - 1) + (width / 2 - x)) + "," + (-y * (k - 1) + (height / 2 - y)) + ")");

        if (d.depth != 0) { //change background color to match
            background.transition()
                .duration(1000)
                .attr("fill", d.background); 
        }

        setTimeout(release, 2500);
        selected = d.url;
    }
}

//function for changing the URL displayed in the browser when a node is clicked
//[node] is the node's URL field, [vis] is the name of the vis
//so for node N and vis V, the hash is <shiro's url>/vis/#N-V
function setURL(node, vis){
    var newURL = "";
    if (node != null){
        newURL += "#"+node;
        if(vis !=null){
            newURL += "-"+vis;
        }
    }
    window.location.hash = newURL;
}

//handler for when a user clicks on the background
//resets zoom and several other things
function backgroundClick() {
    if (selected != "" && acquire()) {
        removeOverlay();
        removeCarousel();
        setURL(null,null);
        d3.selectAll(".vback").style("opacity", 1);

        //special icon
        d3.select("#Wisdom").append('image')
            .attr('x', -80)
            .attr('y', -80)
            .attr('width', 160)
            .attr('height', 160)
            .attr("class", "overlay")
            .attr("xlink:href", "static/logo-cropped.png")
            .on('click', () => nodeClick(root));

        var x = width / 2,
            y = height / 2,
            k = 0.55;
        d3.selectAll(".nodes").classed("hidden", false);
        currentDepth = 0;
        labels.transition()
            .duration(500).style("opacity", (d) => Math.abs(d.depth - currentDepth) > 2.5 ? 0 : 0.8);
        zoomable_layer.transition()
            .duration(1000)
            .style("transform", "matrix(" + k + ",0,0," + k + "," + (-x) * (k - 1) + "," + (-y) * (k - 1) + ")");
        background.transition()
            .duration(1000)
            .attr("fill", "none");
        setTimeout(() => {
            voronoi_paths.transition().duration(1500).style("opacity", 0.75);
        }, 1000);
        setTimeout(release, 2500);
        selected = "";
    }
}

var currentCarousel; //current carousel of images that is being displayed
var carouselPos; //position in carousel of currently displayed image
var currentImage; //current image element
var currentNode; //current node that is being focused

//draw carousel for [node], displaying image at position [pos]
function drawCarousel(node, pos) {
    currentCarousel = node.carousel;
    carouselPos = pos;
    currentNode = node;
    setURL(node.url, node.carousel[pos]);
    d3.select("#" + node.url).classed("hidden", true);
    drawIcon("fa-arrow-left", width * 0.15, height * 0.5, decCarousel);
    drawIcon("fa-arrow-right", width * 0.85, height * 0.5, incCarousel);
    drawText(node.id, width * 0.15, height * 0.2, "black", "none", 40);
    drawText("Copy link", width * 0.85, height * 0.2, undefined, "none", 20, () => copyToClipboard(window.location.href));
    drawCarouselImage(currentCarousel[carouselPos], true);
}

//draw text element in overlay, with [text] contents in color [txtcolor], at position [x],[y]
//can be highighted in [background] color, font size [size]
//the element will call function [callback] if clicked (optional)
function drawText(text, x, y, txtcolor, background, size, callback) {
    var t = d3.select("body").append("div")
        .style("background", background)
        .style("padding", "5px")
        .style("font-size", size)
        .attr("class", "carousel")
        .style("position", "absolute")
        .style("left", x + "px")
        .style("top", y + "px")
        .html(text)
        .style("opacity", 0)
        .style("transform", "translate(-50%,-50%)");
    t.transition().duration(500).style("opacity", 1);
    if (txtcolor !== undefined) {
        t.style("color", txtcolor);
    }
    if (callback !== undefined) {
        t.on("click", callback);
    }
}

//draw icon element in overlay at position [x],[y]
//the icon code is [cl] (look up font-awesome css icons)
//the element will call function [callback] if clicked (optional)
function drawIcon(cl, x, y, callback) {
    var t = d3.select("body").append("i")
        .style("opacity", 0)
        .attr("class", `carousel fas fa-3x ${cl}`)
        .style("position", "absolute")
        .style("left", x + "px")
        .style("top", y + "px")
        .style("opacity", 0);
    setTimeout(() => {
        var t = d3.select("." + cl)
        t.attr("color", "gray")
        t.transition().duration(500).style("opacity", 1);
        if (callback !== undefined) {
            t.on("click", callback);
        }
    }, 500)

}

//increment carousel position and change image
function incCarousel() {
    carouselPos = (carouselPos + 1) % currentCarousel.length;
    currentImage.remove();
    setURL(currentNode.url, currentCarousel[carouselPos]);
    drawCarouselImage(currentCarousel[carouselPos], true);
}

//decrement carousel position and change image
function decCarousel() {
    if (carouselPos == 0) {
        carouselPos = currentCarousel.length - 1;
    } else {
        carouselPos = carouselPos - 1;
    }
    currentImage.remove();
    setURL(currentNode.url, currentCarousel[carouselPos]);
    drawCarouselImage(currentCarousel[carouselPos], true);
}

//draw a carousel image at the center of the screen
//the image will have file name [image] and must be stored under the correct directory
function drawCarouselImage(img, addSVG) {
    currentImage = carouselLayer.append("image")
        .attr("x", 0.2 * width)
        .attr("y", 0.1 * height)
        .attr("width", 0.6 * width)
        .attr("height", 0.8 * height)
        .attr("xlink:href", "static/"+((addSVG) ? "svgs/"+currentNode.url.toLowerCase()+"/" : "")+img+((addSVG) ? ".svg" : ""))
        .style("opacity", 0)
        .attr("class", "overlay carousel");
    currentImage.transition().duration(500).style("opacity", 1);
}

//clears the carousel
function removeCarousel() {
    d3.selectAll(".carousel").remove();
    if (currentNode != undefined) {
        d3.select("#" + currentNode.url).classed("hidden", false);
    }
}

//move nearby nodes so they are on the edge of screen when zoomed in on node [d]
//[k] is a scaling factor
function positionZoomedNodes(d, k) {
    node.classed("hidden", true);
    if (d.depth != 1) {
        d3.select("#" + d.url).classed("hidden", false);
    }
    //Links: source is always the parent, target is always the child
    var parentLinks = links.filter((l) => l.target.id == d.id);
    var childrenLinks = links.filter((l) => l.source.id == d.id);
    var siblings = nodes.filter((n) => n.id != d.id && d.hasOwnProperty("parent") && n.parent == d.parent);

    if (parentLinks.length > 0) { //node has parent
        var parentLink = parentLinks[0];
        var pos = calculateOverlayPosition(parentLink.target, parentLink.source, k, 1.1, 0.95, 1.4);
        var parentNode = d3.select("#" + parentLink.source.url);
        parentNode.classed("hidden", false);
        parentNode.transition().duration(1000)
            .attr("transform", function (d) {
                return "translate(" + (pos[0] + parentLink.source.x) + "," + (pos[1] + parentLink.source.y) + ")";
            });
        setTimeout(() => {
            if (parentLink.source.url != "Wisdom") {
                var labelpos = calculateOverlayPositionAbsolute(parentLink.target, parentLink.source, 0.9);
                drawText(parentLink.source.id, labelpos[0], window.innerHeight * 0.1 + labelpos[1], parentLink.source.txtcolor, "none", 40, () => nodeClick(parentLink.source));
            } else {
                var labelpos = calculateOverlayPositionAbsolute(parentLink.target, parentLink.source, 0.95);
                svg.append('image')
                    .attr('x', -40 + labelpos[0])
                    .attr('y', -40 + labelpos[1])
                    .attr('width', 80)
                    .attr('height', 80)
                    .attr("class", "overlay")
                    .attr("xlink:href", "static/logo-cropped.png")
                    .on('click', () => nodeClick(parentLink.source));
            }
        }, 500);
    }

    if (childrenLinks.length > 0) { //node has children
        childrenLinks.forEach((l) => {
            var pos = calculateOverlayPosition(l.source, l.target, k, 0.9 - 0.05 * d.depth, 1.1, 1.4);
            var childNode = d3.select("#" + l.target.url);
            childNode.classed("hidden", false);
            childNode.transition().duration(1000)
                .attr("transform", function (d) {
                    return "translate(" + (pos[0] + l.target.x) + "," + (pos[1] + l.target.y) + ")";
                });
            setTimeout(() => {
                var labelpos = calculateOverlayPositionAbsolute(l.source, l.target, 0.9);
                drawText(l.target.id, labelpos[0], window.innerHeight * 0.1 + labelpos[1], l.target.txtcolor, "none", 24, () => nodeClick(l.target));
            }, 500);
        });
    }

    siblings.forEach((d) => {
        //override sibling clicks
        var n = d3.select("#" + d.url);
        n.on("click", backgroundClick);
    });
}

//calculate the position of node [b] preserving relative positioning
//assuming node [a] is the center of the chart, [b] will be centered on an edge
//[k], [m], [dx], and [dy] are scaling factors
function calculateOverlayPosition(a, b, k, m, dx, dy) {
    var ax = a.x,
        ay = a.y,
        bx = b.x,
        by = b.y;
    var diffx = bx - ax,
        diffy = by - ay;
    var scalingRatio = width / 2 / k / Math.abs(diffx);
    if (scalingRatio * Math.abs(diffy) > height / 2 / k) {
        scalingRatio = height / 2 / k / Math.abs(diffy);
    }
    if (dx == undefined) {
        dx = 1
    }
    if (dy == undefined) {
        dy = 1.4
    }
    scalingRatio = scalingRatio * m;
    var posx = (scalingRatio * diffx) * dx - diffx,
        posy = (scalingRatio * diffy) * dy - diffy; //force larger offset in y direction to reduce overlap
    return [posx, posy];
}

//helper function or absolute pixel positions, nodes [a] and [b]
//with scaling factor [r]
function calculateOverlayPositionAbsolute(a, b, r) {
    //smaller r means closer to center
    var ax = a.x,
        ay = a.y,
        bx = b.x,
        by = b.y;
    var diffx = bx - ax,
        diffy = by - ay;
    var scalingRatio = width / 2 / Math.abs(diffx);
    if (scalingRatio * Math.abs(diffy) > height / 2) {
        scalingRatio = height / 2 / Math.abs(diffy);
    }
    var posx = (scalingRatio * diffx) * r + width / 2,
        posy = (scalingRatio * diffy) * r + height / 2;
    return [posx, posy];
}

//allow zooming to specific nodes with # in the URL
let url = window.location.href;
let hash = window.location.hash;
if (hash != "" && hash != null && hash != undefined && hash != "#") {
    var visPos = hash.lastIndexOf('-');
    if (visPos >= 0) {
        var element_id = hash.substring(1, visPos);
        var vis_id = hash.substring(visPos+1);
        var selectedN = nodes.filter((d) => d.id === element_id)[0];
        var cPos = selectedN.carousel.findIndex((d) => d === vis_id);
        nodeClick(selectedN, cPos);
    } else {
        var element_id = hash.substring(idPos);
        d3.select(element_id).dispatch('click');
    }
} else {
    backgroundClick();
}

//heper function or copying [str] to the clipboard
function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};
