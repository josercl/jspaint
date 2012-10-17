var gridWidth=20;
var gridHeight=20;
var mainGridColor="#cccccc";
var secondGridColor="#cccccc";

var paper;
var modo="SELECT";
var x0,y0,x,y,width0,height0;
var dragging=false;
var shifted=false;

var BBoxSet,derSet,izqSet,supSet,infSet;
var objActivo;
var poliStr="";

var mainGridLines={
		"stroke": mainGridColor,
		"stroke-width": .5,
		"stroke-opacity": .5
};

var secondGridLines={
		"stroke": secondGridColor,
		"stroke-width": .5,
		"stroke-opacity": .5,
		"stroke-dasharray": "- "
};

var scaleBoxes={
		"fill": "white",
		"stroke": "black"
};

function initGrid(){
	
	var canvas_width=$("#canvas").width();
	var canvas_height=$("#canvas").height();
	
	var xcoord=0;
	var ycoord=0;
	
	paper=Raphael("canvas",canvas_width,canvas_height);
	
	BBoxSet=paper.set();
	izqSet=paper.set();
	derSet=paper.set();
	supSet=paper.set();
	infSet=paper.set();
	
	while(xcoord<canvas_width){
		paper.path("M"+xcoord+",0V"+canvas_height).attr(mainGridLines);
		paper.path("M"+(xcoord-gridWidth/2)+",0V"+canvas_height).attr(secondGridLines);
		xcoord+=gridWidth;
	}
	while(ycoord<canvas_height){
		paper.path("M0,"+ycoord+"H"+canvas_width).attr(mainGridLines);
		paper.path("M0,"+(ycoord-gridHeight/2)+"H"+canvas_width).attr(secondGridLines);
		ycoord+=gridHeight;
	}
}

function initToolbar(){
	$(".btn_tool").click(function(){
		modo=$(this).data("mode");
		$(".btn_tool.active").removeClass("active");
		$(this).addClass("active");
		_clearSets();
	})
	
	$(".color_select").each(function(i,o){
		$(o).css("background",$(o).data("color"));
	});
	$(".color_select").ColorPicker({
		onSubmit: function(hsb, hex, rgb, el){
			$(el).ColorPickerHide();
			$(el).css("background","#"+hex);
		}
	});
	
	$(".img_btn").draggable({
		helper: "clone",
		revert: "invalid",
		revertDuration: 0,
		cursorAt: {
			top: 0,
			left: 0
		}
	});
	
	paper2=Raphael("canvas_btn_rect",24,24);
	rect=paper2.rect(3,5,18,14).attr({
		"stroke": "black",
		"stroke-width": 1.5,
		"fill": "white"
	});
	rect=paper2.rect(5,7,14,10).attr({
		"stroke-width": 0,
		"fill": "#cccfca"
	});
	
	paper2=Raphael("canvas_btn_elipse",24,24);
	paper2.ellipse(12,12,9,9).attr({
		"stroke": "black",
		"stroke-width": 1.5,
		"fill": "white"
	});
	paper2.ellipse(12,12,7,7).attr({
		"fill": "#CCCFCA",
		"stroke-width": 0
	});
	
	paper2=Raphael("canvas_btn_borrar",24,24);
	paper2.rect(2,12,14,6).attr({
		"stroke": "#ef3535",
		"stroke-width": 0,
		"fill": "#fb7474",
		"stroke-linecap": "round"
	});
	paper2.path("M2,12L7,4L21,4L21,10L16,18L16,12L2,12").attr({
		"stroke": "#ef3535",
		"stroke-width": 0,
		"fill": "#ef3535",
		"stroke-linecap": "round"
	});
	paper2.path("M2,12L7,4L21,4L16,12L2,12").attr({
		"stroke": "#e0aca3",
		"stroke-width": 0,
		"fill": "#e0aca3",
		"stroke-linecap": "round"
	});
	
	paper2=Raphael("canvas_btn_pintar",24,24);
	paper2.rect(4,10,13,13,2).attr({
		"stroke": "#5b5d5b",
		"stroke-width": "1",
		"fill": "0-#e1e1e1-#fff:25-#c8c8c8"
	}).transform("r-31,4,10");
	paper2.path("M5,8L2,8L1,9L1,16L2,17L3,16L3,10L5,8").attr({
		"stroke": "#586a9a",
		"stroke-width": .8,
		"fill": "#bed4ef"
	});
	paper2.ellipse(12,11,2,2).attr({
		"fill": "#6d6e6b",
		"stroke-width":0
	});
	paper2.path("M12,9L12,3C12,3,15,1,18,3L18,8").attr({
		"stroke": "#585956",
		"stroke-width": 1
	});
	
	paper2=Raphael("canvas_btn_select",24,24);
	paper2.path("M7,3l0,16l3,-3l1,0l2,4l2,0l0,-3l-2,-3l5,0l-11,-11").attr({
		"fill":"white",
		"stroke-width":1,
		"stroke":"black"
	});
}

