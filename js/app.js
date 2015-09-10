/* global angular,window */
var imobDbApp = angular.module('imobDbApp', ['angular-gestures', 
                                              'ngRoute', 
                                              'ngResource',
                                              'imobDbControllers', 
                                              'imobDbFilters', 
                                              'imobDbServices', 
                                              'imobDbDirectives',
                                              'loginDbControllers',                                               
                                              'calcController', 
                                              'calendarDbControllers', 
                                              'syncDbControllers', 
                                              'dropzone'
                                              ]);

 
var dropzone = angular.module('dropzone', []);
var imobDbControllers = angular.module('imobDbControllers', ['ui.bootstrap', 'ngResource', 'ngAnimate', 'indexedDB']);
var imobDbFilters = angular.module('imobDbFilters', []);
var imobDbServices = angular.module('imobDbServices', []);
var imobDbDirectives = angular.module('imobDbDirectives', []);
var loginDbControllers = angular.module('loginDbControllers', []);
var calcController = angular.module('calcController', []);
var calendarDbControllers = angular.module('calendarDbControllers', ['ui.calendar', 'ui.bootstrap', 'ngDraggable', 'ngAnimate', 'indexedDB']);
var syncDbControllers = angular.module('syncDbControllers', ['ui.bootstrap', 'ngAnimate', 'indexedDB']);


var options = {};
options.api = {};
options.api.base_url = "https://127.0.0.1";
options.api.msgs = {"nottosync":{text:"Não há informações para sincronizar",type:"info"},
                    "syncing":{text:"Aguarde, estamos em sincronização com o servidor!!",type:"warning"},
                    "failtosync":{text:"Falha na sincronização com o servidor!!",type:"danger"},
                    "finalsync":{text:"Sincronização finalizada",type:"success"}
                   };

imobDbApp.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|filesystem):/);
    }
]);
              
