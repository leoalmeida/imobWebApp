/* global angular */

'use strict';

var myVersion = 7;
var key = {
			backspace: 8,
			enter: 13,
			escape: 27,
			left: 37,
			up: 38,
			right: 39,
			down: 40,
			comma: 188
		};
var OBJECT_STORE_CLIENTES = 'cliente';
var OBJECT_STORE_EVENTOS = 'evento';
var OBJECT_STORE_IMOVEIS = 'imovel';
var OBJECT_STORE_REF = 'form_ref';
var OBJECT_STORE_CONTRATOS = 'contrato';
var OBJECT_STORE_DOCUMENTOS = 'documento';
var OBJECT_STORE_REFTYPES = 'tipoReferencia';
var REFTYPES_DOC = "doc";
var REFTYPES_TAXA = "taxa";
var REFTYPES_CLI = "cliente";
var REFTYPES_TEL = "telefone";
var REFTYPES_END = "endereco";
var REFTYPES_IMV = "imovel";
var REFTYPES_SITIMV = "situacaoimovel";
var REFTYPES_SIT = "situacao";
var REFTYPES_PROP = "proprietarios";
var REFTYPES_CONT = "contrato";
var REFTYPES_EVT = "evento";

var TaxaSchema = function() {
  this.canTalk = true;
  this.greet = function() {
    if (this.canTalk) {
      chrome.extension.getBackgroundPage().console.log('Hi, I\'m ' + this.name);
    }
  };
};

var TaxaSchema = (function () {

    // private static
    var nextId = 1;
    var valorTotal = 0.00;

    // constructor
    var taxa = function () {
              // private
              this.id = nextId++;
              this.tipo = 'Condominio';
              this.valor = 0;
              this.pagamento = Date.now();
    };

    taxa.prototype.getTipo = function() {
        return this.tipo;
    }

    taxa.prototype.setTipo = function(value) {
        this.tipo = value;
    }

    taxa.prototype.getPagamento = function() {
        return this.pagamento;
    }

    taxa.prototype.setPagamento = function(value) {
        this.pagamento = value;
    }

    taxa.prototype.getValor = function() {
        return this.valor;
    };

    taxa.prototype.setValor = function(value) {
        this.valor = value;
    };

    // public static
    taxa.get_nextId = function () {
        return nextId;
    };

    taxa.get_valorTotal = function (lista) {
        valorTotal = 0.00;
        for ( var item in lista )(
          valorTotal += lista[item].valor
        );
        return valorTotal;
    };

    // public (shared across instances)
    taxa.prototype = {

    };

    return taxa;
})();

imobDbControllers.config(function ($indexedDBProvider) {
	$indexedDBProvider
      .connection('imobapp-localdb')
      .upgradeDatabase(7, function(event, db, tx){

          var osContratos = db.createObjectStore(OBJECT_STORE_CONTRATOS, { keyPath: "id", autoIncrement:true });
          osContratos.createIndex("cpfLocador_idx", "cpfLocador", { unique: false , multientry: true });
          osContratos.createIndex("lastsyncdate_idx", "lastsyncdate", { unique: false });

          var osImoveis = db.createObjectStore(OBJECT_STORE_IMOVEIS, { keyPath: "id", autoIncrement:true });
          osImoveis.createIndex("cpfLocador_idx", "cpfLocador", { unique: false});
          osImoveis.createIndex("cpfLocatario_idx", "cpfLocatario", { unique: false });
          osImoveis.createIndex("bairro_idx","bairro", 	{unique:false});
          osImoveis.createIndex("lastsyncdate_idx", "lastsyncdate", { unique: false });

          var osLocatarios = db.createObjectStore(OBJECT_STORE_CLIENTES, { keyPath: "cpf"});
          osLocatarios.createIndex("cpf_idx", "cpfCliente", { unique: false });
          osLocatarios.createIndex("tipo_idx", "tipo", { unique: false, multientry: true });
          osLocatarios.createIndex("doc_idx", "docs", { unique: false, multientry: true });
          osLocatarios.createIndex("lastsyncdate_idx", "lastsyncdate", { unique: false });

          var osEventos = db.createObjectStore(OBJECT_STORE_EVENTOS, { keyPath: "id", autoIncrement:true });
          osEventos.createIndex("idContrato_idx", "idContrato", { unique: false });
          osEventos.createIndex("tipoEvento_idx", "tipoEvento", { unique: false });
          osEventos.createIndex("acaoEvento_idx", "acaoEvento", { unique: false });
          osEventos.createIndex("lastsyncdate_idx", "lastsyncdate", { unique: false });

      })
      .upgradeDatabase(8, function(event, db, tx){
          var osReferencias = db.createObjectStore(OBJECT_STORE_REFTYPES, { keyPath: "id", autoIncrement:true });
          osReferencias.createIndex("reftype_idx", "tipo", { unique: false });
      });
});

function onError(e) {
  console.log(e);
}

