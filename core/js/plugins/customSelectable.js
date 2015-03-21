(function($, undefined){
    $.widget("ui.customSelectable", $.ui.mouse, {
        options: {
            appendTo: 'body',
			selectionClass: '',
			disable : true,
			dataTable : null,
			chartManager : null
        },
        _create: function(){
            var self = this;
            self.dragged = false;
            self.selectees = $('td', self.element[0]).not('.ao-no-select');
            self.refresh = function(){
                window.todos = [];
                var length = self.selectees.length;
                for (var i = length; i--;) {
                    var $this = self.selectees.eq(i);
                    var pos = $this.offset();

                    var data = {
                        cell: $this,
                        left: pos.left,
                        top: pos.top,
                        right: pos.left + $this.outerWidth(),
                        bottom: pos.top + $this.outerHeight()
                    };
                    window.todos.push(data);
                }
            };

            self._mouseInit();
            self.helper = $("<div class='ui-selectable-helper'><div></div></div>");
        },
        destroy: function(){
            //do nothing
        },
        _mouseStart: function(event){
            var self = this;
            var options = self.options;
			
			if(options.disable == true){
				return false;
			}
			self.opos = [event.pageX, event.pageY];
			
			$(options.appendTo).append(self.helper);
            self.helper.css({
                "left": event.clientX,
                "top": event.clientY,
                "width": 0,
                "height": 0
            });
				
            self.refresh();
        },
        _mouseDrag: function(event){
            var self = this;
            self.dragged = true;
            var options = self.options;

			if(options.disable == true){
				return false;
			}
			
            var x1 = self.opos[0], y1 = self.opos[1], x2 = event.pageX, y2 = event.pageY;
            if (x1 > x2) {
                var tmp = x2;
                x2 = x1;
                x1 = tmp;
            }
            if (y1 > y2) {
                var tmp = y2;
                y2 = y1;
                y1 = tmp;
            }
            self.helper.css({
                left: x1,
                top: y1,
                width: x2 - x1,
                height: y2 - y1
            });
			
            self.hits = [];
			self.notHits = [];
            var length = window.todos.length;

			for (var i = length; i--;) {
                var selectee = window.todos[i];
                var hit = (!(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1));
                var $lCell = selectee.cell;
				var hasClass = $lCell.hasClass(options.selectionClass);
                if (hit) {
					if(hasClass){
                    	self.notHits.push($lCell[0]);	
					}else{
						self.hits.push($lCell[0]);
					}
                }
                else {
					if(hasClass){
                    	self.hits.push($lCell[0]);	
					}
					else{
						self.notHits.push($lCell[0]);					
					}
                }
            }
            return false;
        },
        _mouseStop: function(event){
            var self = this;
			
			if(self.options.disable == true){
				return false;
			}
            self.dragged = false;
            self.helper.remove();

            //TODO no se porque aparece en vacio
			if (self.options.chartManager != null && self.options.chartManager != "") {
				$(self.hits).addClass(self.options.selectionClass);
				$(self.notHits).removeClass(self.options.selectionClass);
				
				if (self.options.chartManager.attributes.$DataTable.checkNumericCells('ao-data') && self.options.selectionClass == "ao-data") {
					self.options.chartManager.noDataSelectionWarning(true);
				}
				else {
					chartManager.noDataSelectionWarning(false);
				}
                self.options.chartManager.attributes.$DataTable.attributes.$Table.find('th').removeClass('ao-column-selected');
                self.options.chartManager.attributes.$DataTable.attributes.$Table.find('th').removeClass(self.options.selectionClass);
                $("#id_multipleSeriesData").trigger('selection:finish');
			}
			
			if (self.options.dataTable != null) {
				if (sideBar.attributes.lockSelection) {
					if (confirm("Changing selection will reset all advanced settings. Do you wish to continue?")) {
						sideBar.clearSelection();
						$(self.hits).addClass(self.options.selectionClass);
						$(self.notHits).removeClass(self.options.selectionClass);
						self.options.dataTable.updateSelectedCells();
						sideBar.selectionStarted();
					}
				}else{
					if (self.hits.length > 0) {
						$(self.hits).addClass(self.options.selectionClass);
						$(self.notHits).removeClass(self.options.selectionClass);
						self.options.dataTable.updateSelectedCells();
						sideBar.selectionStarted();
					}
				}
			}
			return false;
        }
    });
}(jQuery));