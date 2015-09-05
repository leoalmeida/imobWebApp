var OBJECT_STORE_EVENTOS = 'evento';

syncDbControllers.config(function ($indexedDBProvider) {
	$indexedDBProvider
      .connection('imobapp-localdb');
});

syncDbControllers.controller('syncCtrl', ['$scope', '$location', 'PostService', '$indexedDB',		
		function($scope, $location, PostService, $indexedDB) {
		      
    $scope.syncedItems = [];
    $scope.syncedQtd = 0;
    $scope.syncSize = 0;
    $scope.percDone = 0;
 
    /**
    * @type {ObjectStore} - OBJECT_STORE_EVENTOS
    */
	  var eventosObjectStore = $indexedDB.objectStore(OBJECT_STORE_EVENTOS);    
    var contratosObjectStore = $indexedDB.objectStore(OBJECT_STORE_CONTRATOS);    
    var clientesObjectStore = $indexedDB.objectStore(OBJECT_STORE_CLIENTES);    
    var imoveisObjectStore = $indexedDB.objectStore(OBJECT_STORE_IMOVEIS);
	  
    if($indexedDB.onDatabaseError) {
      $location.path('/unsupported');
    } else {	
        sincronizaEventos();
        sincronizaContratos();
        sincronizaClientes();
        sincronizaImoveis();
        if ($scope.syncSize == 0) {
            $scope.percDone = 100;
            $scope.msgInformativa = options.api.msgs.finalsync;
        }
    }
    
	  function sincronizaEventos() {
        eventosObjectStore.getAll().then(function(itemsList) {
            var objtype = "evento";
            var objtags = "Eventos";
            $scope.syncSize = $scope.syncSize + itemsList.length;
            if ($scope.syncSize == 0) {
                $scope.msgInformativa = options.api.msgs.nottosync;    
                return;
            }
            $scope.msgInformativa = options.api.msgs.syncing;
            $scope.showDetalhes = false;
              
            angular.forEach(itemsList, function(value, key){
                console.log(JSON.stringify(value));
                console.log(key);
                var publishItem = {
                        type: objtype,
                        subtype: value.tipo,
                        title: value.titulo,
                        tags: objtags,
                        is_published: true,                        
                        content: JSON.stringify(value)                                                
                };
                
                PostService.publish(publishItem).success(function(data) {
                    console.log(data.status);
                    console.log(data.statusMessage);
                    console.log(data.content);
                    $scope.syncedItems
                    $scope.syncedItems.push(data.content);
                    $scope.syncedQtd++;
                    $scope.percDone = 100*$scope.syncedQtd/$scope.syncSize;
                    if ($scope.percDone == 100) {
                        $scope.msgInformativa = options.api.msgs.finalsync;
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });                               
            });
            console.log(status);
            console.log("Envio finalizado");
        });	
    }
    
    function sincronizaContratos(){
        contratosObjectStore.getAll().then(function(itemsList) {
            var objtype = "contrato";
            var objtags = "Contratos";
            $scope.syncSize = $scope.syncSize + itemsList.length;
            if ($scope.syncSize == 0) {
                $scope.msgInformativa = options.api.msgs.nottosync;                
                console.log("Não há informações para sincronizar");                                
                return;
            }
            $scope.msgInformativa = options.api.msgs.syncing;
            $scope.showDetalhes = false;
              
            angular.forEach(itemsList, function(value, key){
                console.log(JSON.stringify(value));
                console.log(key);
                var publishItem = {
                        type: objtype,
                        subtype: value.tipoContrato,
                        title: value.id,
                        tags: objtags,
                        is_published: true,                        
                        content: JSON.stringify(value)                                                
                };
                
                PostService.publish(publishItem).success(function(data) {
                    console.log(data.status);
                    console.log(data.statusMessage);
                    console.log(data.content);
                    $scope.syncedItems
                    $scope.syncedItems.push(data.content);
                    $scope.syncedQtd++;
                    $scope.percDone = 100*$scope.syncedQtd/$scope.syncSize;
                    if ($scope.percDone == 100) {
                        $scope.msgInformativa = options.api.msgs.finalsync;
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });                               
            });
            console.log(status);
            console.log("Envio finalizado");
        });	
    }
    
    function sincronizaClientes(){
        clientesObjectStore.getAll().then(function(itemsList) {
            var objtype = "cliente";
            var objtags = "Clientes";
            $scope.syncSize = $scope.syncSize + itemsList.length;
            if ($scope.syncSize == 0) {
                $scope.msgInformativa = options.api.msgs.nottosync;                
                console.log("Não há informações para sincronizar");
                return;
            }
            $scope.msgInformativa = options.api.msgs.syncing;
            $scope.showDetalhes = false;
              
            angular.forEach(itemsList, function(value, key){
                console.log(JSON.stringify(value));
                console.log(key);
                var publishItem = {
                        type: objtype,
                        subtype: value.cpf,
                        title: value.nome,
                        tags: objtags,
                        is_published: true,                        
                        content: JSON.stringify(value)                                                
                };
                
                PostService.publish(publishItem).success(function(data) {
                    console.log(data.status);
                    console.log(data.statusMessage);
                    console.log(data.content);
                    $scope.syncedItems
                    $scope.syncedItems.push(data.content);
                    $scope.syncedQtd++;
                    $scope.percDone = 100*$scope.syncedQtd/$scope.syncSize;
                    if ($scope.percDone == 100) {
                        $scope.msgInformativa = options.api.msgs.finalsync;
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });                               
            });
            console.log(status);
            console.log("Envio finalizado");
        });	
    }
                
    function sincronizaImoveis(){
        imoveisObjectStore.getAll().then(function(itemsList) {
            var objtype = "imovel";
            var objtags = "Imovel";
            $scope.syncSize = $scope.syncSize + itemsList.length;
            if ($scope.syncSize == 0) {
                $scope.msgInformativa = options.api.msgs.nottosync;                
                console.log("Não há informações para sincronizar");
                return;
            }
            $scope.msgInformativa = options.api.msgs.syncing;
            $scope.showDetalhes = false;
              
            angular.forEach(itemsList, function(value, key){
                console.log(JSON.stringify(value));
                console.log(key);
                var publishItem = {
                        type: objtype,
                        subtype: value.tipoImovel,
                        title: value.titulo,
                        tags: objtags,
                        is_published: true,                        
                        content: JSON.stringify(value)                                                
                };
                
                PostService.publish(publishItem).success(function(data) {
                    console.log(data.status);
                    console.log(data.statusMessage);
                    console.log(data.content);
                    $scope.syncedItems
                    $scope.syncedItems.push(data.content);
                    $scope.syncedQtd++;
                    $scope.percDone = 100*$scope.syncedQtd/$scope.syncSize;
                    if ($scope.percDone == 100) {
                        $scope.msgInformativa = options.api.msgs.finalsync;
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });                               
            });
            console.log(status);
            console.log("Envio finalizado");
        });	
    }
  
}
]);