imobDbControllers.controller('AdminUserCtrl', ['$scope', '$log', '$rootScope', '$routeParams', '$location', '$http', 'gdocs',
		function($scope, $log, $rootScope, $routeParams, $location, $http,  gdocs) {


  // Toggles the authorization state.
  $scope.toggleAuth = function(interactive) {
    if (!gdocs.accessToken) {
      gdocs.auth(interactive, function() {
          $location.path("/home").replace();
      });
    } else {
      gdocs.revokeAuthToken(function() {
          $location.path("/login").replace();
      });

    }
  }
  // Controls the label of the authorize/deauthorize button.
  $scope.authButtonLabel = function() {
    if (gdocs.accessToken)
      return 'Deauthorize';
    else
      return 'Google Login >>';
  };

  $scope.toggleAuth(false);

}]);
imobDbControllers.controller('BibliotecaCtrl', ['$scope', '$http', '$indexedDB', 'gdocs',
		function($scope, $http,  $indexedDB,  gdocs) {

  $scope.docs = [];
  $scope.foldertype = gdocs.FOLDERTYPE;
  $scope.rootFolder =
  			$scope.actualFolder =
  			$scope.previousFolder = gdocs.ROOTFLD;

	$scope.checkAll = function () {
		$scope.selectedDocTypes = _.pluck($scope.tipoDocList, 'tipo');
	};

  // Response handler that caches file icons in the filesystem API.
  function successCallbackWithFsCaching(resp, status, headers, config) {
    var docs = [];

    var totalEntries = resp.items.length;

    resp.items.forEach(function(entry, i) {
      var doc = {
        id: entry.id,
        title: entry.title,
        mimeType: entry.mimeType,
        updatedDate: Util.formatDate(entry.modifiedDate),
        updatedDateFull: entry.modifiedDate,
        icon: entry.iconLink,
        alternateLink: entry.alternateLink,
        size: entry.fileSize ? '( ' + entry.fileSize + ' bytes)' : null
      };

      // 'http://gstatic.google.com/doc_icon_128.png' -> 'doc_icon_128.png'
      doc.iconFilename = doc.icon.substring(doc.icon.lastIndexOf('/') + 1);

      // If file exists, it we'll get back a FileEntry for the filesystem URL.
      // Otherwise, the error callback will fire and we need to XHR it in and
      // write it to the FS.
      var fsURL = fs.root.toURL() + FOLDERNAME + '/' + doc.iconFilename;
      window.webkitResolveLocalFileSystemURL(fsURL, function(entry) {
        console.log('Fetched icon from the FS cache');

        doc.icon = entry.toURL(); // should be === to fsURL, but whatevs.

        $scope.docs.push(doc);

        // Only want to sort and call $apply() when we have all entries.
        if (totalEntries - 1 == i) {
          $scope.docs.sort(Util.sortByDate);
          $scope.$apply(function($scope) {}); // Inform angular we made changes.
        }
      }, function(e) {

        $http.get(doc.icon, {responseType: 'blob'}).success(function(blob) {
          console.log('Fetched icon via XHR');

          blob.name = doc.iconFilename; // Add icon filename to blob.

          writeFile(blob); // Write is async, but that's ok.

          doc.icon = window.URL.createObjectURL(blob);

          $scope.docs.push(doc);
          if (totalEntries - 1 == i) {
            $scope.docs.sort(Util.sortByDate);
          }
        });

      });
    });
  }

  $scope.clearDocs = function() {
    $scope.docs = []; // Clear out old results.
  };

  $scope.fetchDocs = function(retry,folder) {

    $scope.previousFolder = $scope.actualFolder;
    $scope.actualFolder = folder;

    this.clearDocs();

    if (gdocs.accessToken) {
      var config = {
        params: {
        	'alt': 'json',
        	'q': "'"+ folder.id +"' in parents"
        },
        headers: {
          'Authorization': 'Bearer ' + gdocs.accessToken
        }
      };

      $http.get(gdocs.DOCLIST_FEED, config).
        success(successCallbackWithFsCaching).
        error(function(data, status, headers, config) {
          if (status == 401 && retry) {
            gdocs.removeCachedAuthToken(
                gdocs.auth.bind(gdocs, true,
                    $scope.fetchDocs.bind($scope, false)));
          }
        });
    }
  };

  // Toggles the authorization state.
  $scope.toggleAuth = function(interactive) {
    if (!gdocs.accessToken) {
      gdocs.auth(interactive, function() {
        $scope.fetchDocs(false,gdocs.ROOTFLD);
      });
    } else {
      gdocs.revokeAuthToken(function() {});
      this.clearDocs();
    }
  }

  // Controls the label of the authorize/deauthorize button.
  $scope.authButtonLabel = function() {
    if (gdocs.accessToken)
      return 'Deauthorize';
    else
      return 'Authorize';
  };

  $scope.toggleAuth(false);

}]);




