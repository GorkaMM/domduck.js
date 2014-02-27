/*  
 *	DOMDUCK.JS
 *	Version: 0.1
 *	
 *	Author: Gorka Magaña
 *
 *
 *
 *	CORE FEATURES
 *	- Basic but powerful DOM manipulation
 *	- Basic but powerful CSS manipulation
 *	- Shortcuts for common Javascript usage
 *	- Basic but powerful events and observer/pattern system
 *	- Basic token system
 *	- Basic but powerful Ajax system | *TO-DO
 *	- Require module
 *
 *
 *	STATUS NAMING | Use them the way they're meant to.
 *	- Experimental => It's a draft, unstable and finite in time. Must have a lot of testing and improvements. Feedbacks are welcome.
 *	- Unstable => It works but has not been tested in real-world needs. Must be tested in different evironments. Feedbacks are welcome.
 *	- Stable => It works and it has been tested in real-world. Officially available and supported.
 *
 */



/*
 *	@param (Object) window => Objeto window que contiene todos los métodos y propiedades de Javascript.
*/
(function (window) {
    
    "use strict";

	var VERSION = 0.1,
        
        domduck = { // Creamos el objeto "domduck" que englobará métodos y propiedades del asignados al elemento seleccionado con get(selector).

            // DOM

            /*	
             *	STATUS => Experimental
             *	Devuelve un array con el/los padre/s de el/los elemento/s
             *	desde donde lo llamemos. Ej: get('#midiv').parent()
            */
            parent: function () {
                var parents = [];
                this.each(function (elem) {
                    parents.push(elem.parentNode);
                });
                return get(parents);
            },
            /*	
             *	STATUS => Unestable
             *	Devuelve un array con el/los hijo/s de el/los elemento/s
             *	desde donde lo llamemos. Ej: get('#midiv').children(selector)
             *	
             *	@params [optional] (String) selector => Selector del hijo. Ej: '#thisID'.
            */
            children: function (selector) {
                var children = [];
                this.each(function (elem) {
                    var child = (selector && typeof document.querySelectorAll !== 'undefined') ? elem.querySelectorAll(selector) : elem.childNodes;
                    child.each(function (child) {
                        if (child.nodeType === 1) children.push(child);
                    });
                });
                return get(children);
            },
            /*	
             *	STATUS => Unestable
             *	Método para crear y añadir elementos del DOM dentro de otro/s
             *	elemento/s del DOM.
             *	
             *	@params [required if no JSON object passed] (String) Nombre de la etiqueta del elemento vacío a crear. Ej: 'div', 'span'...
             *	@params [required if no string passed] (JSON Object) args => Propiedades con las que crear el/los elemento/s. Ej: { tag: 'div', class: 'myclass' ... }
             *		'-> Obligatorios: tag
             *	@params [optional] (Boolean) prepend => false (default) => Crear el elemento al final | true => Al principio.
             *	@params [optional] (Function) callback => Función a la que se llama, si definida, al completar la tarea.
            */
            add: function (args, prepend, callback) {
                var createdElems = [];
                this.each(function (elem) {
                    var tag = args.tag || args,
                        el = document.createElement(tag);
                    // Si "attributes" está especificado, le asignamos los atributos al elemento recién creado.
                    if (args.attributes) {
                        for (var attr in args.attributes){
                            // Evitamos que coja como atributos propiedades y elementos de prototype y le asignamos los definidos.
                            if (Object.getPrototypeOf) {
                                if(args.attributes[attr] !== Object.getPrototypeOf(args.attributes)[attr]) el.setAttribute(attr, args.attributes[attr]);
                            }else{
                                if(args.attributes[attr] !== args.attributes.__proto__[attr]) el.setAttribute(attr, args.attributes[attr]); // __proto__ is DEPRECATED	
                            }
                        }
                    }
                    if (args.content || args.html) el.innerHTML = args.content || args.html;
                    if(typeof(prepend)=='boolean' && prepend) { elem.insertBefore(el, elem.firstChild); }else{ elem.appendChild(el); }
                    createdElems.push(el);
                });
                arguments.each(function (param){
                    if (typeof(param)=='function') param(createdElems);
                });
                return get(createdElems);
            },
            /*	
             *	Acceso directo a get(selector).add(args, true, callback) => Añadir
             *	elemento al principio del padre.
            */
            prepend: function(args, callback) {
                return this.add(args, true, callback);
            },
            /*	
             *	Acceso directo a get(selector).add(args, false, callback) => Añadir
             *	elemento al final del padre.
            */
            append: function(args, callback) {
                return this.add(args, false, callback);
            },
            /*	
             *	STATUS => Unestable
             *	Método para obtener o modificar atributos del objeto.
             *	
             *	@params [required if no others passed] (JSON Object) args => Atributos que modificar y su valor. Ej: {class:'myclass', style:'border:20px', ...}
             *	@params [required if no JSON object passed] (String) attribute, value => Atributo y valor que asignarle (sólo uno).
             *	@params [required if getting atrribute's value] (String) attribute => Obtiene el valor del atributo.
            */
            attr: function (attribute, value) {
                var args = arguments[0],
                    data = [];
                this.each(function(elem){
                    if(elem){
                        if(typeof(args)=='object'){
                            for (var attr in args) {
                                // Evitamos que coja como atributos propiedades y elementos de prototype y le asignamos los definidos.
                                if(!(attr in args.prototype)) elem.setAttribute(attr, args[attr]);
                            }
                        } else {
                            if(!value) {
                                data.push(elem.getAttribute(attribute));
                            }else{
                                elem.setAttribute(attribute, value);
                            }
                        }
                    }
                });
                var result = (data[0]) ? data : this;
                return result;
            },
            /*	
             *	STATUS => Stable
             *	Método para obtener o modificar el contenido HTML del elemento.
             *	Si no hay parámetro devuelve el contenido.
             *	
             *	@params [optional] (String) string => Contenido a meter dentro del elemento.
            */
            innerHTML: function (string){
                var data;
                this.each(function (elem){
                    if(!string){
                        data = elem.innerHTML;
                    }else{
                        elem.innerHTML = string;
                    }
                });
                var result = (!data) ? this : data;
                return result;
            },






            // CSS

            /*	
             *	STATUS => Unestable
             *	Método para obtener o modificar propiedades CSS del objeto.
             *	
             *	@params [required if no others passed] (JSON Object) args => Propiedades CSS que modificar y su valor. Ej: {opacity:0, height:'20px', ...}
             *	@params [required if no JSON object passed] (String) property, value => Propiedad CSS (en formato Javascript) y valor que asignarle (sólo uno).
             *	@params [required if no JSON object passed] (String) property => Obtiene el valor de la propiedad CSS (en formato Javascript).
            */
            css: function (property, value) {
                var args = arguments[0],
                    data;
                this.each(function (elem){
                    if(elem){
                        if(typeof(args)=='object'){
                            for (var prop in args) {
                                elem.style[prop] = args[prop];
                            }
                        } else {
                            if(!value) {
                                data = elem.style[property];
                            }else{
                                elem.style[property] = value;
                            }
                        }
                    }
                });
                var result = (!data) ? this : data;
                return result;
            },
            /*	
             *	STATUS => Experimental
             *	Devuelve el estilo computado del primer elemento de la lista. Ej: la altura (actualmente aplicada) de un elemento.
             *
             *	@params [required if no others passed] (Array) args => Propiedades CSS de las que coger su valor computado. Ej: ['opacity', 'font-size', ...]
             *	@params [required if no JSON object passed] (String) property => Propiedad CSS. Ej: 'font-size'.
             *	@params [optional] (String) pseudo => El selector pseudo de donde coger el valor de la propiedad CSS. Ej: .getComputedStyle('font-size', ':after').
            */
            getComputedStyle: function (property, pseudo){
                var args = arguments[0],
                    pseudoSelector = pseudo || null,
                    computedStyle = null,
                    elem = this[0];

                if(elem && args){
                    if(args.isArray){
                        computedStyle = {};
                        args.each(function (property){
                            if(window.getComputedStyle){
                                computedStyle[property] = window.getComputedStyle(elem, pseudoSelector).getPropertyValue(property);
                            }else if(elem.currentStyle){
                                // FIX
                                if(property==='width') {
                                    computedStyle[property] = elem.offsetWidth;
                                }else if(property==='height') {
                                    computedStyle[property] = elem.offsetHeight;
                                }else{
                                    computedStyle[property] = elem.currentStyle[property];
                                }
                            }
                        });
                    }else{
                        if(window.getComputedStyle){
                            computedStyle = window.getComputedStyle(elem, pseudoSelector).getPropertyValue(property);
                        }else if(elem.currentStyle){
                            // FIX
                            if(property==='width') {
                                computedStyle = elem.offsetWidth;
                            }else if(property==='height') {
                                computedStyle = elem.offsetHeight;
                            }else{
                                computedStyle = elem.currentStyle[property];
                            }
                        }
                    }
                }
                return computedStyle;
            },
            /*	
             *	STATUS => Experimental
             *	Comprueba si el/los elemento/s tiene/n la clase y devuelve (Boolean) true/false.
             *
             *	@params [required] (String) c => La clase a comprobar.
            */
            hasClass: function(c){
                for (var i = 0; i < this.length; i++ ) {
                    var classname = ' '+this[i].className+' ';
                    if(classname.indexOf(' '+c+' ') > -1) return true;
                }
                return false;
            },
            /*	
             *	STATUS => Experimental
             *	Añade una clase (si no existe) al/los elemento/s.
             *
             *	@params [required] (String) c => La clase a añadir.
            */
            addClass: function (c){
                this.each(function (elem){
                    if(!get(elem).hasClass(c)) elem.className += ' '+c;
                });
                return this;
            },
            /*	
             *	STATUS => Experimental
             *	Elimina una clase (si existe) al/los elemento/s.
             *
             *	@params [required] (String) c => La clase a eliminar.
            */
            removeClass: function (c){
                this.each(function (elem){
                    if(get(elem).hasClass(c)) {
                        var reg = new RegExp('(\\s|^)'+c+'(\\s|$)');
                        elem.className=elem.className.replace(reg,' ');
                    }
                });
                return this;
            },






            // ARRAYS

            /*	
             *	STATUS => Unstable
             *	Recorre todos los elementos de un array y ejecuta el callback para cada uno de ellos.
             *
             *	CALLBACK -passed params
             *	========
             *	@params (Node) this => El valor de "this" en el callback es el de cada uno de los elementos.
             *	@params (Node) first => El valor del primer parámetro que recibe el callback es el de cada uno de los elementos.
             *	@params (Number) second => El valor del segundo parámetro que recibe el callback es el index de cada uno de los elementos.
            */
            each: function (callback){
                if(this.forEach){
                    this.forEach(callback, this);
                }else{
                    for (var i = 0; i < this.length; i++ ) {
                        callback.call(this[i], this[i], i);
                    }
                }
            },






            // EVENTOS

            /*	
             *	STATUS => Unstable
             *	Asigna "event listeners" al elemento. Ej: get('#myDIV').on('click', function(event){ ... });
             *	
             *	@params [required] (String) type => Tipo de evento a asignar. Ej: click, mouseover...
             *	@params [optional] (Function) callback(event) => Función que se llama cuando el evento ocurre.
             *
             *	+ INFO => https://developer.mozilla.org/en/DOM/DOM_event_reference
            */
            on: function (type, callback){
                this.each(function (elem){
                    if(elem.attachEvent) {
                        elem.attachEvent(type, callback);
                    } else {
                        elem.addEventListener(type, callback);
                    }
                });
                return this;
            },
            /*	
             *	STATUS => Unstable
             *	Suscribe el objeto a un evento propio. Ej: 'on delete', 'change' ...
             *	
             *	@params [required] (String) event => Nombre de evento al que suscribirse.
             *	@params [required] (Function) callback(event) => Función que se llama cuando se publica el evento.
            */
            subscribe: function (event, callback){
                var events = _domduck._observer.events;
                this.each(function (elem){
                    var _token = _domduck._token.generate();
                    elem.token = _token;
                    if(!events[event]) events[event] = [];
                    events[event].push({
                        token: _token,
                        elem: elem,
                        callback: callback
                    });
                });
                return this;
            },
            /*	
             *	STATUS => Unstable
             *	Desuscribe el objeto de un evento propio. Ej: 'on delete', 'change' ...
             *	
             *	@params [required] (String) event => Nombre de evento del que desuscribirse.
             *	@params [optional] (Function) callback(event) => Función que se llama cuando se ha desuscrito del evento.
            */
            unsubscribe: function (event, callback){
                this.each(function (elem){
                    var e = _domduck._observer.events[event];
                    if(elem.token && e) {
                        e.each(function (eventelem, index){
                            if(elem.token == eventelem.token) {
                                e.splice(index, 1);
                                if(callback) callback();
                            }
                        });
                    }
                });
                return this;
            },






            // AJAX

            /*	
             *	STATUS => Experimental
             *	Carga contenido de forma asíncrona dentro del elemento.
             *	
             *	@params [required] (String) url => URL del contenido a cargar.
             *	@params [optional] (Function) callback(XHRObject) => Función que se llama cuando todo ha ido OK.
            */
            load: function (url, callback){
                this.each(function (elem){
                    var ajax = new XMLHttpRequest();
                    ajax.onreadystatechange = function(){
                        if(this.readyState==4) {
                            elem.innerHTML = this.responseText;
                            if(callback) callback(this);
                        }
                    };
                    ajax.open('GET', url, true);
                    ajax.send();
                });
            },






            // NATIVE JAVASCRIPT

            /*	
             *	STATUS => Experimental
             *	Permite usar Javascript nativo sobre el elemento
             *	seleccionado con get(selector).
             *	Ej: get('#myDIV').js('this.style.background = "black"');
             *	
             *	@params [required] (String) func => String con el código a ejecutar.
             *	@params [optional] (Boolean) rturn =>
             *		=> false (default) => Devuelve el elemento que lo llama.
             *		=> true => Devuelve lo que devuelva el código de "func".
            */
            js: function (func, rturn) {
                var retrn;
                this.each(function(elem){
                    retrn = (new Function(func)).call(elem);
                });
                if(rturn){ return retrn; }else{ return this; }
            }

        },

        _domduck = { // Objeto que engloba los métodos privados.

            // DOM

            /*	
             *	STATUS => Unstable
             *	Creamos el método "get" con el que seleccionar elementos
             *	del DOM y sobre los que poder utilizar los métodos de domduck.
             *	
             *	@param [required] (String) name => '#id', '.clase', 'tag' o selectores CSS complejos (navegadores modernos)
            */
            _get: function (selector) {
                if(typeof(selector) == 'object' && (isNaN(selector.length) || selector.length === 0)) return _domduck._extend([selector], domduck); // objeto => this
                if(typeof(selector) == 'object' && selector.length > 0) return _domduck._extend(selector, domduck); // [array]
                // CSS Selectors => Nueva WebAPI nativa para seleccionar elementos del DOM con selectores CSS. ! Debe ir aquí porque no admite objetos, sólo strings.
                if(typeof(document.querySelectorAll)!='undefined' && typeof(selector) == 'string') return _domduck._extend(document.querySelectorAll(selector), domduck); // CSS Selectors
                if(selector.indexOf('.') === 0) return _domduck._extend(document.getElementsByClassName(selector.split('.')[1]), domduck); // '.clase'
                if(selector.indexOf('#') === 0) return _domduck._extend([document.getElementById(selector.split('#')[1])], domduck); // '#id'
                if(typeof(selector) == 'string') return _domduck._extend(document.getElementsByTagName(selector), domduck); // 'tag'
            },

            /*	
             *	STATUS => Stable
             *	Extiende el objeto que le pasemos con los métodos de "domduck"
             *	y los módulos, si tiene.
             *	
             *	@param [required] (Object) element => Elemento del DOM (div, span, a...)
             *	@param [required] (Object) method => Método (function) que asignale al element
            */
            _extend: function (element, method) {
                for (var name in method) element[name] = method[name];
                return element; // Devolvemos el objeto para poder concatenar métodos. Ej: get('myDIV').hey()
            },


            // OBSERVER PATTERN

            /*	
             *	STATUS => Unstable
             *	Publica un evento haciendo reaccionar a todos los elementos
             *	que estén suscritos mediante get(selector).subscribe( ... ).
             *	
             *	USO
             *	===
             *	domduck.events.publish('nombredelevento');
             *	
             *	@params [required] (String) event => Nombre de evento que publicar.
            */
            _observer: {
                events: {},
                publish: function (event) {
                    var e = _domduck._observer.events[event];
                    if(e){
                        e.each(function (obj){
                            obj.callback.call(obj.elem, event, obj.token);
                        });
                    }
                }
            },


            // TOKENS

            _token: {
                /*	
                 *	STATUS => Stable
                 *	Genera un token aleatorio con 3 niveles de longitud.
                 *	
                 *	@param [optional] (String) strength => 'weak' o 'strong'. Default: 20 chars.
                */
                generate: function (strength){
                    var chars = '0123456789ABCDEFGHIJKLMNOPQRST-UVWXTZabcdefghiklmnopqrstuvwxyz-'.split(''),
                        length = (strength=='weak') ? 10 : (strength=='strong') ? 30 : 20,
                        token = '';

                    for(var i=0; i < length; i++) {
                        token += chars[Math.floor(Math.random() * chars.length)];
                    }
                    return token;
                }
            }

        };




	// PROTOTYPE
	// Añade métodos si el navegador no los implementa.

	// Agregamos el método "each" a los objetos Array y Object, con el que poder asignar una función a cada objeto de un Array o JSON Object.
	Array.prototype.each = domduck.each;
	Object.prototype.each = domduck.each;

	/*	
	 *	STATUS => Unstable
	 *	Elimina los espacios al principio y al final de un String.
	 *	
	 *	@param (Bool) true => Elimina todos los espacios del string. Default: false.
	*/
	if(!String.prototype.trim) {
		String.prototype.trim = function(removeSpaces) {
			if(removeSpaces) return this.replace(/\s/g, '');
			return this.replace(/^\s+|\s+$/g, '');
		};
	}
	/*	
	 *	STATUS => Stable
	 *	Pone en mayúscula la primera letra del string.
	*/
	if(!String.prototype.capitalize) {
		String.prototype.capitalize = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
		};
	}
	/*	
	 *	STATUS => Stable
	 *	Devuelve si el elemento es un array o no.
	*/
	if(!Array.prototype.isArray) {
		Array.prototype.isArray = function() {
			return Object.prototype.toString.call(this) === "[object Array]";
		};
	}



	// WINDOW

	//window.domduck = domduck; // Testing
	window.get = _domduck._get; // Extendemos el objeto "window" con el método "get" de "domduck", de forma que podamos seleccionar elementos directamente con "get()", sin necesidad de usar "domduck.get()".
	
	// Hacemos públicos algunos métodos y propiedades.
	window.domduck = {
		VERSION: VERSION,
		// Creamos la función para extender el objeto "domduck" con los métodos y propiedades de los módulos que la llamen.
		extend: function (module) {	for (var name in module) domduck[name] = module[name]; },
		token: {
			generate: _domduck._token.generate
		},
		events: {
			publish: _domduck._observer.publish
		}
	};

}(this));




