﻿/**
 * @constructor
 * @extends UIBase
 */
var SearchbarBase = function()
{
  this.type = 'searchbar';
  this.default_height = 0;
  this.height = 0;
  this.top_border = 0;
  this.bottom_border = 0;
  this.offsetHeight = 0;
  this.cell = null;
  this.width = 0;
  this.top = 0;
  this.left = 0;
  this.is_dirty = true;

  this.setDimensions = function(force_redraw)
  {
    var dim = 0;

    // set css properties
    if (!this.default_height)
    {
      this.setCSSProperties()
    }
    dim = this.cell.top - this.cell.toolbar.getBottomPosition();
    if (dim != this.top)
    {
      this.is_dirty = true;
      this.top = dim;
    }

    dim = this.cell.left;
    if (dim != this.left)
    {
      this.is_dirty = true;
      this.left = dim;
    }

    dim = this.cell.width - this.horizontal_border_padding;
    if (dim != this.width)
    {
      this.is_dirty = true;
      this.width = dim;
    }

    dim = this.__is_visible  ? this.default_height : 0;
    if( dim != this.height)
    {
      this.is_dirty = true;
      this.height = dim;
      this.offsetHeight = dim + this.vertical_border_padding;
    }

    this.update(force_redraw)
    // TODO
    // this.horizontal_nav.check_width();
  };
  
  /*
  this.__defineGetter__("offsetHeight", function()
  {
    if (!this.default_height)
    {
      this.setCSSProperties();
    }
    return this.__is_visible ? this._offset_height : 0;
  });
  
  this.__defineSetter__("offsetHeight", function(offset_height)
  {
    this._offset_height = offset_height;
  });
  */

  /*
  this.setVisibility = function(is_visible)
  {
    this.__is_visible = is_visible;
    if (this.cell && this.isvisible() && !is_visible)
    {
      var modebar = this.getElement();
      modebar.parentNode.removeChild(modebar);
    }
  };


  this.setup = function(view_id)
  {
    // TODO
    // this.element = document.getElementById(this.type + '-to-' + this.cell.id) || this.update();
    // this.element.appendChild(this.horizontal_nav.element);
  };
  */  

  this.init = function(view_id)
  {
    (window.searches || (window.searches = view_id))[view_id] = this;
    this.initBase();
  };
};

/**
 * @constructor
 * @extends ModebarBase
 */
var Searchbar = function()
{
  this.init();
};

SearchbarBase.prototype = UIBase;
Searchbar.prototype = new SearchbarBase();