imobDbControllers.controller('HomeCtrl', ['$scope', '$indexedDB', 'PostService','FileReader',
		function($scope,  $indexedDB,  PostService, FileReader) {

  $scope.setMaster = function(section) {
	    $scope.selected = section;
	};

	if($indexedDB.onDatabaseError) {
		$location.path('/unsupported');
	} else {
	    init();
		  buscaClientes();
		  buscaEventos();
	}

	function init(){
      FileReader.readAsJson('data/configFile.json', $scope)
            .then(function(result) {
                $indexedDB.openStore(OBJECT_STORE_REFTYPES, function (store){
                    store.upsert(result.data);
                });
            });
	 	};

  function buscaClientes() {
    $indexedDB.openStore(OBJECT_STORE_CLIENTES, function (store){
	    store.getAll().then(function(clientesList) {
        // Update scope
        $scope.listViewClientes = clientesList;
      });
    });
	};

  function buscaEventos() {
    $indexedDB.openStore(OBJECT_STORE_EVENTOS, function (store){
	    store.getAll().then(function(eventosList) {
        // Update scope
        $scope.listViewEventos = eventosList;
      });
    });
	};

	function enviaDocumentos() {
	      $indexedDB.openStore(OBJECT_STORE_DOCUMENTS, function (store){
            store.getAll().then(function(itemsList) {
                var objtype = "docs";
                var objtags = "Documentos";

                $scope.msgInformativa = options.api.msgs.syncing;
                $scope.showDetalhes = false;

                var publishItem = {
                        type: objtype,
                        subtype: value.tipo,
                        title: value.titulo,
                        tags: objtags,
                        is_published: true,
                        content: JSON.stringify(value)
                };

                PostService.publishdocs(publishItem).success(function(data) {
                    chrome.extension.getBackgroundPage().console.log(data.status);
                    chrome.extension.getBackgroundPage().console.log(data.statusMessage);
                    chrome.extension.getBackgroundPage().console.log(data.content);
                    $scope.syncedItems
                    $scope.syncedItems.push(data.content);
                    $scope.syncedQtd++;
                    $scope.percDone = 100*$scope.syncedQtd/$scope.syncSize;
                    if ($scope.percDone == 100) {
                        $scope.msgInformativa = options.api.msgs.finalsync;
                    }
                }).error(function(status, data) {
                    chrome.extension.getBackgroundPage().console.log(status);
                    chrome.extension.getBackgroundPage().console.log(data);
                });
            });
            chrome.extension.getBackgroundPage().console.log(status);
            chrome.extension.getBackgroundPage().console.log("Documento enviado");
        });
  };

}]);

imobDbControllers.controller('ClientesCtrl', ['$scope', '$indexedDB', '$log',
		function($scope,  $indexedDB, $log) {

	$scope.objects = [];
	$scope.entidade = "Clientes";
	$scope.formatosSelecionados = [];
	$scope.setSelectedDocTypes = function () {
		var tipo = this.tipoDoc.tipo;
		if (_.contains($scope.formatosSelecionados, tipo)) {
		    $scope.formatosSelecionados = _.without($scope.formatosSelecionados, tipo);
		} else {
		    $scope.formatosSelecionados.push(tipo);
		}
		return false;
	};
	$scope.isChecked = function (id) {
		if (_.contains($scope.formatosSelecionados, id)) {
		    return 'fa fa-check pull-right';
		}
		return false;
	};
	$scope.checkAll = function () {
		$scope.formatosSelecionados = _.pluck($scope.tipoDocList, 'tipo');
	};
	$scope.setMaster = function(section) {
	    $scope.selected = section;
	};
	$scope.isSelected = function(section) {
	    return $scope.selected === section;
	};
	$scope.removeCliente = function(key) {
		$indexedDB.openStore(OBJECT_STORE_CLIENTES, function (store){
						store.delete(key).then(function(e){
								$log.info('Cliente' + key + 'removed at:' + new Date());
								$location.path("./cadastro/clientes").replace();
						});
		});
	};

	if($indexedDB.onDatabaseError) {
		$location.path('/unsupported');
	} else {
		buscaClientes();
		buscaRefTypes();
	}

	function buscaRefTypes() {
	  $indexedDB.openStore(OBJECT_STORE_REFTYPES, function (store){
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_DOC)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  //tipoDoc = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
      }, 'readonly').then(null, function(error) {
        chrome.extension.getBackgroundPage().console.log(error);
      });
  };

  function buscaClientes() {
    $indexedDB.openStore(OBJECT_STORE_CLIENTES, function (store){
	    store.getAll().then(function(clientesList) {
			  $scope.listView = clientesList;
			});
		});
	}

	/*
	function buscaDocumentos() {
	    refObjectStore.getAll().then(function(docList) {
          // Create the mock file:
          var mockFile = { name: "Filename", size: 12345 };

          // Call the default addedfile event handler
          Dropzone.options.uploadSection.emit("addedfile", mockFile);

          // And optionally show the thumbnail of the file:
           Dropzone.options.uploadSection.emit("thumbnail", mockFile, "/image/url");

          // Make sure that there is no progress bar, etc...
           Dropzone.options.uploadSection.emit("complete", mockFile);

          // If you use the maxFiles option, make sure you adjust it to the
          // correct amount:
          var existingFileCount = 1; // The number of files already uploaded
           Dropzone.options.uploadSection.options.maxFiles = myDropzone.options.maxFiles - existingFileCount;
      });
	}*/

}]);

