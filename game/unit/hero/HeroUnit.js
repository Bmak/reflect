/*
 * HeroUnit.prototype.getChanceFireAngle = function(x,y,v)
 * returns clever angle to move or fire
 * 
 * HeroUnit.prototype.getChanceFireAngle_simple = function(x,y,N)
 * returns stupid angle to the hero position + N pixels in his direction
 * 
 * HeroUnit.prototype.getChanceFireCoords = function(x,y,v)
 * returns {} with x and y
 *  
 */

function HeroUnit()	
{
	HeroUnit.superclass.constructor.apply(this);
	
	this.angle;		
	this.bodySize;
	
	this.zeroAll();
	
	this.sh_segments = [{},{},{},{}];	
	
	this.initView();
	this.initOptions();
		
	this.sh_old_segments = [{},{},{},{}];
	
	this.segments_arr;
	this.segments_arr_counted = false;
	
	
	this.o_ax = 0;
	this.o_ay = 0;
	this.o_vx = 0;
	this.o_vy = 0;
	
	this.o_a = 0;
	this.o_v = 0;
	this.o_angle = 0;
	
	this.g_vx = 0;
	this.g_vy = 0;	
	
	this.teleportCount = 0;
	this.regenerationCount = 0;
	this.lastRegenerationTime = global.gameTime;
	
	this.whiteShieldCount = 0;
	
	this.shieldWidth = 0;
	this.shieldHeight = 0;
	this.shieldDist = 0;
	
	
	
	this.ss_fire = new createjs.SpriteSheet({ "animations": {
		"run": [0, 15]},
		"images": [global.preloader.imgs.blow_anim],
		"frames": {
		"regX": global.preloader.imgs.blow_anim.height/2,
		"regY": global.preloader.imgs.blow_anim.height/2,
		"height": global.preloader.imgs.blow_anim.height,
		"width": global.preloader.imgs.blow_anim.height
		}
	});
	
	this.ss_fire.getAnimation("run").frequency = 1;	
}

extend(HeroUnit,BaseUnit);

HeroUnit.prototype.drawFire = function(){
	if (global.gameTime - this.start_fire_time < 2000)
		if (Math.abs(global.gameTime - this.last_exp_time) > 300)
		{
			this.lastTail_time = global.gameTime;
			
			var expl = new createjs.BitmapAnimation(this.ss_fire);
			
			expl.onAnimationEnd = function(anim, frame)
			{
				anim.stop();
				global.EnemyManager.enemiesCont.removeChild(anim);
				anim = null;
				//global.EnemyManager.removeEnemy(unit);
			}
			
			//var scale = 0.6;
			expl.x = this.x;
			expl.y = this.y;
			global.EnemyManager.enemiesCont.addChildAt(expl,0);
						
			expl.gotoAndPlay("run");
			expl.rotation = Math.random()*360;
			expl.scaleX = expl.scaleY = 0.5;
		}
		
}

HeroUnit.prototype.whiteShieldDecide = function(){
	if (this.whiteShieldCount > 0){
		this.underSheild.visible = true;
		this.whiteShieldCount --;
	}else{
		this.underSheild.visible = false;		
	}
}

HeroUnit.prototype.zeroAll = function(){
	this.o_ax = 0;
	this.o_ay = 0;
	this.o_vx = 0;
	this.o_vy = 0;
	
	this.start_fire_time = -100000;
	this.last_exp_time = -100000;
	
	
	this.o_a = 0;
	this.o_v = 0;
	this.o_angle = 0;
	
	this.g_vx = 0;
	this.g_vy = 0;
	
	this.LEFT = false;
	this.RIGHT = false;
	this.FORWARD = false;
	this.BACK = false;
	
	this.a_c = 0;
	this.a_c_max_foward = 1000;
	this.a_c_max_backward = -1000;
	this.a_c_triction = 500;
	this.v_c = 0;
	this.max_v_c_forward = 180;
	this.max_v_c_backward = -50;
	
	this.ar_c = 0; 
	this.ar_c_max = 5000; 
	this.ar_c_triction = 5000;
	this.vr_c = 0;
	this.vr_c_max = 300;
	
	this.old_x = this.x;
	this.old_y = this.y;
	
	this.sh_old_angle = 90;

	this.staticAngle = 0;
	
	this.speedyMode = false;
	this.speedTime = 0;
	
	this.shieldScaleMode = false;
	this.shieldScaleTime = 0;
	
	this.fullProtectMode = false;
	this.fullProtectTime = 0;
	
	this.shieldWidth = 100;
	this.shieldHeight = 10;
	this.shieldDist = 25;
	
	this.teleportCount = 0;
	this.regenerationCount = 0;
	
	this.glowGreen_start = -1000;		
	this.glowRed_start = -1000;		
}

