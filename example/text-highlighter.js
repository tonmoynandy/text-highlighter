/*! TextSelector 1.0.0
 */

/**
 * @summary     TextSelector
 * @description Highlight selected text and exoprt 
 * @version     1.0.0
 * @file        text-highlighter.js
 * @author      Tonmoy Nandy
 * @copyright   Copyright 2018 Tonmoy Nandy.
 *
 * This source file is free software
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.
 *
 */
class TextSelector {
	
	constructor(options) {
		this.options = options;
		this.selector =  $(this.options.selector);
		this.renderSelectorBody();
		if(this.options.items != undefined) {
			this.renderSelectorIcon();
		}
		this.selectedItems = [];
	}
	renderSelectorBody()
	{
		this.selector.addClass('text-highlighter');
		let content = this.selector.html();
		this.selector.empty();
		$("<div/>")
		.addClass('select-body')
		.html(content)
		.bind('mouseup',{obj:this,currentStyle: this.currentStyle}, this.highlighted)
		.appendTo(this.selector)
	}
	renderSelectorIcon() {
		if (this.options.items != undefined && Object.keys(this.options.items).length > 0) {
			this.selector.show();
		} else {
			this.selector.hide();
			return false;
		}
		const header = $("<div/>")
					.addClass('select-header')
					.prependTo(this.selector);
		const topHeader = $("<div/>")
						.addClass('select-header-top')
						.appendTo(header);
		const topHeaderLeft = $("<div/>")
						.addClass('select-header-top-left')
						.bind('click',{obj:this},this.toggleIconList)
						.appendTo(topHeader);
		const topHeaderRight = $("<div/>")
						.addClass('select-header-top-right')
						.addClass('hide-icon')
						.appendTo(topHeader);
		
		
		const buttomHeader = $("<div/>")
							.addClass('select-header-buttom')
							.appendTo(header);
		var group = '';
		for(let i in this.options.items) {
			let item = this.options.items[i];
			if (item.group != undefined ) {
				if ($(buttomHeader).find('.'+item.group).length == 0){
					group = $("<div/>")
								.addClass(item.group)
								.addClass('header-group')
								.appendTo(buttomHeader);
				} else {
					group = $(buttomHeader).find('.'+item.group);
				}
			} else {
				group = buttomHeader;
			}
			let l = $("<label />")
					.bind('click',{obj:this},this.setColor)
					.appendTo(group);
			$("<span/>")
				.addClass(i)
				.attr('data-selector', i)
				.css({ 'background-color':item.color })
				.appendTo(l);
			l.append(i);
		}
		

		header.find('label').first().trigger('click');
	}
	
	toggleIconList(event) {
		$(event.target).parents('.select-header-top').find('.select-header-top-right').toggleClass('hide-icon');
		var classObj = event.data.obj;
		classObj.selector.find('.select-header').find('.select-header-buttom').slideToggle('slow');
	}
	setColor(event){
		var classObj = event.data.obj;
		classObj.selector.find('.select-header-buttom').find('label').removeClass('active');
		var activeElement;
		if ($(event.target).prop("tagName") == 'SPAN') {
			activeElement =  $(event.target).parent();
		} else { 
			activeElement = $(event.target);
		}
		activeElement.addClass('active');
		classObj.selector.find('.select-header-top-left').html(activeElement.clone());
		classObj.selector.find('.select-header-top-left').trigger('click');
	}
	removeStyle(event) {
		var classObj = event.data.obj;
		var wrap = $(event.target).parent();
		wrap.find('i.cross').remove();
		var text = wrap.html();
		if (text){
			wrap.replaceWith(text);
			classObj.getSelectedItems(classObj);
		}
	}