imobDbControllers.controller('ClientesEditCtrl', ['$scope', '$log', '$rootScope', '$routeParams', '$location',  '$indexedDB', '$filter', 'cepService',
		function($scope, $log, $rootScope, $routeParams, $location, $indexedDB, $filter, cepService) {

	if ($routeParams.type === "edit") {$scope.entidade = "Alterar Cliente";}
	else {$scope.entidade = "Incluir Cliente";}


	$scope.novocliente = {};
	$scope.endereco = {};
	$scope.telefone = {};
	$scope.documentos = [];
	$scope.selectedDoc = {};
	$scope.novocliente.tipoCliente = [];
	$scope.novocliente.enderecos = [];
	$scope.novocliente.telefones = [];
	$scope.selectedDoc.name = "Teste Selected";
	$scope.selectedDoc.tags = [];
	$scope.novocliente.documentos = [];

	$scope.incluirEndereco = function(){
      $scope.novocliente.enderecos.push($scope.endereco);
      $scope.endereco = {};
	};
	$scope.removeEndereco = function(index){
		  $scope.novocliente.enderecos.splice(index, 1);
	};
	$scope.incluirTelefone = function(){
	    if ($scope.telefone.numero !== '' && $scope.telefone.tipo !== ''){
          $scope.novocliente.telefones.push($scope.telefone);
          $scope.telefone = {};
      }
	};
	$scope.removeTelefone = function(index){
	    $scope.novocliente.telefones.splice(index, 1);
	};
	$scope.incluirTag = function(){
	    if ($scope.tag !== ''){
          $scope.selectedDoc.tags.user.push($scope.tag);
          $scope.tag = '';
          $('#tag').focus();
      }
	};
	$scope.removeTag = function(index){
	    $scope.selectedDoc.tags.user.splice(index, 1);
	};
	$scope.selectDoc = function(index){
	    $scope.selectedDoc = $scope.document;
	};
	$scope.enterKey = function(keyEvent) {
    if (keyEvent.which === 13)
        $scope.incluirTag();
  }
	$scope.cancel = function() {
      //TODO
	};
	$scope.getCEP = function(){
	    var teste = cepService.get($scope.endereco.cep).then(function(response) {
	        $scope.endereco.rua = response.data.logradouro;
          $scope.endereco.bairro = response.data.bairro;
          $scope.endereco.cidade = response.data.localidade;
          $scope.endereco.uf = response.data.uf;
          $scope.endereco.pais = "Brasil"
      });
 	};
	$scope.submit = function() {
      $scope.novocliente.updated = $filter('dateFormat')(new Date(),false);
      if ($routeParams.type !== "edit"){
          $scope.novocliente.created = $filter('dateFormat')(new Date(),false);
          $scope.novocliente.synced = null;
      }
      $indexedDB.openStore(OBJECT_STORE_CLIENTES, function (store){
              store.upsert($scope.novocliente).then(function(e){
                    $log.info('Cliente' + $scope.novocliente.nome + 'included with CPF:'+  $scope.novocliente.cpf +  ' at:' + new Date());
                    $location.path("/cadastro/clientes").replace();
              });
      });
	};

	if($indexedDB.onDatabaseError) {
		  $location.path('/unsupported');
	} else {
      buscaInfo();
      buscaRefTypes();
	}

	$('#fileModal').on('show.bs.modal', function (event) {
      $scope.selectedDoc = $(event.relatedTarget)[0];
      $scope.$apply();
  })

	function buscaRefTypes() {
	    $indexedDB.openStore(OBJECT_STORE_REFTYPES, function (store){
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_CLI)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposClientes = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_TEL)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposTelefones = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_END)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposEnderecos = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_IMV)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposImoveis = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
      }, 'readonly').then(null, function(error) {
        chrome.extension.getBackgroundPage().console.log(error);
      });
  };

	function buscaInfo() {
		if($routeParams.id) {
          $indexedDB.openStore(OBJECT_STORE_CLIENTES, function (store){
              store.findWhere(store.query().$eq($routeParams.id)).then(function(cliente) {
                  if (imovel.length === 0) {
                      chrome.extension.getBackgroundPage().console.log('No objects found');
                  } else {
                      $scope.novocliente = cliente.value;
                  }
              }, 'readonly').then(null, function(error) {
                  chrome.extension.getBackgroundPage().console.log(error);
              });
          });
    }
	}
}]);