HeroUnit.prototype.regenerateHealth = function(){
	if (global.gameTime-this.lastRegenerationTime > 5000){
		if (this.health < this.MAX_HEALTH){
			this.health+=this.regenerationCount;			
			this.lastRegenerationTime = global.gameTime;
			if (this.health > this.MAX_HEALTH){
				this.health = this.MAX_HEALTH;
			}
		}
	}	
}

HeroUnit.prototype.tryTeleport = function(x,y){
	if (this.teleportCount>0){
		this.teleport(x,y);	
	}				
}

HeroUnit.prototype.teleport = function(x,y) {
	this.teleportCount --;
	
	this.teleportX = x;
	this.teleportY = y;
	
	var tween = createjs.Tween.get(this, {loop:false});	
	tween.to( { alpha: 0 } ,200).wait(1).call(this.completeTeleport);
}

HeroUnit.prototype.completeTeleport = function()
{
	createjs.Tween.removeTweens(this);
	
	var tween = createjs.Tween.get(this, {loop:false});	
	tween.to( { alpha: 1 } ,200)
	this.x = this.teleportX;
	this.y = this.teleportY;
}

HeroUnit.prototype.archiveShieldSegments = function(){
	for (var i=0; i<4; i++){
		this.sh_old_segments[i] = clone(this.sh_segments[i]);
	}
}

HeroUnit.prototype.setActualShieldSegments = function(){
	this.archiveShieldSegments();
	this.sh_segments = this.countShieldSegments(this.sheildAngle, this.x,this.y);
}

HeroUnit.prototype.getSieldSegmentsArray_usingOldandNow = function(count){
	var posArr = this.getPositionArray(count);
	var angleArr = this.getRotationShieldArray(count);
	var res = [];
	for (var i=0; i<count; i++){		
		res[i] = this.countShieldSegments(angleArr[i], posArr[i].x, posArr[i].y);		
	}
	return res;
	
}

HeroUnit.prototype.getPositionArray = function(count){
	var res = [];
	var dx = (this.x - this.old_x)/(count-1);
	var dy = (this.y - this.old_y)/(count-1);
	for (var i=0; i<count; i++){
		res[i] = {x:0.0, y:0.0};
		res[i].x = this.old_x + dx*i;
		res[i].y = this.old_y + dy*i;
	}	
	return res;	
}

