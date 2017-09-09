import './storycurve.css';
import {select, event} from 'd3-selection';
import {line} from 'd3-shape';
import {max, sum} from 'd3-array';
import {axisTop, axisLeft} from 'd3-axis';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {zoom, zoomTransform} from 'd3-zoom';
import 'd3-tip'; //TODO: remove this dependency?


// private functions
let helper = {
	axisStyleUpdate: function(selection) {
		let xaxisContainer = selection.select('.x.axis');
		xaxisContainer.select('.domain')
			.classed('axis-domain', true);
		xaxisContainer.selectAll('.tick line')
			.classed('xaxis-tick-line', true);
		xaxisContainer.selectAll('.tick text')
			.classed('axis-text', true);

		let yaxisContainer = selection.select('.y.axis');
		yaxisContainer.select('.domain')
			.classed('axis-domain', true);
		yaxisContainer.selectAll('.tick line')
			.classed('yaxis-inner-tick', true);
		yaxisContainer.selectAll('.tick text')
			.classed('axis-text', true)
			.attr('dy', -4);
	}
};

export default class StoryCurve {

	constructor(selector) {
		this.container = selector ? select(selector) : null;
		let rect = this.container.node().getBoundingClientRect();

		this._width = rect.width;
		this._height = 350;
		this._margin = {
			top: 10,
			left: 10,
			right: 10,
			bottom: 10
		};
		this._duration = 400; // animation duration
		this._zoom = zoom();

		this._xs = scaleLinear(); //x-scale
		this._ys = scaleLinear(); //y-scale

		this._childColor = scaleOrdinal() //color scale for children
			.range(['#db2828','#f2711c','#fbbd08','#b5cc18',
				'#21ba45','#00b5ad','#2185d0','#6435c9'])
			.unknown('#9E9E9E');

		this._bandColor = scaleOrdinal()//color scale for band
			.range(['#eedaf1','#fad1df','#cfe8fc','#daddf1'])
			.unknown('rgba(0,0,0, 0.0)');
		this._backdropColor = scaleOrdinal() //color scale for backdrop
			.range(['#CFD8DC', '#90A4AE', '#607D8B'])
			.unknown('rgba(0,0,0, 0.0)');

		this._xaxis = axisTop();
		this._yaxis = axisLeft();
		this._xaxisTitle = 'Narrative order →';
		this._yaxisTitle = '← Story order';

		// this._palette = ['#00B5AD'];

		this._listners = new Map();//event listeners

		this._highlights = []; //columns to highlight

		this._showBand = false;
		this._showBackdrop = false;
		this._showChildren = false;

		//TODO: remove dependency on d3.tip
		this._tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([0, 10])
			.direction('e')
			.html(this._tooltipFormat);
	}
	draw(data) {
		if (this.container.empty()) {
			return;
		}
		this.container.datum(data);

		// console.log('---------- StoryCurve ----------');
		let width = this._width - this._margin.left - this._margin.right;
		let height = this._height - this._margin.top - this._margin.bottom;
		let xpadding = 80; // horz-space for y-axis labels
		let ypadding = 40; // vert-space for x-axis labels
		let markHeight = 8; // variable width, fixed height

		// create root container
		let svg = this.container.select('svg');
		if (svg.empty()) { // init
			svg = this.container.append('svg');
			svg.append('g')
				.attr('class', 'visarea')
				.append('defs')
				.append('clipPath')
				.attr('id', 'clipID' + Date.now())//unique clippath
				.append('rect')
				.attr('x', xpadding)
				.attr('y', ypadding);

			svg.call(this._tip);

		}
		let g = svg.select('.visarea');
		// update vis size
		svg.attr('width', this._width)
			.attr('height', this._height);
		g.attr('transform',
			'translate(' + this._margin.left + ',' + this._margin.top + ')');

		//clip path for zomming
		g.select('clipPath').select('rect')
			.attr('width', width - xpadding)
			.attr('height', height - ypadding + markHeight);

		// let tooltip = select(this).select('.tooltip');
		// if (tooltip.empty()) {
		// 	this.createTooltip(select(this)); //replace with tip
		// }

		// define scales
		this._xs.domain([0, sum(data, this._size)])
			.range([xpadding, width]);

		this._ys.domain([0, max(data, this._y)])
			.range([ypadding, height - markHeight]);

		// set default domains for color scale
		if (this._showChildren==false){
			this.___children = this._children;//backup
			this._children = ()=>['Scene'];
			this._childColor.range(['#00BCD4']);
		}else{
			if (this.___children){
				this._children = this.___children;
			}
		}
		//children
		if (this._childColor.domain().length==0){
			let categories = {};
			data.map(d=>
				this._children(d).map(
					c=>(this._child(c) in categories)?
					categories[this._child(c)]++:
					(categories[this._child(c)]=1))
				);
			categories = Object.entries(categories)
				.sort((a,b)=>b[1]-a[1])
				.map(d=>d[0])
				.slice(0,this._childColor.range().length);
			this._childColor.domain(categories);
		}
		// band
		if (this._bandColor.domain().length==0){
			let categories = {};
			data.map(d=>(this._band(d) in categories)?
				categories[this._band(d)]++:
				(categories[this._band(d)]=1));
			categories = Object.entries(categories)
				.sort((a,b)=>b[1]-a[1])
				.map(d=>d[0])
				.slice(0,this._bandColor.range().length);
			this._bandColor.domain(categories);
		}
		// backdrop
		if (this._backdropColor.domain().length==0){
			let categories = {};
			data.map(d=>(this._backdrop(d) in categories)?
				categories[this._backdrop(d)]++:
				(categories[this._backdrop(d)]=1));
			categories = Object.entries(categories)
				.sort((a,b)=>b[1]-a[1])
				.map(d=>d[0])
				.slice(0,this._backdropColor.range().length);
			this._backdropColor.domain(categories);
		}
		// compute story curve layout
		let cursor = 0;
		let markData = data.sort((d1, d2) => {// sort by x-order
			return this._x(d1) - this._x(d2);
		}).map(d => {
			let x0 = this._xs(cursor);
			cursor += this._size(d); //move cursor by width (e.g., scene length)
			let x1 = this._xs(cursor);//width = x1 - x0
			let y = this._ys(this._y(d));

			// children layout in each scene
			let children = this._children(d).map((c, i) => {
				return {
					orgData: c, //child data
					parentOrgDdata: d, //parent data
					x0: x0,
					x1: x1,
					y: y + i * markHeight //vertically stacked
				};
			});
			return {
				orgData: d,
				children: children,
				x0: x0,
				x1: x1,
				y: y,
				id: this._x(d),//unique id (no duplicate order allowed)
				xo: this._x(d),
				yo: this._y(d)
			};
		});

		// construct axes
		let xaxisContainer = g.select('.x.axis');
		if (xaxisContainer.empty()) {
			xaxisContainer = g.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + ypadding + ')');
		}