imobDbControllers.controller('ImoveisCtrl', ['$scope', '$indexedDB',
		function($scope,  $indexedDB) {

	$scope.objects = [];
	$scope.entidade = "Imóveis";
	$scope.formatosSelecionados = [];

	$scope.setSelectedDocTypes = function () {
		var tipo = this.tipoDoc.tipo;
		if (_.contains($scope.formatosSelecionados, tipo)) {
		    $scope.formatosSelecionados = _.without($scope.formatosSelecionados, tipo);
		} else {
		    $scope.formatosSelecionados.push(tipo);
		}
		return false;
	};
	$scope.isChecked = function (id) {
		if (_.contains($scope.formatosSelecionados, id)) {
		    return 'fa fa-check pull-right';
		}
		return false;
	};
	$scope.checkAll = function () {
		$scope.formatosSelecionados = _.pluck($scope.tipoDocList, 'tipo');
	};
	$scope.setMaster = function(section) {
	    $scope.selected = section;
	};
	$scope.isSelected = function(section) {
	    return $scope.selected === section;
	};
	$scope.removeImovel = function(key) {
		imoveisObjectStore.delete(key).then(function() {
			buscaImoveis();
		});
	};

	if($indexedDB.onDatabaseError) {
		$location.path('/unsupported');
	} else {
		buscaImoveis();
	}

	function buscaImoveis() {
    $indexedDB.openStore(OBJECT_STORE_IMOVEIS, function (store){
		      store.getAll().then(function(imoveisList) {
		          $scope.listView = imoveisList;
          }, 'readonly').then(null, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
    });
	}

}]);

imobDbControllers.controller('ImoveisEditCtrl', ['$scope', '$log', '$rootScope', '$routeParams', '$location',  '$indexedDB', '$filter','cepService',
    function($scope, $log, $rootScope, $routeParams, $location, $indexedDB, $filter, cepService) {

    if ($routeParams.type === "edit") {$scope.entidade = "Alterar Imóvel";}
    else {$scope.entidade = "Incluir Imóvel";}

    $scope.novoimovel = {};
    $scope.novoimovel.proprietarios = [];
    $scope.novoimovel.documentos = [];
    $scope.proprietario = {};

    $scope.today= function() {
        $scope.dt = new Date();
    };
    $scope.today();
    $scope.incluirProprietario = function(){
        if ($scope.proprietario.identificador !== ''){
            $scope.novoimovel.proprietarios.push($scope.proprietario.obj);
            $scope.proprietario = {};
        }
    };
    $scope.removeProprietario = function(index){
        $scope.novoimovel.proprietarios.splice(index, 1);
    };
    $scope.getCEP = function(){
	  //if($scope.endereco.cep) return '';
	    var teste = cepService.get($scope.novoimovel.endereco.cep).then(function(response) {
	        $scope.novoimovel.endereco.rua = response.data.logradouro;
          $scope.novoimovel.endereco.bairro = response.data.bairro;
          $scope.novoimovel.endereco.cidade = response.data.localidade;
          $scope.novoimovel.endereco.uf = response.data.uf;
          $scope.novoimovel.endereco.pais = "Brasil"
      });
    };
    $scope.cancel = function() {
        //TODO
    };
    $scope.submit = function() {
        $scope.novoimovel.updated = $filter('dateFormat')(new Date(),false);
        if ($routeParams.type !== "edit"){
            $scope.novoimovel.created = $filter('dateFormat')(new Date(),false);
            $scope.novoimovel.synced = null;
        }
        $indexedDB.openStore(OBJECT_STORE_IMOVEIS, function (store){
            store.upsert($scope.novoimovel).then(function(e){
                 $log.info('Evento' + $scope.novoimovel.id + 'incluído em:'+  $scope.novoimovel.updated +  ' at:' + new Date());
                 $location.path('/cadastro/imoveis').replace();
            });
        });

    };

    if($indexedDB.onDatabaseError) {
      $location.path('/unsupported');
    } else {
      buscaRefTypes();
      buscaInfo();
      buscarClientes();
    }

    function buscaRefTypes() {
        $indexedDB.openStore(OBJECT_STORE_REFTYPES, function (store){
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_IMV)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposImoveis = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_SITIMV)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposSituacao = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_PROP)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposProprietarios = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
        });
    }

    function buscarClientes(){
          $indexedDB.openStore(OBJECT_STORE_CLIENTES, function (store){
              store.getAll().then(function(itemsList) {
                  $scope.itemsList = itemsList;
              }, 'readonly').then(null, function(error) {
                chrome.extension.getBackgroundPage().console.log(error);
              });
          });
    }

    function buscaInfo() {
        if($routeParams.id) {
          $indexedDB.openStore(OBJECT_STORE_IMOVEIS, function (store){
              store.findWhere(store.query().$eq($routeParams.id)).then(function(imovel) {
                  if (imovel.length === 0) {
                        chrome.extension.getBackgroundPage().console.log('No objects found');
                  } else {
                        $scope.novoimovel.id = imovel.value.id;
                        $scope.novoimovel.descricao = imovel.value.descricao;
                        $scope.novoimovel.titulo = imovel.value.titulo;
                        $scope.novoimovel.proprietarios = imovel.value.proprietarios;
                        $scope.novoimovel.tipoImovel = imovel.value.tipoImovel;
                        $scope.novoimovel.tipoSituacao = imovel.value.tipoSituacao;
                        $scope.novoimovel.endereco = imovel.value.endereco;
                        $scope.novoimovel.documentos = imovel.value.documentos;
                  };
              }, function(error) {
                chrome.extension.getBackgroundPage().console.log(error);
              });
          });
        }
    }
}]);

