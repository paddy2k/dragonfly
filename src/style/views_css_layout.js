﻿window.cls || (window.cls = {});

/**
  * @constructor 
  * @extends ViewBase
  */


cls.CSSLayoutView = function(id, name, container_class)
{
  var self = this;

  this.createView = function(container)
  {
    if (elementLayout.has_selected_element())
    {
      if( !container.getElementsByTagName('layout-container')[0] )
      {
        container.innerHTML = "<div class='padding'>\
            <layout-container></layout-container>\
            <offsets-container></offsets-container>\
            </div>";

        var layout = container.getElementsByTagName('layout-container')[0];
        if(layout)
        {
          hostspotlighter.clearMouseHandlerTarget();
          layout.addEventListener('mouseover', hostspotlighter.metricsMouseoverHandler, false);
          layout.addEventListener('mouseout', hostspotlighter.metricsMouseoutHandler, false);
        }
      }
      this.updateLayout({});
      window.elementLayout.getOffsetsValues(this.updateOffsets.bind(this, container));
    }
    else
      container.innerHTML = "";

  }

  this.updateLayout = function(ev)
  {
    var containers = self.getAllContainers(), c = null , i = 0;
    // TODO not good logic
    for( ; c = containers[i]; i++)
    {
      c = c.getElementsByTagName('layout-container')[0];
      if(elementLayout.getLayoutValues(arguments))
      {
        c.clearAndRender(elementLayout.metricsTemplate());
      }
    }
  }
  
  this.updateOffsets = function(container, offset_values)
  {
    var offsets = container.getElementsByTagName('offsets-container')[0];
    if (offsets)
    {
      if (offset_values)
        offsets.clearAndRender(window.templates.offset_values(offset_values));
      else
        offsets.innerHTML = '';
    }
  }
  
  this.init(id, name, container_class);

  var onSettingChange = function(msg)
  {
    if( msg.id == "dom" 
        && ( msg.key == "show-siblings-in-breadcrumb" || msg.key == "show-id_and_classes-in-breadcrumb" ) )
    {
      self.updateOffsets({});
    }
  }

  messages.addListener("setting-changed", onSettingChange);
}
