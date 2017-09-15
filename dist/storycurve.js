(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3-selection'), require('d3-shape'), require('d3-array'), require('d3-axis'), require('d3-scale'), require('d3-zoom'), require('d3-tip')) :
	typeof define === 'function' && define.amd ? define(['d3-selection', 'd3-shape', 'd3-array', 'd3-axis', 'd3-scale', 'd3-zoom', 'd3-tip'], factory) :
	(global.storycurve = factory(global.d3,global.d3,global.d3,global.d3,global.d3,global.d3));
}(this, (function (d3Selection,d3Shape,d3Array,d3Axis,d3Scale,d3Zoom) { 'use strict';

var babelHelpers = {};




var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();











































babelHelpers;

// private functions
var helper = {
	axisStyleUpdate: function axisStyleUpdate(selection) {
		var xaxisContainer = selection.select('.x.axis');
		xaxisContainer.select('.domain').classed('axis-domain', true);
		xaxisContainer.selectAll('.tick line').classed('xaxis-tick-line', true);
		xaxisContainer.selectAll('.tick text').classed('axis-text', true);

		var yaxisContainer = selection.select('.y.axis');
		yaxisContainer.select('.domain').classed('axis-domain', true);
		yaxisContainer.selectAll('.tick line').classed('yaxis-inner-tick', true);
		yaxisContainer.selectAll('.tick text').classed('axis-text', true).attr('dy', -4);
	}
};

var StoryCurve = function () {
	function StoryCurve(selector) {
		classCallCheck(this, StoryCurve);

		this.container = selector ? d3Selection.select(selector) : null;
		var rect = this.container.node().getBoundingClientRect();

		this._width = rect.width;
		this._height = rect.width / 3 < 220 ? 220 : rect.width / 3;
		this._margin = {
			top: 10,
			left: 10,
			right: 10,
			bottom: 10
		};
		this._duration = 400; // animation duration
		this._zoom = d3Zoom.zoom();

		this._xs = d3Scale.scaleLinear(); //x-scale
		this._ys = d3Scale.scaleLinear(); //y-scale

		this._childColor = d3Scale.scaleOrdinal() //color scale for children
		.range(['#db2828', '#f2711c', '#fbbd08', '#b5cc18', '#21ba45', '#00b5ad', '#2185d0', '#6435c9']).unknown('#9E9E9E');

		this._bandColor = d3Scale.scaleOrdinal() //color scale for band
		.range(['#eedaf1', '#fad1df', '#cfe8fc', '#daddf1']).unknown('rgba(0,0,0, 0.0)');
		this._backdropColor = d3Scale.scaleOrdinal() //color scale for backdrop
		.range(['#CFD8DC', '#90A4AE', '#607D8B']).unknown('rgba(0,0,0, 0.0)');

		this._xaxis = d3Axis.axisTop();
		this._yaxis = d3Axis.axisLeft();
		this._xaxisTitle = 'Narrative order →';
		this._yaxisTitle = '← Story order';

		// this._palette = ['#00B5AD'];

		this._listners = new Map(); //event listeners

		this._highlights = []; //columns to highlight

		this._isZoomEnabled = true;
		this._showBand = false;
		this._showBackdrop = false;
		this._showChildren = false;

		//TODO: remove dependency on d3.tip
		this._tip = d3.tip().attr('class', 'd3-tip').offset([0, 10]).direction('e').html(this._tooltipFormat);
	}

	createClass(StoryCurve, [{
		key: 'draw',
		value: function draw(data) {
			var _this = this;

			if (this.container.empty()) {
				return;
			}
			this.container.datum(data);

			// console.log('---------- StoryCurve ----------');
			var width = this._width - this._margin.left - this._margin.right;
			var height = this._height - this._margin.top - this._margin.bottom;
			var xpadding = 80; // horz-space for y-axis labels
			var ypadding = 40; // vert-space for x-axis labels
			var markHeight = 8; // variable width, fixed height

			// create root container
			var svg = this.container.select('svg');
			if (svg.empty()) {
				// init
				svg = this.container.append('svg');
				svg.append('g').attr('class', 'visarea').append('defs').append('clipPath').attr('id', 'clipID' + Date.now()) //unique clippath
				.append('rect').attr('x', xpadding).attr('y', ypadding);

				svg.call(this._tip);
			}
			var g = svg.select('.visarea');
			// update vis size
			svg.attr('width', this._width).attr('height', this._height);
			g.attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');

			//clip path for zomming
			g.select('clipPath').select('rect').attr('width', width - xpadding).attr('height', height - ypadding + markHeight);

			// let tooltip = select(this).select('.tooltip');
			// if (tooltip.empty()) {
			// 	this.createTooltip(select(this)); //replace with tip
			// }

			// define scales
			this._xs.domain([0, d3Array.sum(data, this._size)]).range([xpadding, width]);

			this._ys.domain([0, d3Array.max(data, this._y)]).range([ypadding, height - markHeight]);

			// set default domains for color scale
			if (this._showChildren == false) {
				this.___children = this._children; //backup
				this._children = function () {
					return ['Scene'];
				};
				this._childColor.range(['#00BCD4']);
			} else {
				if (this.___children) {
					this._children = this.___children;
				}
			}
			//children
			if (this._childColor.domain().length == 0) {
				var categories = {};
				data.map(function (d) {
					return _this._children(d).map(function (c) {
						return _this._child(c) in categories ? categories[_this._child(c)]++ : categories[_this._child(c)] = 1;
					});
				});
				categories = Object.entries(categories).sort(function (a, b) {
					return b[1] - a[1];
				}).map(function (d) {
					return d[0];
				}).slice(0, this._childColor.range().length);
				this._childColor.domain(categories);
			}
			// band
			if (this._bandColor.domain().length == 0) {
				var _categories = {};
				data.map(function (d) {
					return _this._band(d) in _categories ? _categories[_this._band(d)]++ : _categories[_this._band(d)] = 1;
				});
				_categories = Object.entries(_categories).sort(function (a, b) {
					return b[1] - a[1];
				}).map(function (d) {
					return d[0];
				}).slice(0, this._bandColor.range().length);
				this._bandColor.domain(_categories);
			}
			// backdrop
			if (this._backdropColor.domain().length == 0) {
				var _categories2 = {};
				data.map(function (d) {
					return _this._backdrop(d) in _categories2 ? _categories2[_this._backdrop(d)]++ : _categories2[_this._backdrop(d)] = 1;
				});
				_categories2 = Object.entries(_categories2).sort(function (a, b) {
					return b[1] - a[1];
				}).map(function (d) {
					return d[0];
				}).slice(0, this._backdropColor.range().length);
				this._backdropColor.domain(_categories2);
			}
			// compute story curve layout
			var cursor = 0;
			var markData = data.sort(function (d1, d2) {
				// sort by x-order
				return _this._x(d1) - _this._x(d2);
			}).map(function (d) {
				var x0 = _this._xs(cursor);
				cursor += _this._size(d); //move cursor by width (e.g., scene length)
				var x1 = _this._xs(cursor); //width = x1 - x0
				var y = _this._ys(_this._y(d));

				// children layout in each scene
				var children = _this._children(d).map(function (c, i) {
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
					id: _this._x(d), //unique id (no duplicate order allowed)
					xo: _this._x(d),
					yo: _this._y(d)
				};
			});

			// construct axes
			var xaxisContainer = g.select('.x.axis');
			if (xaxisContainer.empty()) {
				xaxisContainer = g.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + ypadding + ')');
			}

			this._xaxis.scale(this._xs);
			xaxisContainer.call(this._xaxis);

			var yaxisContainer = g.select('.y.axis');
			if (yaxisContainer.empty()) {
				yaxisContainer = g.append('g').attr('class', 'y axis').attr('transform', 'translate(' + xpadding + ',0)');
			}

			var ydivide = Math.round(d3Array.max(markData.map(function (d) {
				return d.yo;
			})) / 3);

			this._yaxis.scale(this._ys).tickValues([ydivide, 2 * ydivide, 3 * ydivide]).tickSizeInner(-(width - xpadding)).tickSizeOuter(0);
			yaxisContainer.call(this._yaxis);

			helper.axisStyleUpdate(this.container); //TODO

			// draw axis labels
			if (g.select('.bg-line').empty()) {
				g.append('line').attr('class', 'bg-line').attr('x1', 0).attr('x2', xpadding).attr('y1', ypadding).attr('y2', ypadding);
			}

			var axisTitles = g.selectAll('.axis-legend').data([[width, 0, 0, this._xaxisTitle, 'end'], [0, height - 10, -90, this._yaxisTitle, 'start']]);
			axisTitles.enter().append('text').attr('class', 'axis-legend').merge(axisTitles).text(function (d) {
				return d[3];
			}).attr('text-anchor', function (d) {
				return d[4];
			}).attr('transform', function (d) {
				return 'translate(' + d[0] + ',' + d[1] + ')rotate(' + d[2] + ')';
			});

			// draw background
			var bandSize = this._ys(ydivide) - ypadding;
			var bgdata = [[0, 'Beginning'], [bandSize, 'Middle'], [2 * bandSize, 'End']];

			var bgpanels = g.selectAll('.bgpanel').data(bgdata);

			var bgpanelEnter = bgpanels.enter().append('g').attr('class', 'bgpanel');

			bgpanelEnter.append('text').text(function (d) {
				return d[1];
			}).attr('class', 'bg-text').merge(bgpanels.select('text')).attr('transform', function (d) {
				return 'translate(' + xpadding / 2 + ',' + (ypadding + d[0] + bandSize / 2.0) + ')';
			});

			bgpanelEnter.append('line').attr('class', 'bg-line').merge(bgpanels.select('line')).attr('stroke-dasharray', '3,3').attr('x1', 20).attr('x2', xpadding).attr('y1', function (d) {
				return ypadding + d[0] + bandSize;
			}).attr('y2', function (d) {
				return ypadding + d[0] + bandSize;
			});

			// main group containing marks (to be zoomed and panned)
			var main = g.select('.main');
			if (main.empty()) {
				main = g.append('g').attr('clip-path', 'url(#' + g.select('clipPath').attr('id') + ')').append('g').attr('class', 'main');
			}

			// draw line connecting marks
			var lineData = markData.reduce(function (l, d) {
				l.push([d.x0, d.y + markHeight / 2]);
				l.push([d.x1, d.y + markHeight / 2]);
				return l;
			}, []);

			var path = d3Shape.line().x(function (d) {
				return d[0];
			}).y(function (d) {
				return d[1];
			});

			var linePath = main.select('.connect-line');
			if (linePath.empty()) {
				linePath = main.append('path').attr('class', 'connect-line');
				// .attr('stroke', 'url(#svgGradient)');
			}
			linePath.datum(lineData).attr('d', path);

			// draw rect marks
			var sceneUpdate = main.selectAll('.scene-group').data(markData, function (d) {
				return d.id;
			});

			sceneUpdate.exit().remove();

			var sceneEnter = sceneUpdate.enter().append('g').attr('class', 'scene-group');

			sceneEnter.append('rect').attr('class', 'overlay').on('mouseover', function (d, i, ns) {
				return _this._onMouseOver(d, i, ns);
			}).on('mouseout', function (d, i, ns) {
				return _this._onMouseOut(d, i, ns);
			}).on('click', function (d, i, ns) {
				return _this._onMouseClick(d, i, ns);
			});

			sceneEnter.append('rect').attr('class', 'overlay-horz');

			sceneEnter.append('rect').attr('pointer-events', 'none').attr('class', 'backdrop');

			sceneEnter.append('rect').attr('pointer-events', 'none').attr('class', 'band');

			// multiple children
			sceneEnter.append('g').attr('class', 'children');

			sceneUpdate = sceneEnter.merge(sceneUpdate);

			sceneUpdate.select('.overlay').attr('x', function (d) {
				return d.x0;
			}).attr('y', ypadding).attr('height', height - ypadding - markHeight).attr('width', function (d) {
				return d.x1 - d.x0;
			});

			sceneUpdate.select('.overlay-horz').attr('x', xpadding).attr('y', function (d) {
				return d.y;
			}).attr('height', markHeight).attr('width', width);

			sceneUpdate.select('.band').attr('x', function (d) {
				return d.x0;
			}).style('opacity', this._showBand ? 1.0 : 0.0).style('fill-opacity', function (d) {
				return _this._isHighlighted({
					type: 'band',
					data: _this._band(d.orgData)
				}, d.orgData, _this._highlights) ? 1.0 : 0.0;
			}).style('fill', function (d) {
				return _this._bandColor(_this._band(d.orgData));
			}) //d =>
			.attr('y', function (d) {
				return d.y;
			}).attr('width', 0).attr('height', 0).transition().attr('y', function (d) {
				return d.y - 5 * markHeight;
			}).duration(this._duration).attr('width', function (d) {
				return d.x1 - d.x0;
			}).attr('height', markHeight * 11); //d=>markHeight*(this._children(d.orgData).length+10))

			sceneUpdate.select('.backdrop').attr('x', function (d) {
				return d.x0;
			}).attr('y', ypadding).attr('width', function (d) {
				return d.x1 - d.x0;
			}).style('opacity', this._showBackdrop ? 1.0 : 0.0).style('fill', function (d) {
				return _this._backdropColor(_this._backdrop(d.orgData));
			}).style('fill-opacity', function (d) {
				return _this._isHighlighted({
					type: 'backdrop',
					data: _this._backdrop(d.orgData)
				}, d.orgData, _this._highlights) ? 0.25 : 0.0;
			}).attr('height', 0).transition().duration(this._duration).attr('height', height - ypadding - markHeight);

			var children = sceneUpdate.select('.children').selectAll('.mark').data(function (d) {
				return d.children;
			});

			children.exit().remove();

			children.enter().append('rect').attr('class', 'mark').attr('pointer-events', 'none').attr('x', function (d) {
				return d.x0;
			}).attr('y', function (d) {
				return d.y;
			}).merge(children).transition().duration(this._duration).style('fill-opacity', function (d) {
				return _this._isHighlighted({
					type: 'child',
					data: d.orgData
				}, d.parentOrgDdata, _this._highlights) ? 1.0 : 0.05;
			}).attr('fill', function (d) {
				return _this._childColor(_this._child(d.orgData, d.parentOrgDdata));
			}).attr('x', function (d) {
				return d.x0;
			}).attr('y', function (d) {
				return d.y;
			}).attr('width', function (d) {
				return d.x1 - d.x0;
			}).attr('height', markHeight).attr('y', function (d) {
				return d.y;
			});

			// zoom setting
			if (this._isZoomEnabled) {
				g.call(this._zoom); //attach zoom to the vis area

				this._zoom.extent([[xpadding, 0], [width, height]]).translateExtent([[xpadding, 0], [width, height]]).scaleExtent([1, 15]);

				this._zoom.on('zoom', function () {
					return _this._onZoom();
				});
			}
		}
	}, {
		key: '_children',
		value: function _children(d) {
			return d.characters;
		}
		// d: an element in a list returned from _children

	}, {
		key: '_child',
		value: function _child(d) {
			return d;
		}
	}, {
		key: '_band',
		value: function _band(d) {
			return d.scene_metadata.location;
		}
	}, {
		key: '_backdrop',
		value: function _backdrop(d) {
			return d.scene_metadata.time;
		}
	}, {
		key: '_x',
		value: function _x(d) {
			return d.narrative_order;
		}
	}, {
		key: '_y',
		value: function _y(d) {
			return d.story_order;
		}
	}, {
		key: '_size',
		value: function _size(d) {
			return d.scene_metadata.size;
		}
	}, {
		key: '_onZoom',
		value: function _onZoom() {
			if (!this._isZoomEnabled) return;

			this._transformVis(d3Selection.event.transform);
			if (this._listners['zoom']) {
				this._listners['zoom'].call(this, d3Selection.event.transform);
			}
		}
	}, {
		key: '_transformVis',
		value: function _transformVis(transform) {
			this._tip.hide();
			this.container.select('.x.axis').call(this._xaxis.scale(transform.rescaleX(this._xs)));

			this.container.select('.main').attr('transform', 'translate(' + transform.x + ',0)scale(' + transform.k + ',1)');

			helper.axisStyleUpdate(this.container);
		}
	}, {
		key: 'transform',
		value: function transform(op, param) {
			var _this2 = this;

			// does not call callback
			this._zoom.on('zoom', null);
			//update zoom state
			var zoomContainer = this.container.select('.visarea');
			this.container.select('.visarea').call(this._zoom[op], param);
			// update vis
			var transform = d3Zoom.zoomTransform(zoomContainer.node());
			this._transformVis(transform);
			this._zoom.on('zoom', function () {
				return _this2._onZoom();
			});
			return this;
		}
	}, {
		key: '_onMouseClick',
		value: function _onMouseClick() {
			if (this._listners['click']) {
				this._listners['click'].apply(this, arguments);
			}
		}
	}, {
		key: '_onMouseOver',
		value: function _onMouseOver() {
			this.highlightOn(arguments[0].xo);

			if (this._listners['mouseover']) {
				this._listners['mouseover'].apply(this, arguments);
			}
		}
	}, {
		key: '_onMouseOut',
		value: function _onMouseOut() {
			this.highlightOff(arguments[0].xo);

			if (this._listners['mouseout']) {
				this._listners['mouseout'].apply(this, arguments);
			}
		}
	}, {
		key: '_tooltipFormat',
		value: function _tooltipFormat(d) {
			var content = '<table>';
			content += '<tr><td><span style="color:#FBBD08">(X,Y)</span></td><td>&nbsp; ' + d.xo + ', ' + d.yo + '</td></tr>';
			// content += ('<tr><td><span style="color:#767676">S.order</span></td><td>&nbsp; ' + d.so + '</td></tr>');
			content += '</table>';
			return content;
		}
	}, {
		key: 'highlightOn',
		value: function highlightOn(xo) {
			var _this3 = this;

			var g = this.container.selectAll('.scene-group').filter(function (d) {
				return d.xo == xo;
			}).raise();

			g.select('.overlay').style('fill-opacity', 0.5);
			g.select('.overlay-horz').style('fill-opacity', 0.5);
			g.select('.band').each(function (d, i, ns) {
				return _this3._tip.show(d, ns[i]);
			});

			g.selectAll('.mark').classed('highlight', true);

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
	}, {
		key: 'highlightOff',
		value: function highlightOff(xo) {
			var _this4 = this;

			var g = this.container.selectAll('.scene-group').filter(function (d) {
				return d.xo == xo;
			}).raise();
			g.select('.overlay').style('fill-opacity', 0.0);
			g.select('.overlay-horz').style('fill-opacity', 0.0);
			g.select('.band').each(function (d, i, ns) {
				return _this4._tip.hide(d, ns[i]);
			});
			g.selectAll('.mark').classed('highlight', false);
		}
	}, {
		key: '_isHighlighted',
		value: function _isHighlighted(target, d, highlights) {
			return target.data == null ? false : highlights.length == 0 ? true : highlights.every(function (h) {
				return h.type == 'child' ? d[h.type].includes(h.filter) : d.scene_metadata[h.type] == h.filter;
			});
		}
	}, {
		key: 'highlights',
		value: function highlights(_) {
			var _this5 = this;

			if (!arguments.length) return this._highlights;
			this._highlights = _;

			//highlight marks
			this.container.selectAll('.scene-group').select('.band').style('fill-opacity', function (d) {
				return _this5._isHighlighted({
					type: 'band',
					data: _this5._band(d.orgData)
				}, d.orgData, _this5._highlights) ? 1.0 : 0.0;
			});

			this.container.selectAll('.scene-group').select('.backdrop').style('fill-opacity', function (d) {
				return _this5._isHighlighted({
					type: 'backdrop',
					data: _this5._backdrop(d.orgData)
				}, d.orgData, _this5._highlights) ? 0.25 : 0.0;
			});

			this.container.selectAll('.scene-group').select('.children').selectAll('.mark').style('fill-opacity', function (d) {
				return _this5._isHighlighted({
					type: 'child',
					data: d.orgData
				}, d.parentOrgDdata, _this5._highlights) ? 1.0 : 0.05;
			});

			return this;
		}
	}, {
		key: 'isHighlighted',
		value: function isHighlighted(_) {
			if (!arguments.length) return this._isHighlighted;
			this._isHighlighted = _;
			return this;
		}
	}, {
		key: 'zoomEnabled',
		value: function zoomEnabled(_) {
			if (!arguments.length) return this._showBand;
			this._isZoomEnabled = _;
			if (this._isZoomEnabled == false && !this.container.select('.visarea').empty()) {
				this.transform('transform', d3.zoomIdentity);
			}
			return this;
		}
	}, {
		key: 'showBand',
		value: function showBand(_) {
			if (!arguments.length) return this._showBand;
			this._showBand = _;
			this.container.selectAll('.scene-group').select('.band').style('opacity', this._showBand ? 1.0 : 0.0);
			return this;
		}
	}, {
		key: 'showBackdrop',
		value: function showBackdrop(_) {
			if (!arguments.length) return this._showBackdrop;
			this._showBackdrop = _;
			this.container.selectAll('.scene-group').select('.backdrop').style('opacity', this._showBackdrop ? 1.0 : 0.0);
			return this;
		}
	}, {
		key: 'showChildren',
		value: function showChildren(_) {
			if (!arguments.length) return this._showChildren;
			this._showChildren = _;
			return this;
		}
	}, {
		key: 'tooltipFormat',
		value: function tooltipFormat(_) {
			if (!arguments.length) return this._tooltipFormat;
			this._tooltipFormat = _;
			this._tip.html(this._tooltipFormat);
			return this;
		}
	}, {
		key: 'xaxisTitle',
		value: function xaxisTitle(_) {
			if (!arguments.length) return this._xaxisTitle;
			this._xaxisTitle = _;
			return this;
		}
	}, {
		key: 'yaxisTitle',
		value: function yaxisTitle(_) {
			if (!arguments.length) return this._yaxisTitle;
			this._yaxisTitle = _;
			return this;
		}
	}, {
		key: 'children',
		value: function children(_) {
			if (!arguments.length) return this._children;
			this._children = _;
			return this;
		}
	}, {
		key: 'child',
		value: function child(_) {
			if (!arguments.length) return this._child;
			this._child = _;
			return this;
		}
	}, {
		key: 'childColorScale',
		value: function childColorScale(_) {
			if (!arguments.length) return this._childColor;
			this._childColor = _;
			return this;
		}
	}, {
		key: 'bandColorScale',
		value: function bandColorScale(_) {
			if (!arguments.length) return this._bandColor;
			this._bandColor = _;
			return this;
		}
	}, {
		key: 'backdropColorScale',
		value: function backdropColorScale(_) {
			if (!arguments.length) return this._backdropColor;
			this._backdropColor = _;
			return this;
		}
	}, {
		key: 'xs',
		value: function xs(_) {
			if (!arguments.length) return this._xs;
			this._xs = _;
			return this;
		}
	}, {
		key: 'ys',
		value: function ys(_) {
			if (!arguments.length) return this._ys;
			this._ys = _;
			return this;
		}
	}, {
		key: 'band',
		value: function band(_) {
			if (!arguments.length) return this._band;
			this._band = _;
			return this;
		}
	}, {
		key: 'backdrop',
		value: function backdrop(_) {
			if (!arguments.length) return this._backdrop;
			this._backdrop = _;
			return this;
		}
	}, {
		key: 'x',
		value: function x(_) {
			if (!arguments.length) return this._x;
			this._x = _;
			return this;
		}
	}, {
		key: 'y',
		value: function y(_) {
			if (!arguments.length) return this._y;
			this._y = _;
			return this;
		}
	}, {
		key: 'width',
		value: function width(_) {
			if (!arguments.length) return this._width;
			this._width = _;
			return this;
		}
	}, {
		key: 'height',
		value: function height(_) {
			if (!arguments.length) return this._height;
			this._height = _;
			return this;
		}
	}, {
		key: 'size',
		value: function size(_) {
			if (!arguments.length) return this._size;
			this._size = _;
			return this;
		}
	}, {
		key: 'on',
		value: function on(name, callback) {
			this._listners[name] = callback;
			return this;
		}
	}]);
	return StoryCurve;
}();

return StoryCurve;

})));
