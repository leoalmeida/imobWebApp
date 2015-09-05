/* global angular */

imobDbFilters.filter('dateFormat', function() {
		return function(input,type) {
			if(!input) return "";
			input = new Date(input);
			var res = input.getDate() + "/" + (input.getMonth()+1) + "/" + input.getFullYear() + " ";
			
			if (!type){
          var hour = input.getHours();
          
          var minute = input.getMinutes()+1;
          if(minute < 10) minute = "0" + minute;
          res += hour + ":" + minute;
			}
			return res;		
		};
	});

imobDbFilters.filter('formatoMonetario', function() {
		return function(input,type) {
			if(!input) return "";
			var res = "R$" + input + ",00" ;			
			
			return res;		
		};
	});

imobDbFilters.filter('formatoEndereco', function() {
		return function(input) {
			if(!input) return "";			
			return input.rua + " " + input.numero + "/" + input.complemento + ", " + input.bairro + " - " + input.cidade + "/" + input.estado + " - CEP:" + input.cep;
		
		};
	});

imobDbFilters.filter('docFilter', [function () {
	    return function (documents, selectedDocTypes) {
		var tempDocuments = [];
		if (!angular.isUndefined(documents) && !angular.isUndefined(selectedDocTypes) && selectedDocTypes.length > 0) {
		    
		    angular.forEach(selectedDocTypes, function (key) {
			angular.forEach(documents, function (document) {
			    if (angular.equals(document.tipo, key)) {
				tempDocuments.push(document);
			    }
			});
		    });                    
		}
		return tempDocuments;
	    };
	}]);

imobDbFilters.filter('ativosFilter', [function () {
	    return function (lista) {
		var tempList = [];
		if (!angular.isUndefined(lista) && lista.length > 0) {
		    
		   
			angular.forEach(lista, function (item) {
			    if (angular.equals(item.status, "Ativo")) {
				tempList.push(item);
			    }
			});
		                       
		}
		return tempList;
	    };
	}]);
