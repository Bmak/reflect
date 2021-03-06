/**
 * @author ProBigi
 */


function BaseBullet()
{
	BaseBullet.superclass.constructor.apply(this);
	
	this.futureX;
	this.futureY;
	this.futureRotation;
	
	this.view;
	this.speed;
	this.type;
	this.damage;
	
	this.isMy = false;
	this.fireMode = false;
}

extend(BaseBullet, createjs.Container);

BaseBullet.prototype.init = function(angle, x, y) { }
BaseBullet.prototype.initView = function(x,y) { }
BaseBullet.prototype.initOptions = function(angle) { }
BaseBullet.prototype.move = function(elapsedTime) { }
BaseBullet.prototype.blow = function() { }

BaseBullet.prototype.checkOutOfStage = function()
{
	if (this.x > global.levelWidth) { return false; }
	else if (this.x < 0) { return false; }
	if (this.y >= global.levelHeight) { return false; }
	else if (this.y < 0) { return false; }
		
	return true;
}


BaseBullet.prototype.getAngleToUnit = function(unit) {
	this.dx = this.x - unit.x;
	this.dy = this.y - unit.y;
	
	this.angle = Math.atan2(this.dy, this.dx)*180/Math.PI;
	
	return (180 + this.angle);
}

BaseBullet.prototype.clearData = function() {
	//TODO bulletClearData
}