imobDbApp.config(['$routeProvider', '$locationProvider', 'hammerDefaultOptsProvider',
	function($routeProvider , $locationProvider, hammerDefaultOptsProvider)
	{
	    $routeProvider.
		  when('/home', {
				templateUrl: 'partials/home.html',
				controller: 'HomeCtrl'			
			}).
      when('/upload', {
        templateUrl: '/partials/login.html',
        controller: 'AdminUserCtrl',
        css: '/css/login.css'
      }).
      when('/login', {
        templateUrl: '/partials/login.html',
        controller: 'AdminUserCtrl',
        css: '/css/login.css'
      }).
      when('/logout', {
          templateUrl: '/partials/logout.html',
          controller: 'AdminUserCtrl'
      }).
      when('/sync', {
				templateUrl: '/partials/sync.html',
				controller: 'syncCtrl'
			}).
			when('/biblioteca', {  
				templateUrl: 'partials/biblioteca.html',
				controller: 'BibliotecaCtrl',
				css: '/css/gdocs.css'
			}).
			when('/boleto', { 
				templateUrl: '/partials/formNewBoleto.html'
				//controller: 'BoletosCtrl'
			}).
			when('/cadastro/clientes', { 
				templateUrl: '/partials/listViewClientes.html',
				controller: 'ClientesCtrl'
			}).
			when('/cadastro/clientes/new', {  
				templateUrl: '/partials/formNewClientes.html',
				controller: 'ClientesEditCtrl'
			}).
			when('/cadastro/clientes/edit/:id', { 
				templateUrl: '/partials/formNewClientes.html',
				controller: 'ClientesEditCtrl'
			}).
			when('/cadastro/imoveis', { 
				templateUrl: '/partials/listViewImoveis.html',
				controller: 'ImoveisCtrl'
			}).
			when('/cadastro/imoveis/new', {  
				templateUrl: '/partials/formNewImoveis.html',
				controller: 'ImoveisEditCtrl'	
			}).
			when('/cadastro/imoveis/edit/:id', {
				templateUrl: '/partials/formNewImoveis.html',
				controller: 'ImoveisEditCtrl'
			}).
			when('/cadastro/contratos', { 
				templateUrl: '/partials/listViewContratos.html',
				controller: 'ContratosCtrl'
			}).
			when('/cadastro/contratos/new', {  
				templateUrl: '/partials/formNewContratos.html',
				controller: 'ContratosEditCtrl'			
			}).
			when('/cadastro/contratos/edit/:id', {
				templateUrl: '/partials/formNewContratos.html',
				controller: 'ContratosEditCtrl'
			}).
			when('/cadastro/eventos', { 
				templateUrl: '/partials/listViewEventos.html',
				controller: 'EventosCtrl'
			}).
			when('/cadastro/eventos/new', {  
				templateUrl: '/partials/formNewEventos.html',
				controller: 'EventosEditCtrl'	
			}).
			when('/cadastro/eventos/edit/:id', {
				templateUrl: '/partials/formNewEventos.html',
				controller: 'EventosEditCtrl'
			}).
			when('/dashboard', {  
				templateUrl: '/partials/home.html',
				controller: 'ClientesCtrl'
			}).
			when('/calendario', {  
				templateUrl: '/partials/calendario.html',
				controller: 'CalendarCtrl',
				css: '/css/calendar.css'
			}).
			when('/calculadoras/emprestimo', {  
				templateUrl: '/partials/calculadoraEmprestimo.html',
				controller: 'calculadoraCtrl'
			}).						
			when('/unsupported', {
				templateUrl: '/partials/unsupported.html'
			}).
			when('/404', {
				templateUrl: '/partials/404.html',
				css: '/css/404.css'
			}).
			otherwise({			    
        //templateUrl: '/partials/login.html',
        //controller: 'AdminUserCtrl',
        //css: '/css/login.css',
        //access: { requiredAuthentication: true }        
				templateUrl: 'partials/home.html',
				controller: 'HomeCtrl'
			});
			
		$locationProvider.html5Mode(true);
		hammerDefaultOptsProvider.set({
        recognizers: [[Hammer.Tap, {time: 100}]]
    });		
    
   
	}
]);

    
// Init setup and attach event listeners.
document.addEventListener('DOMContentLoaded', function(e) {
  // FILESYSTEM SUPPORT --------------------------------------------------------
  window.webkitRequestFileSystem(TEMPORARY, 1024 * 1024, function(localFs) {
    fs = localFs;
  }, onError);
  // ---------------------------------------------------------------------------
});


// FILESYSTEM SUPPORT ----------------------------------------------------------
var fs = null;
var FOLDERNAME = 'test';

function writeFile(blob) {
  if (!fs) {
    return;
  }

  fs.root.getDirectory(FOLDERNAME, {create: true}, function(dirEntry) {
    dirEntry.getFile(blob.name, {create: true, exclusive: false}, function(fileEntry) {
      // Create a FileWriter object for our FileEntry, and write out blob.
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onerror = onError;
        fileWriter.onwriteend = function(e) {
          console.log('Write completed.');
        };
        fileWriter.write(blob);
      }, onError);
    }, onError);
  }, onError);
}
// -----------------------------------------------------------------------------


/*
imobDbApp.controller('pageStatusCtrl',  function($scope) {    
    if (navigator.onLine) {
        $scope.page-status = "Online";
    }else {
        $scope.page-status = "Offline";
    }
});
*/

/*
imobDbApp.config(function ($httpProvider) {    
    $httpProvider.interceptors.push('TokenInterceptor');    
});
*/
/*
imobDbApp.run(function($rootScope, $location, $window, gdocs) { 
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        if (nextRoute != null 
                  && nextRoute.access != null 
                  && nextRoute.access.requiredAuthentication 
                  && !gdocs.accessToken) {
            $rootScope.hidemenu = true;
            $location.path("/login").replace();            
        }
        
        if (nextRoute.access.requiredAuthentication 
            && gdocs.accessToken){        
            $rootScope.hidemenu = false;            
        }
    });    
});
*/
