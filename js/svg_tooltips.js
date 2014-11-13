/*! svg_tooltips - v0.1.0 - 2013-10-02
* https://github.com/motherjones/svg_tooltips
* Copyright (c) 2013 Mother Jones Data Desk; Licensed MIT */
"use strict";

(function($) {

    $.tooltip_svg = function(tooltip_template, public_spreadsheet_url, options) {
        var tooltip = jQuery('<div class="svg_tooltip" style="display: none; position: absolute;"><p>text</p></div>');
        $('body').prepend(tooltip);

        var tooltip_identifier = 'tooltip' + Math.random();
        var compiled_tooltip = dust.compile(tooltip_template, tooltip_identifier);
        var container = $('#' + options.container);
        console.log(options);
        console.log(container);
        dust.loadSource(compiled_tooltip);

        Tabletop.init( { 
            key: public_spreadsheet_url,
            callback: function(dataset) {
                configure_svg(dataset);
            },
            simpleSheet: true 
        } )

        var shapes = [];

        var configure_svg = function(dataset) {
            for (var i = 0; i < dataset.length; i++) {
                var data = dataset[i];

                if (!data.id) { continue; }
                var dumb_shape = document.getElementById(data.id)
                if (!dumb_shape) { continue; }

                dumb_shape.setAttribute(
                    'class', 
                    dumb_shape.getAttribute('class') + ' has_tooltip'
                );

                var shape = jQuery('#' + data.id);
                shapes.push(shape);

                dust.render(tooltip_identifier, data, function(err, out) {
                    shape.attr('data-tooltip', out);
                });

                shape.bind('mouseout', function(){
                    tooltip.css('display', 'none');
                });

                shape.bind('mousemove', function(e){
                    var width = tooltip.outerWidth();
                    var left = e.pageX + 10
                    if ( 
                        (e.pageX + width)
                        > (container.outerWidth() 
                            + container.offset().left)
                    ) {
                        left = e.pageX - width - 10;
                    }
                    tooltip
                        .css('left', left)
                        .css('top', e.pageY + 10)
                        .css('display', 'block')
                        .html($(this).attr('data-tooltip'));
                });

                shape.click(function(e){
                    for (var i =0; i < shapes.length; i++) {
                        var shape = shapes[i];

                        shape.unbind('mouseout');
                        shape.unbind('mousemove');
                    }
                    tooltip.css('left', e.pageX + 10)
                        .css('top', e.pageY + 10)
                        .css('display', 'block')
                        .html(jQuery(this).attr('data-tooltip'));
                    
                    if(e.stopPropagation) {
                        e.stopPropagation();
                    } else {
                        e.cancelBubble = true;
                    }
                    return false;
                });

            }

            $(document).click(function() {
                for (var i =0; i < shapes.length; i++) {
                    var shape = shapes[i];

                    shape.bind('mousemove', function(e){
                      tooltip.css('left', e.pageX + 10)
                        .css('top', e.pageY + 10)
                        .css('display', 'block')
                        .html($(this).attr('data-tooltip'));
                    });
                    shape.bind('mouseout', function(){
                      tooltip.css('display', 'none');
                    });
                    tooltip.css('display', 'none');
                }
            });
        };

        return {
            'container' : container,
            'shapes'    : shapes,
            'tooltip'   : tooltip
        };
    };

    $.fn.tooltip_svg = function(tooltip_template, public_spreadsheet_url, options) {
        options = options || {};
        options.container = this.attr('id');
        this.tooltip_svg = $.tooltip_svg(tooltip_template, public_spreadsheet_url, options);
        return this;
    };
}(jQuery));
