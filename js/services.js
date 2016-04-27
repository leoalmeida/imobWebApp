/* global angular,window */
imobDbServices.factory('facebookService', function($q) {
    return {
        getMyLastName: function() {
            var deferred = $q.defer();
            FB.api('/me', {
                fields: 'last_name'
            }, function(response) {
                if (!response || response.error) {
                    deferred.reject('Error occured');
                } else {
                    deferred.resolve(response);
                }
            });
            return deferred.promise;
        }

    }
});

imobDbServices.factory('FileReader', ['$rootScope', '$http', '$templateCache', function ($rootScope,$http, $templateCache){
    var readAsJson = function (file, scope) {
       return $http.get(file)
          .success(function(data) {
              return data;
          }).
          error(function(data) {
              dat = data || "Status:" || status || " - Request failed";
              chrome.extension.getBackgroundPage().console.log(dat);
          });
    };

    return {
      readAsJson: readAsJson
    };
  }]);

imobDbServices.factory('gdocs', function() {
  var gdocs = new GDocs();

  var dnd = new DnDFileController('.biblioteca', function(files) {
    var $scope = angular.element(this).scope();
    Util.toArray(files).forEach(function(file, i) {
      gdocs.upload(file, function() {
        $scope.fetchDocs(true);
      }, true);
    });
  });

  return gdocs;
});

imobDbServices.factory('AuthenticationService', function() {
    var auth = {
        isAuthenticated: false,
        isAdmin: false
    }

    return auth;
});

