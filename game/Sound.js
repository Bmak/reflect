SoundManager = function(){
	this.MAX_NUM_SOUNDS = 5;
	this.main_sounds = [];
	this.sounds = [];
}

SoundManager.prototype.play = function(v,level,main){
	if (global.useSoundBuffer){
		if (main){
			this.playMainSound(v,level);
		}else{
			this.playSound(v,level);
		}		
	}else{
		this.playNormalSound(v,level);
	}
}

SoundManager.prototype.playNormalSound = function(v,level){
	createjs.SoundJS.play(v, createjs.SoundJS.INTERRUPT_EARLY, 0, 0, false, level);
}

SoundManager.prototype.getSoundCount = function(){
	return this.main_sounds.length + this.sounds.length;
}

SoundManager.prototype.createSound = function(v,level, main){
	var s = createjs.SoundJS.play(v, createjs.SoundJS.INTERRUPT_EARLY, 0, 0, false, level);
	if (main){
		s.onComplete = this.onMainSoundFinish;
	}else{
		s.onComplete = this.onSoundFinish;
	}
	return s;	
}

SoundManager.prototype.onMainSoundFinish = function(){
	var i = global.soundManager.main_sounds.indexOf(this);
	if (i!=-1){
		global.soundManager.main_sounds.splice(i,1);				
	}	
}

SoundManager.prototype.onSoundFinish = function(){
	var i = global.soundManager.sounds.indexOf(this);
	if (i!=-1){
		global.soundManager.sounds.splice(i,1);						
	}	
}


SoundManager.prototype.playMainSound = function(v,level){
	if (this.getSoundCount() < this.MAX_NUM_SOUNDS){
		this.main_sounds.push(this.createSound(v,level,true));		
	}else
	if (this.sounds.length > 0){
		//this.sounds[0].stop();
		this.stopSound(this.sounds[0]);		
		this.sounds.shift();
		this.main_sounds.push(this.createSound(v,level,true));
	}else{		
		//this.main_sounds[0].stop();
		this.stopSound(this.sounds[0]);
		this.main_sounds.shift();
		this.main_sounds.push(this.createSound(v,level,true));		
	}
}

SoundManager.prototype.playSound = function(v,level){
	if (this.getSoundCount() < this.MAX_NUM_SOUNDS){
		this.sounds.push(this.createSound(v,level,false));
	}else
	if (this.main_sounds.length < this.MAX_NUM_SOUNDS){
		this.stopSound(this.sounds[0]);
		//this.sounds[0].stop();
		this.sounds.shift();
		this.sounds.push(this.createSound(v,level,false));		
	}
	
}

SoundManager.prototype.stopSound = function(s){
	//return;
	if (
			(s != undefined)&&
			(s.playState != createjs.SoundJS.PLAY_FINISHED) &&
			(s.paused != true) &&
			(s.tag != null)&&
			(s.getPosition() != 0)
		)
		s.stop();
}

function playSound(v, level, main){
	if(!level) level = 1;
	if(!main) main = false;
	if(global.volumePanel.sound){
		global.soundManager.play(v,level,main);
	}
}


function playRicochet(){
	var n = randomNumber(1,3);	
	playSound("ricochet"+n.toString(),1,true);
}

function playFire(){
	var n = randomNumber(1,7);	
	playSound("fire"+n.toString());
}

function playExp(){
	var n = randomNumber(1,7);	
	playSound("exp"+n.toString());
}

function playDamage(){
	playSound("damage");
}