imobDbControllers.controller('ContratosCtrl', ['$scope', '$indexedDB',
		function($scope,  $indexedDB) {

	$scope.objects = [];
	$scope.entidade = "Contratos";
	$scope.formatosSelecionados = [];

	$scope.setSelectedDocTypes = function () {
		var tipo = this.tipoDoc.tipo;
		if (_.contains($scope.formatosSelecionados, tipo)) {
		    $scope.formatosSelecionados = _.without($scope.formatosSelecionados, tipo);
		} else {
		    $scope.formatosSelecionados.push(tipo);
		}
		return false;
	};
	$scope.isChecked = function (id) {
		if (_.contains($scope.formatosSelecionados, id)) {
		    return 'fa fa-check pull-right';
		}
		return false;
	};
	$scope.checkAll = function () {
		$scope.formatosSelecionados = _.pluck($scope.tipoDocList, 'tipo');
	};
	$scope.setMaster = function(section) {
	    $scope.selected = section;
	};
	$scope.isSelected = function(section) {
	    return $scope.selected === section;
	};
	$scope.removeContrato = function(key) {
		contratosObjectStore.delete(key).then(function() {
			buscaContratos();
		});
	};

	if($indexedDB.onDatabaseError) {
		$location.path('/unsupported');
	} else {
		buscaContratos();
	}

  function buscaContratos() {
        $indexedDB.openStore(OBJECT_STORE_CONTRATOS, function (store){
              store.getAll().then(function(contratosList) {
                  $scope.listView = contratosList;
              }, 'readonly').then(null, function(error) {
                chrome.extension.getBackgroundPage().console.log(error);
              });
        });
	};
}]);

imobDbControllers.controller('ContratosEditCtrl', ['$scope', '$log', '$rootScope', '$routeParams', '$location',  '$indexedDB', '$filter',
    function($scope, $log, $rootScope, $routeParams, $location, $indexedDB, $filter) {

    if ($routeParams.type === "edit") {$scope.entidade = "Alterar Contrato";}
    else {$scope.entidade = "Incluir Contrato";}

    $scope.novocontrato = {};
    $scope.locatario = {};
    $scope.fiador = {};
    $scope.imovel = {};
    $scope.novocontrato.imovel = {};
    $scope.novocontrato.locatarios = [];
    $scope.novocontrato.fiadores = [];
    $scope.novocontrato.situacao = "ativo";


    $scope.today= function() {
        $scope.dt = new Date();
    };
    $scope.today();
    $scope.clear = function () {
        $scope.dt = null;
    };
    $scope.dateOptions = {
        formatDay: 'dd',
        formatMonth: 'MM',
        formatYear: 'yyyy',
        startingDay: 1
    };
    $scope.incluirLocatario = function(){
        if ($scope.locatario !== ''){
            $scope.novocontrato.locatarios.push($scope.locatario.obj);
            $scope.locatario = {};
        }
    };
    $scope.removeLocatario = function(index){
        $scope.novocontrato.locatarios.splice(index, 1);
    };
    $scope.incluirFiador = function(){
        if ($scope.fiador !== ''){
            $scope.novocontrato.fiadores.push($scope.fiador.obj);
            $scope.fiador = {};
        }
    };
    $scope.removeFiador = function(index){
        $scope.novocontrato.fiadores.splice(index, 1);
    };
    $scope.cancel = function() {
        //TODO
    };
    $scope.submit = function() {

        $scope.novocontrato.updated = $filter('dateFormat')(new Date(),false);

        if ($routeParams.type !== "edit"){
            $scope.novocontrato.created = $filter('dateFormat')(new Date(),false);
            $scope.novocontrato.synced = null;
        }

        $scope.novocontrato.situacao = "pendente";

        $scope.novocontrato.dataInicio = $filter('dateFormat')($scope.novocontrato.updated, true);
        $scope.novocontrato.dataVencimento = $filter('dateFormat')($scope.picker, true);

        $scope.novocontrato.imovel = $scope.imovel.obj;

        //alert($filter('json')($scope.novocontrato));

        $indexedDB.openStore(OBJECT_STORE_CONTRATOS, function (store){
              store.upsert($scope.novocontrato)
              .then(function(e){
                   $log.info('Evento' + $scope.novocontrato.id + 'incluído com vencimento em:'+  $scope.novocontrato.dataVencimento +  ' at:' + new Date());
                   $location.path('/cadastro/contratos').replace();
              });
        });

    };

    function buscaRefTypes() {
      $indexedDB.openStore(OBJECT_STORE_REFTYPES, function (store){
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_SIT)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposSituacao = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_CONT)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposContrato = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
      });
    }

    function buscarClientes(){
        $indexedDB.openStore(OBJECT_STORE_CLIENTES, function (store){
              store.getAll().then(function(itemsList) {
                  $scope.clientesList = itemsList;
              }, 'readonly').then(null, function(error) {
                chrome.extension.getBackgroundPage().console.log(error);
              });
        });
    }

    function buscarImoveis(){
        $indexedDB.openStore(OBJECT_STORE_IMOVEIS, function (store){
              store.getAll().then(function(itemsList) {
                  $scope.imoveisList = itemsList;
              }, 'readonly').then(null, function(error) {
                chrome.extension.getBackgroundPage().console.log(error);
              });
        });
    }

    function buscaInfo() {
        if($routeParams.id) {
          //var myQuery = $indexedDB.queryBuilder().$eq(Number($routeParams.id)).$asc().compile();
          $indexedDB.openStore(OBJECT_STORE_CONTRATOS, function (store){
              store.findWhere(store.query().$eq($routeParams.id)).then(function(contrato) {
                  if (contrato.length === 0) {
                        chrome.extension.getBackgroundPage().console.log('No objects found');
                  } else {
                        $scope.novocontrato.id = contrato.value.id;
                        $scope.novocontrato.dataInicio = contrato.value.dataInicio;
                        $scope.novocontrato.dataVencimento = contrato.value.dataVencimento;
                        $scope.novocontrato.imovel = contrato.value.imovel;
                        $scope.novocontrato.fiadores = contrato.value.fiadores;
                        $scope.novocontrato.locadores = contrato.value.locadores;
                        $scope.novocontrato.locatarios = contrato.value.locatarios;
                        $scope.novocontrato.situacao = contrato.value.situacao;
                        $scope.novocontrato.tipoContrato = contrato.value.tipoContrato
                        $scope.novocontrato.documentos = contrato.value.documentos;
                  };
              }, function(error) {
                chrome.extension.getBackgroundPage().console.log(error);
              });
          });
        }
    }

    if($indexedDB.onDatabaseError) {
      $location.path('/unsupported');
    } else {
      buscaRefTypes();
      buscaInfo();
      buscarClientes();
      buscarImoveis();
    }

}]);