		this._xaxis.scale(this._xs);
		xaxisContainer.call(this._xaxis);

		let yaxisContainer = g.select('.y.axis');
		if (yaxisContainer.empty()) {
			yaxisContainer = g.append('g')
				.attr('class', 'y axis')
				.attr('transform', 'translate(' + xpadding + ',0)');
		}

		let ydivide = Math.round(max(markData.map(d => d.yo)) / 3);

		this._yaxis.scale(this._ys)
			.tickValues([ydivide, 2 * ydivide, 3 * ydivide])
			.tickSizeInner(-(width - xpadding))
			.tickSizeOuter(0);
		yaxisContainer.call(this._yaxis);

		helper.axisStyleUpdate(this.container);//TODO

		// draw axis labels
		if (g.select('.bg-line').empty()) {
			g.append('line')
				.attr('class', 'bg-line')
				.attr('x1', 0)
				.attr('x2', xpadding)
				.attr('y1', ypadding)
				.attr('y2', ypadding);
		}

		let axisTitles = g.selectAll('.axis-legend')
			.data([
				[width, 0, 0, this._xaxisTitle, 'end'],
				[0, height - 10, -90, this._yaxisTitle, 'start']
			]);
		axisTitles.enter()
			.append('text')
			.attr('class', 'axis-legend')
			.merge(axisTitles)
			.text(d => d[3])
			.attr('text-anchor', d => d[4])
			.attr('transform',
				d => 'translate(' + (d[0]) + ',' + (d[1]) + ')rotate(' + (d[2]) + ')');