function _getMousePos(event){
	var pos=$("#canvas").position();
	
	pos.left+=eval($("#canvas").css("margin-left").replace("px",""));
	
	var realX=event.pageX-pos.left;
	var realY=event.pageY-pos.top;
	return {"x":realX,"y":realY}
}

function initCommands(){
	$("#canvas").droppable({
		accept: ".img_btn",
		drop: function(event,ui){
			imagen=$(ui.helper).attr("src");
			
			pos=$(ui.helper).position();
			//arreglamos la coordenada X de la imagen
			pos.left-=eval($("#canvas").css("margin-left").replace("px",""));
			
			w=$(ui.helper).width();
			h=$(ui.helper).height();
			
			obj=paper.image(imagen,pos.left,pos.top,w,h);
			_dragActionBox(obj);
			_clickActionsBox(obj);
		}
	});
	
	$("#canvas").mousedown(function(event){
		coords=_getMousePos(event);
		x0=coords.x;
		y0=coords.y;
	}).mouseup(function(event){
		coords=_getMousePos(event);
		
		w=coords.x-x0;
		h=coords.y-y0;
		if(w<0){
			x0+=w;
			w=-w;
		}
		if(h<0){
			y0+=h;
			h=-h;
		}
		
		if(shifted){
			h=w;
		}
		
		if(!dragging){
			var obj;
			if(modo=="RECT"){
				obj=paper.rect(x0,y0,w,h).attr({
					"fill": $("#fill").css("background-color"),
					"stroke": $("#stroke").css("background-color")
				});
				_dragActionBox(obj);
				_clickActionsBox(obj);
			}
			if(modo=="ELIPSE"){
				obj=paper.ellipse(x0+w/2,y0+h/2,w/2,h/2).attr({
					"fill": $("#fill").css("background-color"),
					"stroke": $("#stroke").css("background-color")
				}).drag(function(dx,dy){
					if(modo!="BORRAR"){
						this.attr({
							cx: Math.min(Math.max(x+dx,this.attr("rx")),$("#canvas").width()-this.attr("rx")),
							cy: Math.min(Math.max(y+dy,this.attr("ry")),$("#canvas").height()-this.attr("ry"))
						})
					}
				},function(){
					dragging=true;
					x=this.attr("cx");
					y=this.attr("cy");
					width0=this.attr("width");
					height0=this.attr("height");
					_clearSets();
					this.attr({
						"opacity": .5
					});
				},function(){
					dragging=false;
					this.attr({
						"opacity": 1
					});
				});
				_clickActionsElipse(obj);
			}
			
		}
	});
	
	$(document).keyup(function(event){
		if(event.which == 27){ //escape
			_clearSets();
		}
		if(event.which == 46){ //supr
			if(objActivo!=null){
				objActivo.remove();
				_clearSets();
			}
		}
		if(event.which==16){ //Shift
			shifted=false;
		}
	});
	
	$(document).keydown(function(event){
		if(event.which==16){ //Shift
			shifted=true;
		}
	});
}

function _dragActionBox(obj){
	obj.drag(function(dx,dy){
		if(modo!="BORRAR"){
			this.attr({
				x: Math.min(Math.max(x+dx,0),$("#canvas").width()-this.attr("width")),
				y: Math.min(Math.max(y+dy,0),$("#canvas").height()-this.attr("height"))
			})
		}
	},function(){
		dragging=true;
		x=this.attr("x");
		y=this.attr("y");
		width0=this.attr("width");
		height0=this.attr("height");
		_clearSets();
		this.attr({
			"opacity": .5
		});
	},function(){
		dragging=false;
		this.attr({
			"opacity": 1
		});
	});
}