	wraper(range,current)
	{
		var wrapper = document.createElement("span");
    	wrapper.setAttribute('style',current.color);
    	wrapper.setAttribute('class',current.class);
    	if(typeof range == 'object'){
	    	range.surroundContents(wrapper);
	    } else {
	    	wrapper.innerHTML = range;
	    }
    	var cross = document.createElement('i');
    	cross.setAttribute('class',"cross cross-icon");
    	wrapper.appendChild(cross);
    	//$(wrapper).find('i.cross')
    	this.getSelectedItems(this)
    	return wrapper;
	}

	getSelectedItems(obj){
		obj.selectedItems = [];
		var totalText = obj.selector.find('.select-body').html();
		var newElement = $("<div/>").html(totalText);
		newElement.find("i").remove();
		var str = newElement.html()
		str = str.replace(new RegExp('<br>', 'g'), ' ');
		newElement.html(str);
		var childNodes = newElement[0].childNodes;
		var startPoint = 0;
		for(let child of childNodes) {
			startPoint += (child.innerText)? child.innerText.length : child.length;
			if(child.nodeName == 'SPAN') {
				obj.selectedItems.push({
					text : child.innerText,
					item : child.classList[0],
					start : (startPoint - child.innerText.length) ,
					length : child.innerText.length
				})
			}
		}
		
	}


	splitNode(obj, node) {

	  $(node).find('i').last().remove();
	  var nodeInnerHtml = node.innerHTML;
	  var leftPart = nodeInnerHtml.substr(0, nodeInnerHtml.indexOf('<span'));
	  var childHtml = $(node).find('span')[0];
	  var rightPart = nodeInnerHtml.substr(nodeInnerHtml.indexOf('</span>')+7);
	  var current = {
	  	color : $(node).attr('style'),
	  	class : $(node).attr('class')
	  }
	  var div = document.createElement('div');
	  div.appendChild(obj.wraper(leftPart,current));
	  div.appendChild(childHtml)
	  div.appendChild(obj.wraper(rightPart,current));
	  $(node).replaceWith(div.innerHTML);
	  $(obj.selector).find('i.cross').bind('click',{obj:obj}, obj.removeStyle);
	}
	
	
	highlighted(event) {
		var obj = event.data.obj;
		var sel, range, node;
	    if (window.getSelection) {
	        sel = window.getSelection();
	        if (sel.getRangeAt && sel.rangeCount) {
	            range = window.getSelection().getRangeAt(0);
	            if(range.startOffset != range.endOffset && range.toString().trim()!=''){
	            	let span = obj.selector.find('.select-header-buttom').find('label.active').find('span');
	            	var current = {
	            		color : span.attr('style'),
	            		class : span.attr('data-selector')
	            	}
	            	
	            	obj.wraper(range,current)
    	            $(obj.selector).find('i.cross').bind('click',{obj:obj}, obj.removeStyle);
    	            if($(range.commonAncestorContainer).prop("tagName") == 'SPAN') {
    	            	obj.splitNode(obj, range.commonAncestorContainer);
        	        }
    	        }
	        }
	    } else if (document.selection && document.selection.createRange) {
	        range = document.selection.createRange();
	        range.collapse(false);
	        range.pasteHTML(html);
	    }
	    obj.clearSelection();
	}

	clearSelection()
	{
	 if (window.getSelection) {window.getSelection().removeAllRanges();}
	 else if (document.selection) {document.selection.empty();}
	}
	exportItems(event)
	{
		const classObj = event.data.obj;
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(classObj.selectedItems));
		var link = document.createElement('a');
        document.body.appendChild(link);
		link.setAttribute("href",     dataStr     );
		link.setAttribute("download", "export.json");
		link.click();
	}
	getAllItems()
	{
		return this.selectedItems;
	}
	reset()
	{
		this.selector.find('.select-body').find('span').each(function(index,item){
			var wrap = $(item);
			wrap.find('i').remove();
			var text = wrap.html();

			wrap.replaceWith(text);
		})
	}
	setItem(items) {
		this.options.items = items;
		this.renderSelectorIcon();
	}


}