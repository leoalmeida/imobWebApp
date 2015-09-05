/* global angular */
var OBJECT_STORE_EVENTOS = 'evento'; 


calendarDbControllers.config(function ($indexedDBProvider) {
	$indexedDBProvider
      .connection('imobapp-localdb');
})
.controller('CalendarCtrl', ['$scope', '$compile', 'uiCalendarConfig', '$indexedDB',		
		function($scope,$compile,uiCalendarConfig,$indexedDB) {
		  
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    $scope.imobEventos = [];
    $scope.language = 'portuguese';
    $scope.centerAnchor = true;
    $scope.toggleCenterAnchor = function () {$scope.centerAnchor = !$scope.centerAnchor}
    $scope.droppedEvents = [];
    	
    	  /* event source that pulls from google.com */
    $scope.eventSource = {            
            googleCalendarApiKey: "AIzaSyDhqBTU_xzLtyBgfAH-lSsR4QsBfg67-U0",            
            url: "http://www.google.com/calendar/feeds/brazilian__pt_br%40holiday.calendar.google.com/public/basic ",
            className: 'gcal-event',
            backgroundColor: '#E0E0E0',
            color: 'white',
            rendering: 'background'
    };
    
    /* event source that contains custom events on the scope */
    $scope.newEvents = [
      {type:'Teste',title: 'Teste: teste',editable: true,backgroundColor: '#CCE5FF', color: 'white',textColor: 'black'},
      {type:'Teste2',title: 'Teste: teste',editable: true,backgroundColor: '#CCE5FF', color: 'white', textColor: 'black'}
    ];
    
    //$scope.eventSources = [$scope.eventSource,$scope.droppedEvents];
    $scope.eventSources = [$scope.droppedEvents];
    
    /**
    * @type {ObjectStore} - OBJECT_STORE_EVENTOS
    */
	  var eventosObjectStore = $indexedDB.objectStore(OBJECT_STORE_EVENTOS);
	  
	  function buscaEventos() {
        eventosObjectStore.getAll().then(function(eventosList) {            
            angular.forEach(eventosList, function(value, key){
                this.push({
                    id: value.id,
                    title: value.titulo,
                    editable: true,  
                    start: moment(value.dataVencimento, "DD/MM/YYYY"),
                    editable: true,
                    backgroundColor: '#004C99',
                    allDay: true,
                    color: 'white',
                    detail: value.descricao,
                    owner: value.relacionados
                });
            }, $scope.imobEventos);   
            $scope.eventSources.push($scope.imobEventos);
        });		
    }
    
    if($indexedDB.onDatabaseError) {
      $location.path('/unsupported');
    } else {	
      buscaEventos();
    }
    
    
        $scope.eventDropCompleteList=function(data,evt){
            console.log("130","$scope","eventDropComplete", "", evt);
            var index = $scope.newEvents.indexOf(data);
            if (index == -1)
            $scope.newEvents.push(data);                     
        }
        $scope.eventDragSuccessList=function(data,evt){
            console.log("131","$scope","eventDropSuccess", "", evt);
            var index = $scope.newEvents.indexOf(data);
            if (index > -1) {
                $scope.newEvents.splice(index, 1);
            }
            
        }
        $scope.eventDropCompleteCal=function(data,evt){
            console.log("132","$scope","eventDropComplete", "", evt);
            var index = $scope.droppedEvents.indexOf(data);
            if (index == -1)
            $scope.droppedEvents.push(data);                     
        }
        $scope.eventDragSuccessCal=function(data,evt){
            console.log("133","$scope","eventDropSuccess", "", evt);
            var index = $scope.droppedEvents.indexOf(data);
            if (index > -1) {
                $scope.droppedEvents.splice(index, 1);
            }
            
        }
    
    
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.owner[0].relacionado + "- " + date.title + ": " + date.detail);
    }; 
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key] === source){
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      if(canAdd === 0){
        sources.push(source);
      }
    };
    /* add custom event*/
    $scope.addEvent = function() {
      $scope.newEvents.push({
        title: 'Test new',
        editable: true,  
        start: new Date(y, m, d),
        end: new Date(y, m, d),
        className: ['customFeed']
      });
    };
    /* remove event */
    $scope.removeEvent = function(index) {
      $scope.newEvents.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalendar = function(calendar) {
      if(uiCalendarConfig.calendars[calendar]){
        uiCalendarConfig.calendars[calendar].fullCalendar('render');
      }
    };
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'tooltip': event.title,
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };    
        
    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: "auto",
        editable: true,
        droppable: true, // this allows items to be dropped onto the calendar
        header:{
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        lang: 'pt-br',
        defaultView: 'month',
        eventClick: $scope.alertOnEventClick,       
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender,                
      }
    };
    
    $scope.outrosImobEvents = {
       color: '#f00',
       textColor: 'yellow',
       events: [ 
          $scope.newEvents
        ]
    };    
}
]);
/* EOF */
