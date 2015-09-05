/**
 * An AngularJS directive for Dropzone.js, http://www.dropzonejs.com/
 * 
 * Usage:
 * 
 * <div ng-app="app" ng-controller="SomeCtrl">
 *   <button dropzone="dropzoneConfig">
 *     Drag and drop files here or click to upload
 *   </button>
 * </div>
 */

dropzone.directive('dropzone', function ($window) {
  return function (scope, element, attrs) {
    var config, dropzone, previewNode, previewTemplate;
    
    
    //var previewNode = document.querySelector("#template");
    //previewNode.id = "";
    //var previewTemplate = previewNode.parentNode.innerHTML;
    //previewNode.parentNode.removeChild(previewNode);
    
    // create a Dropzone for the element with the given options   
    Dropzone.options.uploadSection = false;
    //dropzone = new Dropzone(element[0], config.options);
    //document.body
    
    previewNode = document.querySelector("#template");
    previewNode.id = "";
    previewTemplate = previewNode.parentNode.innerHTML;
    previewNode.parentNode.removeChild(previewNode);
    
    dropzone = new Dropzone(document.body, {//"#uploadSection", {    // passed into the Dropzone constructor                                        
                                             url:  '/apis/docFile',
                                             maxFilesize: 20,
                                             maxThumbnailFilesize: 5,
                                             headers: {
                                                  'Authorization': 'Bearer ' + $window.sessionStorage.token
                                             },
                                             thumbnailWidth: 120,
                                             thumbnailHeight: 120,
                                             parallelUploads: 5,
                                             createImageThumbnails: true,
                                             previewTemplate: previewTemplate,
                                             autoQueue: false, // Make sure the files aren't queued until manually added           
                                             previewsContainer: "#uploadSection", // Define the container to display the previews
                                             clickable: "#include-file", // Define the element that should be used as click trigger to select files.
                                             withCredentials: true,
                                             accept: function(file, done) {
                                                if (file.name == "justinbieber.jpg") {
                                                  done("Naha, you don't.");
                                                }
                                                else { done(); }
                                             },      
                                             dictCancelUpload: '<span class="fa fa-chain-broker fa-lg"></span>',
                                             dictCancelUploadConfirmation: "Confirma?",                                             
                                             dictOpenFileConfirmation: 'Deseja abrir o arquivo?',
                                             dictDefaultMessage: "Arraste aqui os documentos!",
                                             init: function() {                          
                                                  document.querySelector("#submit-all").onclick = function() {
                                                        dropzone.enqueueFiles(dropzone.getFilesWithStatus(Dropzone.ADDED));
                                                  };
                                                  document.querySelector("#cancel-all").onclick = function() {
                                                      dropzone.removeAllFiles();
                                                  };
                                             },                                              
    });
    
    config = {  'eventHandlers': {                
                'addedfile': function(file) {
                    file.tags = [];
                    file.tags.fixed = [];
                    file.tags.user = [];
                    
                    file.previewElement.querySelector(".dz-edit").onclick = function() { 
                        $('#fileModal').modal(options,file); 
                        //Dropzone.enqueueFile(file); 
                    };
                    
                    file.previewElement.querySelector(".dz-open").onclick = function() {                        
                        $('#fileModal').modal(options,file); 
                        //$get('/apis/docFile/');  
                        //Dropzone.enqueueFile(file); 
                    };       
                    
                    if (!file.type.match(/image.*/)) {                        
                        if (file.type.match(/json.*/)){
                            dropzone.emit("thumbnail", file, "/img/icons/json.png");
                        } else if (file.type.match(/application.pdf/)){
                            dropzone.emit("thumbnail", file, "/img/icons/pdf.png");
                        } else if (file.type.match(/application*powerpoint/)){
                            dropzone.emit("thumbnail", file, "/img/icons/ppt.png");
                        } else if (file.type.match(/application*word*/)){
                            dropzone.emit("thumbnail", file, "/img/icons/word.png");
                        } else if (file.type.match(/application*excel*/)){
                            dropzone.emit("thumbnail", file, "/img/icons/xls.png");
                        } else if (file.type.match(/text*xml/)){
                            dropzone.emit("thumbnail", file, "/img/icons/xml.png");
                        } else if (file.type.match(/text.csv/)){ 
                            dropzone.emit("thumbnail", file, "/img/icons/csv.png");
                        } else if (file.type.match(/text.plain/)){ 
                            dropzone.emit("thumbnail", file, "/img/icons/txt.png");
                        } 
                    };   
                                                            
                },
                'totaluploadprogress': function(progress) {
                    document.querySelector("#total-progress .progress-bar").style.width = progress + "%";
                },
                'sending': function (file, xhr, formData) {                    
                    // Show the total progress bar when upload starts
                    document.querySelector("#total-progress").style.opacity = "1";
                   
                    // And disable the start button
                    //file.previewElement.querySelector(".start").setAttribute("disabled", "disabled");              
                },
                // Hide the total progress bar when nothing's uploading anymore
                'queuecomplete': function(progress) {
                    document.querySelector("#total-progress").style.opacity = "0";
                },        
                'success': function (file, response) {
                  
                }
    }};
    
    // bind the given event handlers
    angular.forEach(config.eventHandlers, function (handler, event) {
        dropzone.on(event, handler);
    });
    
  };
});


