/* jquery.microtemplate.js
 * MIT Licensed
 *
 * original:
 * John Resig - http://ejohn.org/ - MIT Licensed
 * http://ejohn.org/blog/javascript-micro-templating/
 * (also appears in "JavaScript Ninja")
 * 
 * modified:
 * 2013 Masayuki Kozawa
 *  - fix for text contains more than two single quotes
 *  - change to work as a jQuery Plugin
 *  - add some filterling functions html, nl2br, uri
 *    - e.g. <%= foo | html | nl2br | uri %>
 *  - add html escape notion
 *    - <%== foo %> is shorthand for <%= foo | html %>
 */

(function($){
    var cache = {};    
    $.tmpl = function (str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        
        var fn =
            (/\W/.test(str)
             ? new Function('obj', [
                 // Introduce the data as local variables using with(){}
                 // Convert the template into pure JavaScript
                 "var p=[];with(obj){",
                 "p.push('",
                 str.replace(/[\r\t\n]/g, " ")
                     .split("<%").join("\t")
                     .replace(/(^|%>)[^\t]*?(\t|$)/g, function(str){
                         return str.split("'").join("\\'");
                     })
                     .replace(/\t==(.*?)%>/g, '\t=$1|html%>')
                     .replace(/\t=(.*?)%>/g, function(_, str){
                         str.replace(/^(.*?[^\|])((\|\s*\w+\s*)+)$/, function(_, w, fs){
                             str = w;
                             $.each(fs.split(/\|/), function(_, f){
                                 f = f.replace(/^\s*|\s*$/g,'');
                                 if ($.tmpl.filter[f]){
                                     str = '$.tmpl.filter.'+f+'('+str+')'
                                 }
                             });
                         });
                         return "',"+str+",'";
                     })
                     .split("\t").join("');")
                     .split("%>").join("p.push('"),
                 "');",
                 "}return p.join('');"].join(''))
             : cache[str] || (cache[str] = function(){
                 var t = $('#'+str);
                 if (!t[0]){ throw "template not found: " + str }
                 return $.tmpl(t.html());
             }()));
        
        // Provide some basic currying to the user
        return data ? fn(data) : fn;
    };
    
    $.tmpl.filter = {
        html: (function(){
            var div = $('<div/>');
            return function(str){
                return div.text(str === 0 ? '0' : str || '').html();
            }
        })(),
        unhtml: function(str){
            return str.replace(/&amp;(gt|lt|amp|quot|apos);/g, '&$1;');
        },
        nl2br: function(str){
            return str.replace(/\r?\n/g, '<br/>');
        },
        uri: function(str){
            return encodeURI(str);
        }
    };
    
    $.fn.extend({
        tmpl: function (tmplId, data) {
            var t = $.tmpl(tmplId, data);
            this.each(function(){
                $(this).html(t);
            });
            return this;
        },
        tmplAppend: function (tmplId, data) {
            return $($.tmpl(tmplId, data)).appendTo(this);
        },
        tmplPrepend: function (tmplId, data) {
            return $($.tmpl(tmplId, data)).prependTo(this);
        }
    });
})(jQuery);