imobDbServices.factory('TokenInterceptor', function ($q, $window, $location, AuthenticationService) {
    return {
        request: function (config) {

            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        /* Set Authentication.isAuthenticated to true if 200 received */
        response: function (response) {
            if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {
            if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
                delete $window.sessionStorage.token;
                AuthenticationService.isAuthenticated = false;
                $location.path("/login");
            }

            return $q.reject(rejection);
        }
    };
});

imobDbServices.factory('PostService', function($http) {
    return {
        findAllPublished: function() {
            return $http.get(options.api.base_url + '/api/items');
        },

        findAll: function() {
            return $http.get(options.api.base_url + '/api/items/all');
        },

        find: function(id) {
            return $http.get(options.api.base_url + '/api/item/' + id);
        },

        findByTag: function(tag) {
            return $http.get(options.api.base_url + '/api/items/tag/' + tag);
        },

        publish: function(post) {
            return $http.post(options.api.base_url + '/api/items', {'post': post});
        },

        publishDocs: function(file) {
            var fd = new FormData();
            fd.append('file', file);
            //return $http.post(options.api.base_url + '/upload/docFile', fd, {
            return $http.post(options.api.base_url + '/apis/docFile', fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        },

        publishUpdate: function(post) {
            return $http.put(options.api.base_url + '/api/items', {'post': post});
        },

        publishDelete: function(id) {
            return $http.delete(options.api.base_url + '/api/item/' + id);
        }
    };
});


imobDbServices.factory('UserService', function($http) {
    return {
        logIn: function(username, password) {
            return $http.post(options.api.base_url + '/users/login', {username: username, password: password});
        },

        logOut: function() {
            return $http.get(options.api.base_url + '/users/logout');
        },

        signUp: function(username, password, passwordConfirmation) {
            return $http.post(options.api.base_url + '/users/create', {username: username, password: password, passwordConfirmation: passwordConfirmation });
        },

        getAll: function(username, password, passwordConfirmation) {
            return $http.get(options.api.base_url + '/users', {username: username, password: password, passwordConfirmation: passwordConfirmation });
        },

        get: function(username, password, passwordConfirmation) {
            return $http.get(options.api.base_url + '/users/' + user_id, {username: username, password: password, passwordConfirmation: passwordConfirmation });
        },

        getSettings: function(username, password, passwordConfirmation) {
            return $http.post(options.api.base_url + '/users/' + user_id + '/settings', {username: username, password: password, passwordConfirmation: passwordConfirmation });
        },

        saveSettings: function(username, password, passwordConfirmation) {
            return $http.post(options.api.base_url + '/users/' + user_id + '/settings', {username: username, password: password, passwordConfirmation: passwordConfirmation });
        },

        uploadProfilePic: function(username, password, passwordConfirmation) {
            return $http.post(options.api.base_url + '/users/profile_pic/upload', {username: username, password: password, passwordConfirmation: passwordConfirmation });
        },

        update: function(username, password, passwordConfirmation) {
            return $http.put(options.api.base_url + '/users/' + user_id, {username: username, password: password, passwordConfirmation: passwordConfirmation });
        },

        delete: function(username, password, passwordConfirmation) {
            return $http.delete(options.api.base_url + '/users/' + user_id, {username: username, password: password, passwordConfirmation: passwordConfirmation });
        },

    }
});

imobDbServices.factory('cepService', ['$rootScope', '$http', '$templateCache', function ($rootScope,$http, $templateCache){
    var server="https://viacep.com.br/ws/";
    var callback="/json?callback=JSON_CALLBACK";
    var method = "JSONP";
    return {
        get: function(cep){
            var dat;
            chrome.extension.getBackgroundPage().console.log("cep:"+cep);
            var url = server+cep+callback;
            return $http({method: method, url: url, cache: $templateCache}).
                success(function(data) {
                    chrome.extension.getBackgroundPage().console.log("1");
                    chrome.extension.getBackgroundPage().console.log(data);
                    return data;
                }).
                error(function(data) {
                    dat = data || "Status:" || status || " - Request failed";
                    alert("ERROR: Could not get data.");
                });
            chrome.extension.getBackgroundPage().console.log("2");
        }
    }
}]);


imobDbServices.factory('persistanceService', ['$q', function($q) {

	var setUp=false;
	var db;

	function init() {
		var deferred = $q.defer();

		if(setUp) {
			deferred.resolve(true);
			return deferred.promise;
		}

		var openRequest = window.indexedDB.open("imobapp-localdb",1);

		openRequest.onerror = function(e) {
			chrome.extension.getBackgroundPage().console.log("Erro ao abrir o banco de dados da aplicação!");
			console.dir(e);
			deferred.reject(e.toString());
		};

		openRequest.onupgradeneeded = function(e) {

			var thisDb = e.target.result;

			//Create Activity OS
			/*
			if(!thisDb.objectStoreNames.contains("atividades")) {
				osContratos = thisDb.createObjectStore("atividades", { keyPath: "id", autoIncrement:true });
				objectStore.createIndex("vencimento", "vencimento", { unique: false });
				objectStore.createIndex("descricao","descricao", { unique: false });
				objectStore.createIndex("contrato","contratos", { unique: false });
				objectStore.createIndex("status","status", { unique: false });
			}

			if(!thisDb.objectStoreNames.contains("contratos")) {
				osContratos = thisDb.createObjectStore("contratos", { keyPath: "id", autoIncrement:true });
				objectStore.createIndex("locador", "locadores", { unique: false });
				objectStore.createIndex("locatario", "locatarios", { unique: false });
				objectStore.createIndex("vigencia", "vigencia", { unique: false });
				objectStore.createIndex("status","status", { unique: false });
			}
			if(!thisDb.objectStoreNames.contains("cadastro")) {
				osLocador = thisDb.createObjectStore("cadastro", { keyPath: "cpf", autoIncrement:false });
				objectStore.createIndex("cpf", "cpf", { unique: true });
				objectStore.createIndex("rg", "rg", { unique: true });
				objectStore.createIndex("nomecompleto","nomecompleto", {unique:false});

			}
			if(!thisDb.objectStoreNames.contains("locadores")) {
				osLocador = thisDb.createObjectStore("locadores", { keyPath: "id", autoIncrement:true });
				objectStore.createIndex("locador", "cadastro", { unique: true });
			}

			*/
			if(!thisDb.objectStoreNames.contains("imoveis")) {
				osImoveis = thisDb.createObjectStore("imoveis", { keyPath: "id", autoIncrement:true });
				osImoveis.createIndex("dono", "locatarios", { multiEntry:true});
				osImoveis.createIndex("endereco", "enderecos", { unique: true });
			}
			if(!thisDb.objectStoreNames.contains("enderecos")) {
				osEnderecos = thisDb.createObjectStore("enderecos", { keyPath: "id", autoIncrement:true });
				osEnderecos.createIndex("endereco","tipo", {unique:false});
				osEnderecos.createIndex("endereco","rua", {unique:false});
				osEnderecos.createIndex("endereco","numero", {unique:false});
				osEnderecos.createIndex("endereco","complemento", {unique:false});
				osEnderecos.createIndex("endereco","bairro", {unique:false});
				osEnderecos.createIndex("endereco","cidade", {unique:false});
				osEnderecos.createIndex("endereco","estado", {unique:false});
				osEnderecos.createIndex("endereco","pais", {unique:false});
			}
			if(!thisDb.objectStoreNames.contains("locatarios")) {
				osLocatarios = thisDb.createObjectStore("locatarios", { keyPath: "id", autoIncrement:true });
				osLocatarios.createIndex("locatario", "cadastro", { unique: true });
			}

		};

		openRequest.onsuccess = function(e) {
			db = e.target.result;

			db.onerror = function(event) {
				// Generic error handler for all errors targeted at this database's
				// requests!
				deferred.reject("Database error: " + event.target.errorCode);
			};

			setUp=true;
			deferred.resolve(true);

		};

		return deferred.promise;
	}

	function isSupported() {
		return ("indexedDB" in window);
	}

	function ready() {
		return setUp;
	}

	function supportsIDB() {
		return "indexedDB" in window;
	}

	function removeImovel(key) {
		var deferred = $q.defer();
		var t = db.transaction(["imoveis"], "readwrite");
		var request = t.objectStore("imoveis").delete(key);
		t.oncomplete = function(event) {
			deferred.resolve();
		};
		return deferred.promise;
	}

	function buscaImovel(key) {
		var deferred = $q.defer();

		var transaction = db.transaction(["imoveis"]);
		var objectStore = transaction.objectStore("imoveis");
		var request = objectStore.get(key);

		request.onsuccess = function(event) {
			var imovelModel = request.result;
			deferred.resolve(imovelModel);
		};

		return deferred.promise;
	}

	function buscaImoveis() {
		var deferred = $q.defer();

		init().then(function() {

			var result = [];

			var handleResult = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					result.push({key:cursor.key, title:cursor.value.vencimento, updated:cursor.value.updated});
					result.push({key:cursor.key, title:cursor.value.descricao, updated:cursor.value.updated});
					result.push({key:cursor.key, title:cursor.value.contrato, updated:cursor.value.updated});
					result.push({key:cursor.key, title:cursor.value.status, updated:cursor.value.updated});
					cursor.continue();
				}
			};

			var transaction = db.transaction(["imoveis"], "readonly");
			var objectStore = transaction.objectStore("imoveis");
			objectStore.openCursor().onsuccess = handleResult;

			transaction.oncomplete = function(event) {
				deferred.resolve(result);
			};
		});
		return deferred.promise;
	}

	function guardaImovel(imovelModel) {
		//Should this call init() too? maybe
		var deferred = $q.defer();

		if(!imovelModel.id) imovelModel.id = "";

		var vencimento = imovelModel.vencimento;
		var descricao = imovelModel.descricao;
		var contrato = imovelModel.contrato;
		var status = imovelModel.status.toLowerCase();

		var t = db.transaction(["imoveis"], "readwrite");

		if(imovelModel.id === "") {
		    t.objectStore("imoveis")
				    .add({title:imovelModel.title,body:imovelModel.body,updated:new Date().getTime(),vencimento:new Date(vencimento),descricao:descricao,contrato:contrato,status:status});
		} else {
		    t.objectStore("imoveis")
				    .put({title:vencimento.title,body:imovelModel.body,updated:new Date(),id:Number(imovelModel.id),vencimento:new Date(vencimento),descricao:descricao,contrato:contrato,status:status});
		}

		t.oncomplete = function(event) {
			deferred.resolve();
		};

		return deferred.promise;
	}

	return {
		isSupported:isSupported,
		removeImovel:removeImovel,
		buscaImovel:buscaImovel,
		buscaImoveis:buscaImoveis,
		ready:ready,
		guardaImovel:guardaImovel,
		supportsIDB:supportsIDB
	};

}]);
