
loginDbControllers.controller('AdminUserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',  
    function AdminUserCtrl($scope, $location, $window, UserService, AuthenticationService) {
 
        //User Controller (signUp, logIn, logOut)
        $scope.logIn = function logIn(username, password) {
            if (username != null && password != null) {

                UserService.logIn(username, password).success(function(data) {
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    if (!$window.sessionStorage.equipid){
                        $window.sessionStorage.equipid="teste1";
                    }                    
                    $location.path("/").replace();
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
 
        $scope.logOut = function logOut() {
            if (AuthenticationService.isAuthenticated) {
                
                UserService.logOut().success(function(data) {
                    AuthenticationService.isAuthenticated = false;
                    delete $window.sessionStorage.token;
                    $location.path("/").replace();
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
            else {
                $location.path("/login");
            }
        }
        
        $scope.signUp = function signUp(username, password, passwordConfirm) {
            if (AuthenticationService.isAuthenticated) {
                $location.path("/").replace();
            }
            else {
                UserService.signUp(username, password, passwordConfirm).success(function(data) {
                    $location.path("/login");
                    $('#signUpModal').modal('hide');
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                    $scope.returnMsg = status;
                });
            }
        }
    }
]);