HeroUnit.prototype.countShieldSegments = function(angle,px,py){
	var sh_TopLeft = {x:0.0, y:0.0};
	var sh_TopRight = {x:0.0, y:0.0};
	var sh_BottomRight = {x:0.0, y:0.0};
	var sh_BottomLeft = {x:0.0, y:0.0};

	
	sh_TopLeft.x = -this.shieldWidth/2;
	sh_TopLeft.y = -this.shieldDist - this.shieldHeight;
	
	sh_TopRight.x = this.shieldWidth/2;
	sh_TopRight.y = -this.shieldDist  - this.shieldHeight;
	
	sh_BottomLeft.x = -this.shieldWidth/2;
	sh_BottomLeft.y = -this.shieldDist;
	
	sh_BottomRight.x = this.shieldWidth/2;
	sh_BottomRight.y = -this.shieldDist;

	var alpha = (angle-90)/180 * Math.PI;
	sh_TopLeft = rotateVec(sh_TopLeft, alpha);
	sh_TopRight = rotateVec(sh_TopRight, alpha);	
	sh_BottomLeft = rotateVec(sh_BottomLeft, alpha);	
	sh_BottomRight = rotateVec(sh_BottomRight,alpha);
	
	sh_TopLeft.x += px;
	sh_TopRight.x += px;
	sh_BottomLeft.x += px;
	sh_BottomRight.x += px;
		
	sh_TopLeft.y += py;	
	sh_TopRight.y += py;	
	sh_BottomLeft.y += py;	
	sh_BottomRight.y += py;
	
	var sh_segments = [{},{},{},{}];
	
	sh_segments[0].x1 = sh_TopLeft.x;	
	sh_segments[0].y1 = sh_TopLeft.y;
	sh_segments[0].x2 = sh_TopRight.x; 	
	sh_segments[0].y2 = sh_TopRight.y;

	sh_segments[1].x1 = sh_TopRight.x; 	
	sh_segments[1].y1 = sh_TopRight.y; 	
	sh_segments[1].x2 = sh_BottomRight.x; 	
	sh_segments[1].y2 = sh_BottomRight.y; 	

	sh_segments[2].x1 = sh_BottomRight.x; 	
	sh_segments[2].y1 = sh_BottomRight.y; 	
	sh_segments[2].x2 = sh_BottomLeft.x; 	
	sh_segments[2].y2 = sh_BottomLeft.y; 	

	sh_segments[3].x1 = sh_BottomLeft.x; 	
	sh_segments[3].y1 = sh_BottomLeft.y; 	
	sh_segments[3].x2 = sh_TopLeft.x; 	
	sh_segments[3].y2 = sh_TopLeft.y;
	
	return sh_segments;
}


HeroUnit.prototype.initView = function ()
{
	this.rotation = 270;
	this.view = new createjs.Container();
	
	this.bodySize = global.preloader.imgs.player.height;
	this.ss = new createjs.SpriteSheet({ "animations": {
		"run": { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] }},
		"images": [global.preloader.imgs.player],
		"frames": {
		"regX": global.preloader.imgs.player.height/2,
		"regY": global.preloader.imgs.player.height/2,
		"height": global.preloader.imgs.player.height,
		"width": global.preloader.imgs.player.height
		}
	});	
			
	this.width = global.preloader.imgs.player.width;
	this.height = global.preloader.imgs.player.height;

	this.player_glow_green = new createjs.Bitmap(global.preloader.imgs.player_glow_green);
	this.player_glow_green.visible = false;
	this.player_glow_red = new createjs.Bitmap(global.preloader.imgs.player_glow_red);
	this.player_glow_red.visible = false;
	
	if (this.width >= this.height) { this.size = this.height; }
	else { this.size = this.width; }
	this.size *= 0.6;
				
	this.ss.getAnimation("run").frequency = 0;
				
	this.body = new createjs.BitmapAnimation(this.ss);
				
	this.body.gotoAndPlay("run");	
	this.body.rotation = 90;
	this.player_glow_green.regX = global.preloader.imgs.player.height/2;
	this.player_glow_green.regY = global.preloader.imgs.player.height/2;
	this.player_glow_green.rotation = this.body.rotation; 	
	this.player_glow_red.regX = this.player_glow_green.regX;
	this.player_glow_red.regY = this.player_glow_green.regY;
	this.player_glow_red.rotation = this.player_glow_green.rotation;	
	
	this.sheild = new createjs.Bitmap(global.preloader.imgs.shield);
	this.underSheild = new createjs.Bitmap(global.preloader.imgs.underShield);
	this.sheild.regX = -this.shieldDist + 10;
	this.sheild.regY = this.shieldWidth/2 + 10;
	//this.sheild.regX = -this.shieldWidth/2 + this.shieldHeight + 10;
	//this.sheild.regY = this.shieldWidth/2 + 10;
	
	this.underSheild.regX = this.sheild.regX;
	this.underSheild.regY = this.sheild.regY;
	this.underSheild.alpha = 0.5;
	
	this.arrow = new createjs.Bitmap(global.preloader.imgs.player_arrow);
	this.arrow.rotation = 90;
	this.arrow.x = 110;
	this.arrow.regX = global.preloader.imgs.player_arrow.width/2;
	this.arrow.regY = global.preloader.imgs.player_arrow.height/2;	
	
	this.addChild(this.player_glow_green);
	this.addChild(this.player_glow_red);
	this.addChild(this.body);	
	this.addChild(this.arrow);
	
	
	this.addChild(this.sheild);
	this.addChild(this.underSheild);	
	this.underSheild.visible = false;
		
	this.rotationSpeed = 200;
}

