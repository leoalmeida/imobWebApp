
   var config = {
	form: {
		name: 'form',
		show: {
		    header: true,
		    footer: true
		},
		style: 'padding: 0px',
		tabs: {
					name: 'tabs',
					active: 'principal',
					tabs: [
					    { id: 'principal', caption: 'Principal'},
					    { id: 'btnAdd', caption: '+'}
					],
					onClick: function (event) {							
						if (event.target == "btnAdd") {
							insertTab();							
						} else {
							//w2ui.form.html('main', w2ui.form);						
						}
					},
					onClose: function (event) {
						this.click('principal');
					}
				},
		fields: [
		    { name: 'rua', type: 'text', required: true, size:'100%' },
		    { name: 'numero',  type: 'text', required: true },
		    { name: 'complemento',   type: 'text'},
		    { name: 'bairro',   type: 'text', required: true },
		    { name: 'cidade',   type: 'text', required: true },
		    { name: 'estado',   type: 'text', required: true },
		    { name: 'cep',   type: 'text', required: true, placeholder: '00000-000' },
		    { name: 'pais',   type: 'text', required: true }
		]
	}       
   }
	            
   $(function () {
   	$('#telTags').tagator({
   		height: '34',
   		width:'110',
   		placeholder:"Digite aqui...",
   		useDimmer: true,	
   		dropdown:[{
			'Celular':'Celular',
			'Residencial':'Residencial',
			'Comercial':'Comercial'
		}]
			
   	});
   	/*$('#telCombo').selectpicker({				
		container: 'body',
		style: 'btn btn-info',
		size: 'auto',
		mobile:true
	});*/	
		
	// inicializa formulário e cria a tab principal e de criação
	$('#main').w2form(config.form);
	var tabs =  w2ui.form_tabs;
	tabs.set('btnAdd', { class: 'btn-blue'});
	tabs.select( 'principal' );
	
	
   });

   var indTab = 1;

   function insertTab() {
	if (indTab > 5) return;
	
	//Cria a Tab nova e insere
	var tabid = 'Tab'+ indTab;
	var tabs = w2ui.form_tabs;    
	tabs.animateInsert('btnAdd', { id: tabid, caption: 'Adicional', closable: true});
		
	//Cria a nova tab 	
	var page_element = document.createElement('div');
	$(page_element).addClass('w2ui-page page-'+indTab);
	$(page_element).attr('ng-model','Adicional'+indTab);
	$(page_element).css('top', '36px');
	$('#form_form_tabs').after(page_element);	
	
	//Cria um clone do form principal e inclui na tela
	$( ".w2ui-page.page-0" ).clone().children().appendTo('.w2ui-page.page-'+indTab);
	alert(w2ui.form.page());
	tabs.render();
	tabs.select( tabid );
	
	
	indTab++;
	
							
   };