		// draw background
		let bandSize = this._ys(ydivide) - ypadding;
		let bgdata = [
			[0, 'Beginning'],
			[bandSize, 'Middle'],
			[2 * bandSize, 'End']
		];

		let bgpanels = g.selectAll('.bgpanel')
			.data(bgdata);

		let bgpanelEnter = bgpanels.enter()
			.append('g')
			.attr('class', 'bgpanel');

		bgpanelEnter.append('text')
			.text(d => d[1])
			.attr('class', 'bg-text')
			.merge(bgpanels.select('text'))
			.attr('transform',
				d => 'translate(' + (xpadding / 2) + ',' + (ypadding + d[0] + bandSize / 2.0) + ')');

		bgpanelEnter.append('line')
			.attr('class', 'bg-line')
			.merge(bgpanels.select('line'))
			.attr('stroke-dasharray', '3,3')
			.attr('x1', 20)
			.attr('x2', xpadding)
			.attr('y1', d => ypadding + d[0] + bandSize)
			.attr('y2', d => ypadding + d[0] + bandSize);

		// main group containing marks (to be zoomed and panned)
		let main = g.select('.main');
		if (main.empty()) {
			main = g.append('g')
				.attr('clip-path', 'url(#' + g.select('clipPath').attr('id') + ')')
				.append('g')
				.attr('class', 'main');
		}

		// draw line connecting marks
		let lineData = markData.reduce((l, d) => {
			l.push([d.x0, d.y+markHeight/2]);
			l.push([d.x1, d.y+markHeight/2]);
			return l;
		}, []);

		let path = line()
			.x(d => d[0])
			.y(d => d[1]);

		let linePath = main.select('.connect-line');
		if (linePath.empty()) {
			linePath = main.append('path')
				.attr('class', 'connect-line');
				// .attr('stroke', 'url(#svgGradient)');
		}
		linePath.datum(lineData)
			.attr('d', path);

		// draw rect marks
		let sceneUpdate = main.selectAll('.scene-group')
			.data(markData, d => d.id);

		sceneUpdate.exit().remove();


		let sceneEnter = sceneUpdate.enter()
			.append('g')
			.attr('class', 'scene-group');

		sceneEnter.append('rect')
			.attr('class', 'overlay')
			.on('mouseover', (d, i, ns) => this._onMouseOver(d, i, ns))
			.on('mouseout', (d, i, ns) => this._onMouseOut(d, i, ns))
			.on('click', (d, i, ns) => this._onMouseClick(d, i, ns));

		sceneEnter.append('rect')
			.attr('class', 'overlay-horz');

		sceneEnter.append('rect')
			.attr('pointer-events', 'none')
			.attr('class', 'backdrop');

		sceneEnter.append('rect')
			.attr('pointer-events', 'none')
			.attr('class', 'band');

		// multiple children
		sceneEnter.append('g')
			.attr('class', 'children');

		sceneUpdate = sceneEnter.merge(sceneUpdate);

		sceneUpdate.select('.overlay')
			.attr('x', d => d.x0)
			.attr('y', ypadding)
			.attr('height', height - ypadding - markHeight)
			.attr('width', d => d.x1 - d.x0);

		sceneUpdate.select('.overlay-horz')
			.attr('x', xpadding)
			.attr('y', d => d.y)
			.attr('height', markHeight)
			.attr('width', width);