HeroUnit.prototype.takeBonusAnimation = function(){
	this.glowGreen_start = global.gameTime;
}

HeroUnit.prototype.damageAnimation = function(){
	this.glowRed_start = global.gameTime;
}

HeroUnit.prototype.makeDamage = function(v){
	this.health -= v;
	this.damageAnimation();
}

HeroUnit.prototype.check_glow_green_vis = function(){
	if (global.gameTime - this.glowGreen_start < 1000){
		this.player_glow_green.visible = true;	
	}else{
		this.player_glow_green.visible = false;		
	}		
}

HeroUnit.prototype.check_glow_red_vis = function(){
	if (global.gameTime - this.glowRed_start < 1000){
		this.player_glow_red.visible = true;	
	}else{
		this.player_glow_red.visible = false;		
	}		
}


HeroUnit.prototype.initOptions = function ()
{
	this.MAX_HEALTH = 10;
	this.health = this.MAX_HEALTH;
	
	this.respawnCount = 0;
	this.respawnBullet = 200;
	this.damage = 5;
	
	this.current_forward = this.max_v_c_forward;
	this.current_backward = this.max_v_c_backward;
	
	this.speedyMode = false;
	this.speedTime = 0;
	
	this.shieldScaleMode = false;
	this.shieldScaleTime = 0;
	
	this.fullProtectMode = false;
	this.fullProtectTime = 0;
	
	this.gunMode = false;
	this.gunModeTime = 0;
	
	this.protectIcon = new createjs.Bitmap(global.preloader.imgs.full_protect_icon);
	this.protectIcon.regX = global.preloader.imgs.full_protect_icon.width/2;
	this.protectIcon.regY = global.preloader.imgs.full_protect_icon.height/2;
}

HeroUnit.prototype.staticKeyControlling = function(){
	if (this.FORWARD || this.BACK || this.LEFT || this.RIGHT){
		this.a_c = this.a_c_max_foward;
		
		
		if (this.FORWARD && this.LEFT){
			this.staticAngle = 225;
		}else
		if (this.FORWARD && this.RIGHT){
			this.staticAngle = -45;
		}else
		if (this.FORWARD){
			this.staticAngle = -90;
		}else
		if (this.BACK && this.LEFT){
			this.staticAngle = 135;
		}else
		if (this.BACK && this.RIGHT){
			this.staticAngle = 45;
		}else
		if (this.BACK){
			this.staticAngle = 90;
		}else
		if (this.LEFT){
			this.staticAngle = 180;
		}else
		if (this.RIGHT){
			this.staticAngle = 0;
		}
		
		var d = getAngleDiff_grad(this.rotation,this.staticAngle);
		if (d>0)
			this.ar_c = this.ar_c_max
		else	
			this.ar_c = -this.ar_c_max;
		
	}else{
		if (this.v_c > 0){
			this.a_c = -this.a_c_triction;
		}else if (this.v_c < 0){
			this.a_c = this.a_c_triction;			
		}else{
			this.a_c = 0;
		}
		
		if (this.vr_c > 0){
			this.ar_c = -this.ar_c_triction;
		}else if (this.vr_c < 0){
			this.ar_c = this.ar_c_triction;			
		}else{
			this.ar_c = 0;
		}		
				
	}
}
HeroUnit.prototype.relativeKeyControlling = function(){
	if (this.FORWARD){
		this.a_c = this.a_c_max_foward;
	}
	else if (this.BACK){
		this.a_c = this.a_c_max_backward;
	}else{
		if (this.v_c > 0){
			this.a_c = -this.a_c_triction;
		}else if (this.v_c < 0){
			this.a_c = this.a_c_triction;			
		}else{
			this.a_c = 0;
		}
	}
	
	if (this.LEFT){
		this.ar_c = -this.ar_c_max;	
	}
	else if (this.RIGHT){
		this.ar_c = this.ar_c_max;	
	}else{
		if (this.vr_c > 0){
			this.ar_c = -this.ar_c_triction;
		}else if (this.vr_c < 0){
			this.ar_c = this.ar_c_triction;			
		}else{
			this.ar_c = 0;
		}		
	}	
}