function _clickActionsBox(obj){
	obj.click(function(){
		objActivo=this;
		_clearSets();
		if(modo=="BORRAR"){
			this.remove();
		}else if(modo=="PINTAR"){
			this.attr({
				"fill": $("#fill").css("background-color"),
				"stroke": $("#stroke").css("background-color")
			})
		}else{
			bbox=this.getBBox();
			obj=this;

			supizq=paper.rect(bbox.x-5,bbox.y-5,10,10);
			sup=paper.rect(bbox.x+bbox.width/2-5,bbox.y-5,10,10);
			supder=paper.rect(bbox.x+bbox.width-5,bbox.y-5,10,10);
			
			izq=paper.rect(bbox.x-5,bbox.y+bbox.height/2-5,10,10);
			der=paper.rect(bbox.x+bbox.width-5,bbox.y+bbox.height/2-5,10,10);
			
			infizq=paper.rect(bbox.x-5,bbox.y+bbox.height-5,10,10);
			inf=paper.rect(bbox.x+bbox.width/2-5,bbox.y+bbox.height-5,10,10);
			infder=paper.rect(bbox.x2-5,bbox.y2-5,10,10);
			
			
			derSet.push(supder,der,infder);
			izqSet.push(supizq,izq,infizq);
			supSet.push(supizq,sup,supder);
			infSet.push(infizq,inf,infder);
			
			BBoxSet.push(supizq,sup,supder,izq,der,infizq,inf,infder);
			BBoxSet.attr(scaleBoxes);
			
			der.drag(function(dx,dy){
				dragging=true;
				derSet.attr({
					x: x3+dx
				})
				obj.attr({
					width: width0+dx
				});
				sup.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
				inf.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
			},function(){
				$("#canvas").css("cursor", "e-resize");
				x3=this.attr("x");
				x2=obj.attr("x");
				width0=obj.attr("width");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			izq.drag(function(dx,dy){
				dragging=true;
				izqSet.attr({
					x: x3+dx
				})
				obj.attr({
					x: x2+dx,
					width: width0-dx
				});
				sup.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
				inf.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
			},function(){
				$("#canvas").css("cursor", "w-resize");
				x3=this.attr("x");
				x2=obj.attr("x");
				width0=obj.attr("width");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			sup.drag(function(dx,dy){
				dragging=true;
				supSet.attr({
					y: y3+dy
				})
				obj.attr({
					y: y2+dy,
					height: height0-dy
				});
				izq.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				der.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
			},function(){
				$("#canvas").css("cursor", "n-resize");
				y3=this.attr("y");
				y2=obj.attr("y");
				height0=obj.attr("height");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			inf.drag(function(dx,dy){
				dragging=true;
				infSet.attr({
					y: y3+dy
				})
				obj.attr({
					height: height0+dy
				});
				izq.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				der.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
			},function(){
				$("#canvas").css("cursor", "s-resize");
				y3=this.attr("y");
				y2=obj.attr("y");
				height0=obj.attr("height");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			infder.drag(function(dx,dy){
				dragging=true;
				
				if(shifted){
					dy=dx;
				}
				
				infSet.attr({
					y: y3+dy
				})
				derSet.attr({
					x: x3+dx
				});
				
				obj.attr({
					width: width0+dx,
					height: height0+dy
				});
				der.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				izq.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				inf.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
				sup.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
			},function(){
				$("#canvas").css("cursor", "se-resize");
				x3=this.attr("x");
				y3=this.attr("y");
				y2=obj.attr("y");
				x2=obj.attr("x");
				height0=obj.attr("height");
				width0=obj.attr("width");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			supder.drag(function(dx,dy){
				dragging=true;
				if(shifted){
					dy=dx;
				}
				supSet.attr({
					y: y3+dy
				})
				obj.attr({
					y: y2+dy,
					height: height0-dy,
					width: width0+dx
				});
				izq.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				der.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				derSet.attr({
					x: x3+dx
				})
				sup.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
				inf.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
			},function(){
				$("#canvas").css("cursor", "ne-resize");
				x3=this.attr("x");
				y3=this.attr("y");
				y2=obj.attr("y");
				x2=obj.attr("x");
				height0=obj.attr("height");
				width0=obj.attr("width");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			infizq.drag(function(dx,dy){
				dragging=true;
				if(shifted){
					dy=dx;
				}
				infSet.attr({
					y: y3+dy
				})
				obj.attr({
					height: height0+dy,
					x: x2+dx,
					width: width0-dx
				});
				izq.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				der.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				izqSet.attr({
					x: x3+dx
				})
				sup.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
				inf.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
			},function(){
				$("#canvas").css("cursor", "sw-resize");
				x3=this.attr("x");
				y3=this.attr("y");
				y2=obj.attr("y");
				x2=obj.attr("x");
				height0=obj.attr("height");
				width0=obj.attr("width");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			supizq.drag(function(dx,dy){
				dragging=true;
				if(shifted){
					dy=dx;
				}
				supSet.attr({
					y: y3+dy
				})
				obj.attr({
					y: y2+dy,
					height: height0-dy,
					x: x2+dx,
					width: width0-dx
				});
				izq.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				der.attr({
					y: obj.attr("y")+obj.attr("height")/2-5
				});
				izqSet.attr({
					x: x3+dx
				})
				sup.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
				inf.attr({
					x: obj.attr("x")+obj.attr("width")/2-5
				});
			},function(){
				$("#canvas").css("cursor", "nw-resize");
				x3=this.attr("x");
				y3=this.attr("y");
				y2=obj.attr("y");
				x2=obj.attr("x");
				height0=obj.attr("height");
				width0=obj.attr("width");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
		}
	});
}

function _clickActionsElipse(obj){
	obj.click(function(){
		objActivo=this;
		_clearSets();
		if(modo=="BORRAR"){
			this.remove();
		}else if(modo=="PINTAR"){
			this.attr({
				"fill": $("#fill").css("background-color")
			})
		}else{
			bbox=this.getBBox();
			obj=this;

			supizq=paper.rect(bbox.x-5,bbox.y-5,10,10);
			sup=paper.rect(bbox.x+bbox.width/2-5,bbox.y-5,10,10);
			supder=paper.rect(bbox.x+bbox.width-5,bbox.y-5,10,10);
			
			izq=paper.rect(bbox.x-5,bbox.y+bbox.height/2-5,10,10);
			der=paper.rect(bbox.x+bbox.width-5,bbox.y+bbox.height/2-5,10,10);
			
			infizq=paper.rect(bbox.x-5,bbox.y+bbox.height-5,10,10);
			inf=paper.rect(bbox.x+bbox.width/2-5,bbox.y+bbox.height-5,10,10);
			infder=paper.rect(bbox.x2-5,bbox.y2-5,10,10);
			
			derSet.push(supder,der,infder);
			izqSet.push(supizq,izq,infizq);
			supSet.push(supizq,sup,supder);
			infSet.push(infizq,inf,infder);
			
			BBoxSet.push(supizq,sup,supder,izq,der,infizq,inf,infder);
			BBoxSet.attr(scaleBoxes);
			
			der.drag(function(dx,dy){
				dragging=true;
				derSet.attr({
					x: x3+dx
				})
				obj.attr({
					rx: width0+dx/2,
					cx: x2+dx/2
				});
				sup.attr({
					x: obj.attr("cx")-5
				});
				inf.attr({
					x: obj.attr("cx")-5
				});
			},function(){
				$("#canvas").css("cursor", "e-resize");
				x3=this.attr("x");
				x2=obj.attr("cx");
				width0=obj.attr("rx");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			izq.drag(function(dx,dy){
				dragging=true;
				izqSet.attr({
					x: x3+dx
				})
				obj.attr({
					cx: x2+dx/2,
					rx: width0-dx/2
				});
				sup.attr({
					x: obj.attr("cx")-5
				});
				inf.attr({
					x: obj.attr("cx")-5
				});
			},function(){
				$("#canvas").css("cursor", "w-resize");
				x3=this.attr("x");
				x2=obj.attr("cx");
				width0=obj.attr("rx");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			sup.drag(function(dx,dy){
				dragging=true;
				supSet.attr({
					y: y3+dy
				})
				obj.attr({
					cy: y2+dy/2,
					ry: height0-dy/2
				});
				izq.attr({
					y: obj.attr("cy")-5
				});
				der.attr({
					y: obj.attr("cy")-5
				});
			},function(){
				$("#canvas").css("cursor", "n-resize");
				y3=this.attr("y");
				y2=obj.attr("cy");
				height0=obj.attr("ry");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			inf.drag(function(dx,dy){
				dragging=true;
				infSet.attr({
					y: y3+dy
				})
				obj.attr({
					cy: y2+dy/2,
					ry: height0+dy/2
				});
				izq.attr({
					y: obj.attr("cy")-5
				});
				der.attr({
					y: obj.attr("cy")-5
				});
			},function(){
				$("#canvas").css("cursor", "s-resize");
				y3=this.attr("y");
				y2=obj.attr("cy");
				height0=obj.attr("ry");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			infder.drag(function(dx,dy){
				dragging=true;
				if(shifted){
					dy=dx;
				}
				infSet.attr({
					y: y3+dy
				})
				obj.attr({
					cy: y2+dy/2,
					ry: height0+dy/2,
					rx: width0+dx/2,
					cx: x2+dx/2
				});
				izq.attr({
					y: obj.attr("cy")-5
				});
				der.attr({
					y: obj.attr("cy")-5
				});
				derSet.attr({
					x: x3+dx
				})
				sup.attr({
					x: obj.attr("cx")-5
				});
				inf.attr({
					x: obj.attr("cx")-5
				});
			},function(){
				$("#canvas").css("cursor", "se-resize");
				x3=this.attr("x");
				y3=this.attr("y");
				y2=obj.attr("cy");
				x2=obj.attr("cx");
				height0=obj.attr("ry");
				width0=obj.attr("rx");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			supder.drag(function(dx,dy){
				dragging=true;
				if(shifted){
					dy=dx;
				}
				supSet.attr({
					y: y3+dy
				})
				obj.attr({
					cy: y2+dy/2,
					ry: height0-dy/2,
					rx: width0+dx/2,
					cx: x2+dx/2
				});
				izq.attr({
					y: obj.attr("cy")-5
				});
				der.attr({
					y: obj.attr("cy")-5
				});
				derSet.attr({
					x: x3+dx
				})
				sup.attr({
					x: obj.attr("cx")-5
				});
				inf.attr({
					x: obj.attr("cx")-5
				});
			},function(){
				$("#canvas").css("cursor", "ne-resize");
				x3=this.attr("x");
				y3=this.attr("y");
				y2=obj.attr("cy");
				x2=obj.attr("cx");
				height0=obj.attr("ry");
				width0=obj.attr("rx");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			infizq.drag(function(dx,dy){
				dragging=true;
				if(shifted){
					dy=dx;
				}
				izqSet.attr({
					x: x3+dx
				})
				obj.attr({
					cx: x2+dx/2,
					rx: width0-dx/2,
					cy: y2+dy/2,
					ry: height0+dy/2
				});
				sup.attr({
					x: obj.attr("cx")-5
				});
				inf.attr({
					x: obj.attr("cx")-5
				});
				infSet.attr({
					y: y3+dy
				})
				izq.attr({
					y: obj.attr("cy")-5
				});
				der.attr({
					y: obj.attr("cy")-5
				});
			},function(){
				$("#canvas").css("cursor", "sw-resize");
				x3=this.attr("x");
				y3=this.attr("y");
				y2=obj.attr("cy");
				x2=obj.attr("cx");
				height0=obj.attr("ry");
				width0=obj.attr("rx");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
			
			supizq.drag(function(dx,dy){
				dragging=true;
				if(shifted){
					dy=dx;
				}
				izqSet.attr({
					x: x3+dx
				})
				obj.attr({
					cx: x2+dx/2,
					rx: width0-dx/2,
					cy: y2+dy/2,
					ry: height0-dy/2
				});
				sup.attr({
					x: obj.attr("cx")-5
				});
				inf.attr({
					x: obj.attr("cx")-5
				});
				supSet.attr({
					y: y3+dy
				});
				izq.attr({
					y: obj.attr("cy")-5
				});
				der.attr({
					y: obj.attr("cy")-5
				});
			},function(){
				$("#canvas").css("cursor", "nw-resize");
				x3=this.attr("x");
				y3=this.attr("y");
				y2=obj.attr("cy");
				x2=obj.attr("cx");
				height0=obj.attr("ry");
				width0=obj.attr("rx");
			},function(){
				dragging=false;
				$("#canvas").css("cursor", "default");
			});
		}
	});
}

function _clearSets(){
	BBoxSet.forEach(function(el){
		el.remove();
	})
	BBoxSet.clear();
	derSet.clear();
	izqSet.clear();
	supSet.clear();
	infSet.clear();
}

$(document).ready(function(){
	initGrid();
	initToolbar();
	initCommands();
});
