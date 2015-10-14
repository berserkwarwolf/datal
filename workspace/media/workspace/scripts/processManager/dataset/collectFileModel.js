var CollectFileModel = StepModel.extend({
	
	defaults:{
		file_data: null,
		inputFileId: "#id_file_data",
		files: [],
		mbox: "",
		license_url: "",
		license_url_other: null,
		spatial: "",
		frequency: "",
		frequency_other: null,
		collect_type: 0,
		impl_type: ""
	},

	validation: {
		file_data: {
			fn: function(value, attr, computedState, model){

				// Entro por drop
				if(value === 'undefined' || value === null){

					// Si no esta definido un file en el model
					if( !_.isUndefined(computedState.files[0]) ){
						value = computedState.files[0].name;
					}else{
						return gettext('APP-VALIDATE-FILE-NOFILE');
					}
					
				} 

				// Valido que sea una extension permitida
				if(!value.toLowerCase().match(/(\.|\/)(doc|docx|docm|dotx|dotm|xls|xlsx|xlsm|xltx|xltm|xlsb|xlam|xll|odt|ods|csv|txt|pdf|html|htm|xml|kml|kmz|tsv|zip|rar|jpg|jpeg|png|gif)$/i)) {
				  return gettext('APP-VALIDATE-FILE-TYPE-TEXT');
				}

			}
		}
		
	},

	setOutput: function(){

		var output = this.get('output');

    output.inputFileId = this.get('inputFileId');
		output.files = this.get('files');
		output.collect_type = this.get('collect_type');
		output.impl_type = this.get('impl_type');

		// Set new output
		this.set('output',output);

	},

	checkExtension : function(filename){
		var filename = filename.split('/');
		filename = filename[filename.length - 1];
		var extension = filename.split('.')[1].toLowerCase();

		var impl_type = '';
		switch(extension) {
			
			// 0 = HTML
			case "html":
				impl_type = 0;
				break;

			// 3 = XML
			case "xml" :
				impl_type = 3;
				break;

			// 4 = XLS
			case "xlsx":
			case "xls":
			case "xlsm":
			case "xltx":
			case "xltm":
			case "xlsb":
			case "xlam":
			case "xll":            	
				impl_type = 4;
				break;

			// 5 = PDF
			case "pdf" :
				impl_type = 5;
				break;

			// 6 = DOC
			case "doc":
			case "docx":
			case "docm":
			case "dotx":
			case "dotm":
				impl_type = 6;
				break;
			
			// 7 = ODT
			case "odt":
				impl_type = 7;
				break;

			// 9 = ODS
			case "ods":
				impl_type = 9;
				break;
			
			// 10 = CSV
			case "csv":
			case "txt":
				impl_type = 10;
				break;

			// 11 = KML
			case "kml":
				impl_type = 11;
				break;

			// 12 = KMZ
			case "kmz":
				impl_type = 12;
				break;

			// 18 = IMAGE
			case "png":
			case "jpg":
			case "jpeg":
			case "gif":
				impl_type = 18;
				break;

			// 19 = ZIP
			case "zip":
			case "rar":
				impl_type = 19;
				break;

			// 20 = TSV
			case "tsv":
				impl_type = 20;
				break;
			
		}

		return impl_type;
	}

});