HeroUnit.prototype.setGravityV = function(){
	var arr = global.EnemyManager.vacuums;
	var d_min = 100000;
	var i_min = -1;
	var v_min = {x:0, y:0};
	for (var i=0; i<arr.length; i++){
		var v = vec_Get(this.x,this.y,arr[i].x, arr[i].y);
		if ((v.x <= global.EnemyManager.vacuumSize)&&((v.y <= global.EnemyManager.vacuumSize))){			
			var d = vec_Length(v);
			if ((d<d_min)&&(d<global.EnemyManager.vacuumSize)){
				i_min = i;
				d_min = d;
				v_min.x = v.x;
				v_min.y = v.y;
			}
		}
	}
	
	if ((i_min != -1)&&(d_min>15)){
		v_min = vec_Scale(v_min,100);
		this.g_vx = v_min.x;		
		this.g_vy = v_min.y;		
	}else{
		this.g_vx =0;
		this.g_vy =0;		
	}
}

HeroUnit.prototype.startFire = function(){
	this.start_fire_time = global.gameTime;	
}


HeroUnit.prototype.move = function(elapsedTime)
{	
	this.drawFire();	
	this.check_glow_green_vis();
	this.check_glow_red_vis();
	this.whiteShieldDecide();
	this.regenerateHealth();
	var dt = elapsedTime/1000;
	if (global.staticControl){
		this.staticKeyControlling();		
	}else{
		this.relativeKeyControlling();	
	}
	
	
	var tempvrc = this.vr_c;
	this.vr_c += this.ar_c * dt;
	if (tempvrc * this.vr_c < 0){
		this.vr_c = 0;
	}
	if (this.vr_c > this.vr_c_max ){
		this.vr_c = this.vr_c_max;
	}else if (this.vr_c < -this.vr_c_max){
		this.vr_c = -this.vr_c_max;		
	}
	
	var newRotation = this.rotation+this.vr_c * dt;
	
	if ((getAngleDiff_grad(this.rotation, this.staticAngle) * getAngleDiff_grad(newRotation, this.staticAngle) <=0) && global.staticControl){
		this.rotation = this.staticAngle;
		this.vr_c = 0;
	}else{
		this.rotation=newRotation;	
	}
	
	
	
	this.angle = this.rotation/180 * Math.PI;
	
	var tempvc = this.v_c;
	this.v_c += this.a_c * dt;
	if (tempvc * this.v_c < 0){
		this.v_c = 0;
	}
	if (this.v_c > this.max_v_c_forward){
		this.v_c = this.max_v_c_forward;
	}else
	if (this.v_c < this.max_v_c_backward){
		this.v_c = this.max_v_c_backward;
	}
	
	var vx_c = this.v_c * Math.cos(this.angle);
	var vy_c = this.v_c * Math.sin(this.angle);
	if (!this.speedyMode){
		this.ss.getAnimation("run").frequency = Math.ceil(13 - this.v_c/this.max_v_c_forward * 10);		
	}else{
		this.ss.getAnimation("run").frequency = Math.ceil(11 - this.v_c/this.max_v_c_forward * 10);		
	}
	if (this.v_c == 0){
		this.ss.getAnimation("run").frequency = 100000;
	}
	
	this.old_x = this.x;
	this.old_y = this.y;
	
	this.setGravityV();
	this.x += (vx_c+this.g_vx)*dt;
	this.y += (vy_c+this.g_vy)*dt;
	
	if (this.x<this.bodySize){
		this.vx_c = 0;
		this.x = this.bodySize;
	}else
	if (this.x> global.levelWidth - this.bodySize){
		this.vx_c = 0;
		this.x = global.levelWidth - this.bodySize;
	}

	if (this.y<this.bodySize){
		this.vy_c = 0;
		this.y = this.bodySize;
	}else
	if (this.y> global.levelHeight - this.bodySize){
		this.vy_c = 0;
		this.y = global.levelHeight - this.bodySize;		
	}	
	
	this.rotationSheild();
	this.setActualShieldSegments();	
	
	this.reflect(elapsedTime);
	
	
	this.checkHitBullet();
	
	if (this.speedyMode)
	{
		this.speedTime -= elapsedTime;
		if (this.speedTime <= 0)
		{
			this.speedyMode = false;
			this.max_v_c_forward = this.current_forward;
			this.max_v_c_backward = this.current_backward;
		}
	}
	
	if (this.shieldScaleMode)
	{
		this.sheild.scaleX = this.sheild.scaleY = 1.5;
		this.shieldWidth = 150;
		this.shieldHeight = 15;
		this.shieldDist = 37.5;
		
		this.shieldScaleTime -= elapsedTime;
		if (this.shieldScaleTime <= 0)
		{
			this.shieldScaleMode = false;
			this.sheild.scaleX = this.sheild.scaleY = 1;
			this.shieldWidth = 100;
			this.shieldHeight = 10;
			this.shieldDist = 25;
		}
		this.underSheild.scaleX = this.underSheild.scaleY = this.sheild.scaleX;
	}
	
	
	if (this.fullProtectMode)
	{
		this.addChild(this.protectIcon);
		this.fullProtectTime -= elapsedTime;
		if (this.fullProtectTime <= 0)
		{
			this.removeChild(this.protectIcon);
			this.fullProtectMode = false;
		}
	}
	
	if (this.gunMode)
	{
		this.checkForShoot(elapsedTime);
		
		this.gunModeTime -= elapsedTime;
		if (this.gunModeTime <= 0)
		{
			this.gunMode = false;
		}
	}	
	
}

