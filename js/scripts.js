$(document).ready(function(){ //Funções JQuery
  $("#search-button").on("click", function (e) {
      //$("h1").toggle();
      $("#search-input").animate({
          width: 'toggle'
      });
      $("#search-input").trigger( "focus" );
  });
});

// using jQuery Mask Plugin v1.7.5
$("#cep").mask("00000-000");
$("#cpf").mask("000.000.000-00");
var maskBehavior = function (val) {
  return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
},
options = {
   onKeyPress: function(val, e, field, options) {
     field.mask(maskBehavior.apply({}, arguments), options);
   }
};
$("#tel").mask(maskBehavior, options);
