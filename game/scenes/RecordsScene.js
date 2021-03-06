function RecordsScene(){
	$("#backButton_records").bind('click',this.onBackCkick);
	$('#backButton_records').mouseover(function(){playSound("hover")});
	
	this.place = -1;
}
extend(RecordsScene,BaseScene);

RecordsScene.prototype.show = function(){
	$("#records").fadeIn();
	 jQuery.ajax({
	            type: "GET", // метод передачи данных, можно пропустить - по умолчанию и так get
	            url: "http://hahaton.ru/html5games/reflect/table/index.php", // путь к файлу, который будем читать
	            dataType: "xml", // тип данных, с которыми работаем
	            success: this.onRecordsCome,
	            data: {mode: 'showall'}
            });
            

	//this.sendRecord('test', 111);	
}

RecordsScene.prototype.hide = function(){
	global.stage.removeChild(this.cCreditsContainer);
	$("#records").fadeOut();
}

RecordsScene.prototype.onBackCkick = function(){
	playSound("menu_back");	
	global.sceneController.switchScene(SceneController.eventTypes.MAIN_MENU);
}

RecordsScene.prototype.onRecordsCome = function(xml){
	$('#recordTable').html('');
	jQuery(xml).find('name').each(function(){
		var name = jQuery(this).attr('name');
		var count = jQuery(this).attr('count');
		$('#recordTable').append('<tr><td>' + htmlEntities(name) + '</td><td>' + htmlEntities(count) + '</td></tr>');
		//console.log(name, count);
	});
}