HeroUnit.prototype.checkForShoot = function(elapsedTime)
{
	this.respawnCount += elapsedTime;
	
	if (this.respawnCount >= this.respawnBullet)
	{
		this.fireSound();
		var vec1 = rotateVec( {x:+20, y:0}, this.angle);
		var bullet = global.BulletFactory.addBullet(BulletTypes.SHOT_GUN, this.rotation, this.x+vec1.x, this.y+vec1.y);
		bullet.setMyBullet();
		bullet.damage = this.damage;
		if (global.BulletFactory.doubleDamage) { bullet.setFireBullet(); }
		else { bullet.makeReflected(); }
			
		this.respawnCount = 0;
	}
}

/**
 * Поворот щита относительно курсора
 */
HeroUnit.prototype.rotationSheild = function (){
	this.dx = this.x - global.stage.mouseX - global.camera.lookAtX;
	this.dy = this.y - global.stage.mouseY - global.camera.lookAtY;
	
	this.sh_old_angle = this.sheildAngle;
	this.sheildAngle = Math.atan2(this.dy, this.dx)*180/Math.PI;	
	this.sheild.rotation = 180 + this.sheildAngle - this.rotation;
	this.underSheild.rotation = this.sheild.rotation;
}

HeroUnit.prototype.getRotationShieldArray = function(count){
	var res = [];
	var dangle2 = (this.sheildAngle - this.sh_old_angle)/(count-1);
	var dangle = getAngleDiff_grad(this.sh_old_angle, this.sheildAngle)/(count - 1);
	
	for (var i=0; i<count; i++){
		res[i] = this.sh_old_angle + dangle*i;
	}	
	return res;
}


HeroUnit.prototype.reflect = function(elapsedTime){
	this.segments_arr_counted = false;
	for (var i=0; i<global.BulletFactory.bullets.length; i++){
		var bullet = global.BulletFactory.bullets[i];
		if (Math.abs( bullet.x - this.x) < 1*this.shieldWidth){
			if (Math.abs( bullet.y - this.y) < 1*this.shieldWidth){				
					this.hardReflect(bullet, elapsedTime);
			}				
		}			
	}	
}




