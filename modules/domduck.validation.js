/*  
 *	DOMDUCK.VALIDATION module
 *	Version: 0.1
 *	
 *	Author: Gorka Magaña
 *
 *
 *
 *	VALIDATION FEATURES
 *	- HTML form inputs validation | Live validation should be done
 *	- Validation types are easily extensible
 *
 *
 *	STATUS NAMING | Use them the way they're meant to.
 *	- Experimental => It's a draft, unstable and finite in time. Must have a lot of testing and improvements. Feedbacks are welcome.
 *	- Unstable => It works but has not been tested in real-world needs. Must be tested in different evironments. Feedbacks are welcome.
 *	- Stable => It works and it has been tested in real-world. Officially available and supported.
 *
 *
 *	HOW IT WORKS
 *	The validate() method searches for inputs with "data-validation" attribute
 *	inside the form and applies the validation depending on what's to be validated.
 *	Example: <input ... data-validation="min:10, max:50, initial:Search..." ... ></input>
 *	
 *	Then you should apply the method to the form/s and assign a
 *	callback function which's called when everything's OK.
 *
 *	|	get('form').validate('live', callback);
 *	|							'-> [optional] => TO-DO!
 *
 */




(function (window){

	var VERSION = 0.1,

	validation = {

		/*	
		 *	STATUS => Unstable
		 *	@param [optional] (String or Boolean) live => 'live'/true -> Validates on blur of inputs | false (default) -> On submit
		 */
		validate: function(live, callback) {

			var props = 'min, max, initial, alphabetonly', // propiedades admitidas para validar separadas por comas.
				validatelive = ((live=='live' || live) && typeof(live)!='function') ? true : false,
				form = this;

			callback = (typeof(arguments[0])=='function') ? arguments[0] : arguments[1];

			this.on('submit', function (event){
				// Cancelamos el evento de enviar del formulario para poder validar primero.
				event.preventDefault();

				var validated = true;

				// Recorremos los elementos del formulario.
				this.each(function (elem){

					var validation = _validation._getData('validation', elem), // Cogemos la info de "data-validation".
						type = (elem.tagName.toLowerCase() == 'textarea') ? 'text' : elem.getAttribute('type'), // El tipo de elemento (text, submit, checkbox, textarea...).
						method = '_'+type; // Método de "_validation" al que vamos a llamar para validar. Por defecto => _typodeelemento


					// Si el elemente tiene "data-validation" definido y hay un método en "_validation" para validarlo:
					if ((typeof(validation)=='string') && (method in _validation)) {

						var to_validate = {};
						validation = validation.trim(true); // Quitamos los espacios para evitar errores.

						// Si hay propiedades definidas en "data-validation" (min:10, max:30 ... ):
						if (validation.indexOf(':') > -1) {
							validation.split(',').each(function (data){							
								var property = data.split(':')[0],
									value = data.split(':')[1];
								// Si las propiedades a validar están admitidas (variable "props"):
								if (props.indexOf(property) > -1){
									to_validate[property] = value; // Agregamos la propiedad y su valor al objeto "to_validate".
								}
							});
						// Si lo que hay es, en cambio, el tipo de validación (por lo que es "email", "phone"...):
						} else {
							method = '_'+validation;
						}

						
						// VALIDAMOS LOS CAMPOS
						if (_validation[method](elem, to_validate)) {
							_validation._delError(elem);							
						} else {
							validated = false; // Si algo está mal, evitamos que se llame al callback.
							_validation._addError(elem);
						}
					}

				});

				// COMPROBAMOS QUE TODO ESTÉ BIEN

				// Llamamos al callback si todo OK.
				if (validated) callback.call(form, form);

			});
		}

	},

	_validation = {

		// VALIDACIÓN DE CAMPOS | STATUS => Unstable
		
		_text: function(elem) {
			var value = elem.value,
				args = arguments[1],
				min = args.min || 0, // Si "min" no está definido lo establecemos a 0.
				max = args.max || Infinity, // Si "max" no está definido lo establecemos a Infinity.
				initial = args.initial || '',
				alphabetonly = (args.alphabetonly) ? true : false; // (alphabetonly && !/[0-9\.\*\-\+\[\]\^]/.test(value))
		    if(value.length >= min && value.length <= max && isNaN(value) && value!=initial) return true;
		    return false;
		},
		_email: function(elem) {
			var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    
			if(!reg.test(elem.value)) return false;
			return true;
		},
		_phone: function(elem) {
			var phone = elem.value;
			if(phone.length==9 && !isNaN(phone) && phone > 600000000) return true;
			return false;
		},
		_checkbox: function(elem) {
			if(elem.checked) return true;
			return false;
		},
		_file: function(elem) {
			var value = elem.value,
				args = arguments[1],
				initial = (args.initial) ? args.initial : '';
			if(value!=initial && value > '') return true;
			return false;
		},




		// MÉTODOS | STATUS => Stable

		_getData: function (name, elem){
			return elem.getAttribute('data-'+name);
		},
		_addError: function (elem){
		    var parent = get(elem).parent().pop(),
				error = parent.lastChild;
		    if (parent.hasAttribute('data-error')) return false;
		    parent.setAttribute('data-error', 'true');
		    get(parent).css('position', 'relative').add({
				tag: 'div',
				attributes: {
					'class': 'error'
				},
				html: '×'
		    });
		    return true;
		},
		_delError: function (elem){
			var parent = get(elem).parent().pop(),
				error = parent.lastChild;
		    if (parent.hasAttribute('data-error')) {
				parent.removeChild(error);
				parent.removeAttribute('data-error');
				return true;
		    }
		    return false;
		}

	}

	domduck.extend(validation); // Extendemos domduck con "validation".

	// Cargamos el CSS en la página que ha cargado domduck.validation.
	get('head').append({
		tag:'link',
		attributes: {
			rel: 'stylesheet',
			type: 'text/css',
			href: '../modules/css/domduck.validation.css'
		}
	});

	// Hacemos la versión accesible para posibles comprobaciones.
	window.domduck.validation = {
		VERSION: VERSION
	};


}(this));