imobDbControllers.controller('EventosCtrl', ['$scope', '$indexedDB',
		function($scope,  $indexedDB) {

	$scope.entidade = "Eventos";

	$scope.setMaster = function(section) {
	    $scope.selected = section;
	};
	$scope.isSelected = function(section) {
	    return $scope.selected === section;
	};
  $scope.criaPDF = function() {
     var pdf = new jsPDF();
     var string = $('.modal-body')[0].innerText.split('\n');
     var i = 1;
     for (var index in string){

         if ((index == 21)) continue;
         else if ((index == 0) || (index > 21) || (string[index]=="")) {
             pdf.text(10, 10 * i++,string[index]);
         }else if ((index%2) || (index == 20) ){
             var str = string[index] + string[++index];
             pdf.text(10, 10 * i++,str);
         };
     }
     string= pdf.output();
     document.location.href = 'data:application/pdf;base64,base64encodedpdf' + Base64.encode(string);
  };

  //Modal controls
  /*$scope.animationsEnabled = true;

  $scope.open = function(size) {

  }
		*/
	$scope.removeEvento = function(key) {
      $indexedDB.openStore(OBJECT_STORE_EVENTOS, function (store){
        store.delete(key).then(function() {
            buscaEventos();
        });
      });
	};

	if($indexedDB.onDatabaseError) {
		  $location.path('/unsupported');
	} else {
		  buscaEventos();
	};

	function buscaEventos() {
      $indexedDB.openStore(OBJECT_STORE_EVENTOS, function (store){
        store.getAll().then(function(eventosList) {
             $scope.listView = eventosList;
        });
      });
  };

}]);