HeroUnit.prototype.hardReflect = function(b, elapsedTime){
	if (!this.segments_arr_counted){
		this.segments_arr_counted = true;
		segments_arr = this.getSieldSegmentsArray_usingOldandNow(100);	
	}
	var s = {};
	s.x1 = b.x;
	s.x2 = b.futureX;
	s.y1 = b.y;
	s.y2 = b.futureY;
	
	var Xsegment = null;
	var XX;
	
	var XsegmentNumber = -1;
	var distanceFromCornerToX;
	
	for (var seg_i = 0; seg_i<segments_arr.length; seg_i++){
		var X = [];
		var min_d = 9999;
		var d;
		var n_i = -1;
			
		for (var i=0; i<4; i++){
			X[i] = intersectSegments_obj(s,segments_arr[seg_i][i]);
			if (X[i]){
				d = Math.sqrt( (b.x-X[i].x)*(b.x-X[i].x) + (b.y-X[i].y)*(b.y-X[i].y));				
				if (d< min_d){
					min_d = d;
					n_i = i;
				}
			}		
		}
		if (n_i != -1){
			Xsegment = segments_arr[seg_i][n_i];
			XX = X[n_i];
			XsegmentNumber = n_i;
			distanceFromCornerToX = Math.sqrt((XX.x - Xsegment.x1)*(XX.x - Xsegment.x1) + (XX.y - Xsegment.y1)*(XX.y - Xsegment.y1));			
			break;
		}		
	}
	
	if (Xsegment){		
		var vecV = {};
		vecV.x = Math.cos(b.angle);
		vecV.y = Math.sin(b.angle);
		
		var vecP = {};
		vecP.x = Xsegment.x1 - Xsegment.x2; 
		vecP.y = Xsegment.y1 - Xsegment.y2;
		var vecN  = {};
		vecN.x = -vecP.y;
		vecN.y = vecP.x;
		vecN = vec_normal(vecN);
		vecP = vec_normal(vecP);
		
		var resV = {};
		var sMult = vecV.x * vecP.x + vecV.y*vecP.y;
		resV.x = 2*vecP.x*sMult - vecV.x;
		resV.y = 2*vecP.y*sMult - vecV.y;
		
	
		b.futureRotation = Math.atan2(resV.y, resV.x)*180/Math.PI;						
		
		var side = vec_Get(this.sh_segments[XsegmentNumber].x1, this.sh_segments[XsegmentNumber].y1, this.sh_segments[XsegmentNumber].x2, this.sh_segments[XsegmentNumber].y2);
		var perp = vec_Perp(side);
		perp = vec_normal(perp);
		side = vec_Scale(side, distanceFromCornerToX);
		var pointtomove = vec_Summ({x:this.sh_segments[XsegmentNumber].x1, y:this.sh_segments[XsegmentNumber].y1}, side);
		perp = vec_Scale(perp, b.speed*elapsedTime/1000);
		pointtomove = vec_Summ(pointtomove, perp);
		
		b.futureX = pointtomove.x;
		b.futureY = pointtomove.y;
		
		this.whiteShieldCount = 4;
		playRicochet();
		//если пуля попала в щит, она становится моей
		//это для бонуса двойного урона
		b.setMyBullet();
		if (global.BulletFactory.doubleDamage) { b.setFireBullet(); }
		else
			b.makeReflected();
	}
}


HeroUnit.prototype.getChanceFireAngle = function(x,y,v){
	var toV = this.getChanceFireCoords(x,y,v); 	
	return Math.atan2(toV.y -y, toV.x - x)*180/Math.PI;
}

HeroUnit.prototype.getChanceFireCoords = function(x,y,v){
	var vec = vec_Get(x,y,this.x,this.y);
	var d = vec_Length(vec);
	var toV = {x:0, y:0};
	var vv = v;
	if (vv==0){
		vv = 1;
	}
	toV.x = this.x + Math.cos(this.angle)*d*this.v_c/vv;
	toV.y = this.y + Math.sin(this.angle)*d*this.v_c/vv;	

	return toV;	
}


HeroUnit.prototype.getChanceFireAngle_simple = function(x,y,N){
	var toV = {x:0, y:0};	
	toV.x = this.x + Math.cos(this.angle)*N;
	toV.y = this.y + Math.sin(this.angle)*N;	
	return Math.atan2(toV.y -y, toV.x - x)*180/Math.PI;
}