		sceneUpdate.select('.band')
			.attr('x', d => d.x0)
			.style('opacity', this._showBand? 1.0 : 0.0)
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'band',
						data: this._band(d.orgData)
					},
					d.orgData, this._highlights) ? 1.0 : 0.0)
			.style('fill', d =>this._bandColor(this._band(d.orgData)))//d =>
			.attr('y', d => d.y)
			.attr('width', 0)
			.attr('height', 0)
			.transition()
			.attr('y', d => d.y - 5 * markHeight)
			.duration(this._duration)
			.attr('width', d => d.x1 - d.x0)
			.attr('height', markHeight * 11); //d=>markHeight*(this._children(d.orgData).length+10))

		sceneUpdate.select('.backdrop')
			.attr('x', d => d.x0)
			.attr('y', ypadding)
			.attr('width', d => d.x1 - d.x0)
			.style('opacity', this._showBackdrop? 1.0 : 0.0)
			.style('fill', d => this._backdropColor(this._backdrop(d.orgData)))
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'backdrop',
						data: this._backdrop(d.orgData)
					},
					d.orgData, this._highlights) ? 0.25 : 0.0)
			.attr('height', 0)
			.transition()
			.duration(this._duration)
			.attr('height', height - ypadding - markHeight);


		let children = sceneUpdate.select('.children').selectAll('.mark')
			.data(d => d.children);

		children.exit().remove();

		children.enter().append('rect')
			.attr('class', 'mark')
			.attr('pointer-events', 'none')
			.attr('x', d => d.x0)
			.attr('y', d => d.y)
			.merge(children)
			.transition()
			.duration(this._duration)
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'child',
						data: d.orgData
					},
					d.parentOrgDdata, this._highlights) ? 1.0 : 0.05)
			.attr('fill', d => this._childColor(this._child(d.orgData, d.parentOrgDdata)))
			.attr('x', d => d.x0)
			.attr('y', d => d.y)
			.attr('width', d => d.x1 - d.x0)
			.attr('height', markHeight)
			.attr('y', d => d.y);

		// zoom setting
		g.call(this._zoom); //attach zoom to the vis area

		this._zoom.extent([
				[xpadding, 0],
				[width, height]
			])
			.translateExtent([
				[xpadding, 0],
				[width, height]
			])
			.scaleExtent([1, 15]);

		this._zoom.on('zoom', () => this._onZoom());

	}
	_children(d) {
		return d.characters;
	}
	// d: an element in a list returned from _children
	_child(d) {
		return d;
	}
	_band(d) {
		return d.scene_metadata.location;
	}
	_backdrop(d) {
		return d.scene_metadata.time;
	}
	_x(d) {
		return d.narrative_order;
	}
	_y(d) {
		return d.story_order;
	}
	_size(d) {
		return d.scene_metadata.size;
	}
	_onZoom() {
		this._transformVis(event.transform);
		if (this._listners['zoom']) {
			this._listners['zoom'].call(this, event.transform);
		}
	}

	_transformVis(transform) {
		this._tip.hide();
		this.container.select('.x.axis')
			.call(this._xaxis.scale(transform.rescaleX(this._xs)));

		this.container.select('.main')
			.attr('transform',
				'translate(' + transform.x + ',0)scale(' + transform.k + ',1)');

		helper.axisStyleUpdate(this.container);
	}

	transform(op, param) { // does not call callback
		this._zoom.on('zoom', null);
		//update zoom state
		let zoomContainer = this.container.select('.visarea');
		this.container.select('.visarea')
			.call(this._zoom[op], param);
		// update vis
		let transform = zoomTransform(zoomContainer.node());
		this._transformVis(transform);
		this._zoom.on('zoom', () => this._onZoom());
		return this;
	}
	_onMouseClick() {
		if (this._listners['click']) {
			this._listners['click'].apply(this, arguments);
		}
	}
	_onMouseOver() {
		this.highlightOn(arguments[0].xo);

		if (this._listners['mouseover']) {
			this._listners['mouseover'].apply(this, arguments);
		}
	}
	_onMouseOut() {
		this.highlightOff(arguments[0].xo);

		if (this._listners['mouseout']) {
			this._listners['mouseout'].apply(this, arguments);
		}
	}
	_tooltipFormat(d) {
		let content = '<table>';
		content += ('<tr><td><span style="color:#FBBD08">(X,Y)</span></td><td>&nbsp; ' + d.xo + ', ' + d.yo + '</td></tr>');
		// content += ('<tr><td><span style="color:#767676">S.order</span></td><td>&nbsp; ' + d.so + '</td></tr>');
		content += '</table>';
		return content;
	}
	highlightOn(xo) {
		let g = this.container.selectAll('.scene-group')
			.filter((d) => d.xo == xo)
			.raise();

		g.select('.overlay')
			.style('fill-opacity', 0.5);
		g.select('.overlay-horz')
			.style('fill-opacity', 0.5);
		g.select('.band')
			.each((d, i, ns) => this._tip.show(d, ns[i]));


		g.selectAll('.mark')
			.classed('highlight', true);

		// if (!this._highlights){
		// 	return;
		// }
		// // retrieve all children
		// let coappear = this.container.selectAll('.scene-group')
		// 	.filter((d) => this._isHighlighted(d.scene, this._highlights));
		//
		// coappear.select('.'+css.mark)
		// 	.classed(css.coappeared, true);
	}
	highlightOff(xo) {
		let g = this.container.selectAll('.scene-group')
			.filter((d) => d.xo == xo)
			.raise();
		g.select('.overlay')
			.style('fill-opacity', 0.0);
		g.select('.overlay-horz')
			.style('fill-opacity', 0.0);
		g.select('.band')
			.each((d, i, ns) => this._tip.hide(d, ns[i]));
		g.selectAll('.mark')
			.classed('highlight', false);
	}
	_isHighlighted(target, d, highlights) {
		return target.data==null?false:(highlights.length==0? true:
			highlights.every(h=>
				h.type=='child'?d[h.type].includes(h.filter):
					d.scene_metadata[h.type]==h.filter));
	}

	highlights(_) {
		if (!arguments.length) return this._highlights;
		this._highlights = _;

		//highlight marks
		this.container.selectAll('.scene-group')
			.select('.band')
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'band',
						data: this._band(d.orgData)
					},
					d.orgData, this._highlights) ? 1.0 : 0.0);

		this.container.selectAll('.scene-group')
			.select('.backdrop')
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'backdrop',
						data: this._backdrop(d.orgData)
					},
					d.orgData, this._highlights) ? 0.25 : 0.0);

		this.container.selectAll('.scene-group')
			.select('.children')
			.selectAll('.mark')
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'child',
						data: d.orgData
					},
					d.parentOrgDdata, this._highlights) ? 1.0 : 0.05);

		return this;
	}
	isHighlighted(_) {
		if (!arguments.length) return this._isHighlighted;
		this._isHighlighted = _;
		return this;
	}
	showBand(_){
		if (!arguments.length) return this._showBand;
		this._showBand = _;
		this.container.selectAll('.scene-group')
			.select('.band')
			.style('opacity', this._showBand?1.0:0.0);
		return this;
	}
	showBackdrop(_){
		if (!arguments.length) return this._showBackdrop;
		this._showBackdrop = _;
		this.container.selectAll('.scene-group')
			.select('.backdrop')
			.style('opacity', this._showBackdrop?1.0:0.0);
		return this;
	}
	showChildren(_){
		if (!arguments.length) return this._showChildren;
		this._showChildren = _;
		return this;
	}
	tooltipFormat(_) {
		if (!arguments.length) return this._tooltipFormat;
		this._tooltipFormat = _;
		this._tip.html(this._tooltipFormat);
		return this;
	}
	xaxisTitle(_) {
		if (!arguments.length) return this._xaxisTitle;
		this._xaxisTitle = _;
		return this;
	}
	yaxisTitle(_) {
		if (!arguments.length) return this._yaxisTitle;
		this._yaxisTitle = _;
		return this;
	}
	children(_) {
		if (!arguments.length) return this._children;
		this._children = _;
		return this;
	}
	child(_) {
		if (!arguments.length) return this._child;
		this._child = _;
		return this;
	}
	childColorScale(_) {
		if (!arguments.length) return this._childColor;
		this._childColor = _;
		return this;
	}
	bandColorScale(_) {
		if (!arguments.length) return this._bandColor;
		this._bandColor = _;
		return this;
	}
	backdropColorScale(_) {
		if (!arguments.length) return this._backdropColor;
		this._backdropColor = _;
		return this;
	}
	band(_) {
		if (!arguments.length) return this._band;
		this._band = _;
		return this;
	}
	backdrop(_) {
		if (!arguments.length) return this._backdrop;
		this._backdrop = _;
		return this;
	}
	x(_) {
		if (!arguments.length) return this._x;
		this._x = _;
		return this;
	}
	y(_) {
		if (!arguments.length) return this._y;
		this._y = _;
		return this;
	}
	width(_) {
		if (!arguments.length) return this._width;
		this._width = _;
		return this;
	}
	height(_) {
		if (!arguments.length) return this._height;
		this._height = _;
		return this;
	}
	size(_) {
		if (!arguments.length) return this._size;
		this._size = _;
		return this;
	}
	on(name, callback) {
		this._listners[name] = callback;
		return this;
	}
}