imobDbControllers.controller('EventosEditCtrl', ['$scope', '$modal', '$log', '$rootScope', '$routeParams', '$location',  '$indexedDB', '$filter',
    function($scope, $modal, $log, $rootScope, $routeParams, $location, $indexedDB, $filter) {

    if ($routeParams.type === "edit") {$scope.entidade = "Alterar Evento";}
    else {$scope.entidade = "Incluir Evento";}

    $scope.itemsList = [];
    $scope.tiposTaxa = [];
    $scope.novoevento = {};
    $scope.novoevento.situacao = "ativo";
    $scope.novoevento.tipo = 'pagamento';
    $scope.novoevento.cobranca = 0;
    $scope.novoevento.comissao = 0;
    $scope.novoevento.deposito = 0;
    $scope.novoevento.aluguel = 0;
    $scope.novoevento.listaTaxas = [];
    $scope.novoevento.listaTaxas.push(new TaxaSchema());
    $scope.novoevento.totaltaxas = 0;

    $scope.atualizaValores = function() {
        $scope.novoevento.totaltaxas = TaxaSchema.get_valorTotal($scope.novoevento.listaTaxas);
        $scope.novoevento.cobranca = $scope.novoevento.aluguel + $scope.novoevento.totaltaxas;
        $scope.novoevento.comissao = $scope.novoevento.cobranca * 0.08;
        $scope.novoevento.deposito =  $scope.novoevento.cobranca - $scope.novoevento.totaltaxas - $scope.novoevento.comissao;
    };
    $scope.incluirTaxa = function(){
      $scope.novoevento.listaTaxas.push(new TaxaSchema());
    };
    $scope.removerTaxa = function(key){
      $scope.novoevento.listaTaxas.splice(key,1);
    };
    $scope.cancel = function() {
        //TODO
    };
    $scope.submit = function() {
        $scope.novoevento.updated = $filter('dateFormat')(new Date(),false);

        if ($routeParams.type !== "edit"){
            $scope.novoevento.created = $filter('dateFormat')(new Date(),false);
            $scope.novoevento.synced = null;
        }
        var dtAvencer = new Date();
        dtAvencer.setDate(dtAvencer + 7);

        if ($scope.picker < $scope.novoevento.updated) {$scope.novoevento.situacao = "vencido";}
        else if ($scope.picker < dtAvencer) {$scope.novoevento.situacao = "avencer";}
        else {$scope.novoevento.situacao = "ativo";}

        $scope.novoevento.dataInicio = $filter('dateFormat')($scope.novoevento.updated, true);
        $scope.novoevento.dataVencimento = $filter('dateFormat')($scope.picker, true);

        $indexedDB.openStore(OBJECT_STORE_EVENTOS, function (store){
          store.upsert($scope.novoevento)
                  .then(function(e){
                       $log.info('Evento' + $scope.novoevento.id + 'incluído com vencimento em:'+  $scope.novoevento.dataVencimento +  ' at:' + new Date());
                       $location.path('/cadastro/eventos').replace();
          });
        });
    };
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();
    $scope.clear = function () {
      $scope.dt = null;
    };
    $scope.open = function($event) {
      $scope.status.opened = true;
    };
    $scope.dateOptions = {
          formatDay: 'dd',
          formatMonth: 'MM',
          formatYear: 'yyyy',
          startingDay: 1
    };
    $scope.dateOptions2 = {
          formatDay: 'dd',
          formatMonth: 'MMMM',
          formatYear: 'yyyy',
          startingDay: 1
    };

    $scope.status = {
      opened: false
    };
    $scope.items = ['item1', 'item2', 'item3'];
    $scope.animationsEnabled = true;
    $scope.open = function (size) {
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          size: size,
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
    };

    if($indexedDB.onDatabaseError) {
      $location.path('/unsupported');
    } else {
      buscaRefTypes();
      buscaInfo();
      buscaClientes();
    }

    function buscaRefTypes() {
      $indexedDB.openStore(OBJECT_STORE_REFTYPES, function (store){
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_EVT)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposEvento = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_SIT)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposSituacao = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
          store.findWhere(store.query().$index('reftype_idx').$eq(REFTYPES_TAXA)).then(function(typeList) {
              if (typeList.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.tiposTaxa = typeList;
              };
          }, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
          });
      }, 'readonly').then(null, function(error) {
        chrome.extension.getBackgroundPage().console.log(error);
      });
    }
    function buscaClientes() {
      $indexedDB.openStore(OBJECT_STORE_CLIENTES, function (store){
          store.getAll().then(function(itemsList) {
              $scope.itemsList = itemsList;
          });
      });
    };

    function buscaInfo() {
      if($routeParams.id) {
        $indexedDB.openStore(OBJECT_STORE_CLIENTES, function (store){
          store.findWhere(store.query().$eq($routeParams.id)).then(function(evento) {
              if (evento.length === 0) {
                chrome.extension.getBackgroundPage().console.log('No objects found');
              } else {
                  $scope.novoevento.id = evento.value.id;
                  $scope.novoevento.situacao = evento.value.situacao;
                  $scope.novoevento.dataInicio = evento.value.dataInicio;
                  $scope.novoevento.dataVencimento = evento.value.dataVencimento;
                  $scope.novoevento.descricao = evento.value.descricao;
                  $scope.novoevento.tipo = evento.value.tipo;
                  $scope.novoevento.titulo = evento.value.titulo;
                  $scope.novoevento.totaltaxas = evento.value.totaltaxas;
                  $scope.novoevento.aluguel = evento.value.aluguel;
                  $scope.novoevento.cobranca = evento.value.cobranca;
                  $scope.novoevento.comissao = evento.value.comissao;
                  $scope.novoevento.deposito =  evento.value.deposito;
                  $scope.novoevento.inquilino = evento.value.inquilino;
                  $scope.novoevento.proprietario = evento.value.proprietario;
                  $scope.novoevento.listaTaxas = evento.value.listaTaxas;
              };
          }, function(error) {
              chrome.extension.getBackgroundPage().console.log(error);
          });
        }, 'readonly').then(null, function(error) {
            chrome.extension.getBackgroundPage().console.log(error);
        });
      }
    }

}]);

imobDbControllers.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
