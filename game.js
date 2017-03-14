  /**
* Created with crafty.
* User: gman6500
* Date: 2015-09-04
* Time: 02:58 PM
* To change this template use Tools | Templates.
*/
var enemyProperties={
    speed:100,
    spawnTime:750
};
var Game={
    width:2000,
    height:2000,
    money:0,
    //                      max   min   min
    wallNum:Math.random() * (100 - 50) + 50,
};
var bulletTimer=true;
var fireRate=500;
var upgradeCost=1;


setInterval(function(){
    enemyProperties.speed=enemyProperties.speed*1.006;
},2000)

Crafty.init(window.innerWidth-23,window.innerHeight-24, document.getElementById('game'));

function upgradeWeapon(){
    Game.money-=upgradeCost;
    upgradeCost=Math.ceil(upgradeCost*1.5);
    fireRate=Math.floor(fireRate/1.5);
    moneyDisplay.text("Money: "+Game.money);
    upgradeDisplay.text("Press E to Upgrade. Cost: "+upgradeCost);
}



var isAlive=true;
var bulletSpeed=4;
var moneyDisplay= Crafty.e('2D,DOM,Text')
    .attr({
        x:-160,
        y:-50
    })
    .one("EnterFrame",function(){
        this.text("Money: 0")
    });
var upgradeDisplay= Crafty.e('2D,DOM,Text')
    .attr({
        x:1100,
        y:-50
    })
    .one("EnterFrame",function(){
        this.text("Press E to Upgrade. Cost: "+upgradeCost);
    });


makeBorder();
generateWalls();

function makeWall(){
    var newWall=
            Crafty.e('2D,Canvas,Color,Wall,Collision')
                .attr({x: Math.random() * (Game.width - 5) + 5, y: Math.random() * (Game.height - 5) + 5, w:Math.random() * (150- 15) + 15, h: Math.random() * (150- 15) + 15})
                .color('green')
                .one('EnterFrame',function(){
                    if(this.hit("Player")){
                        this.destroy();
                        makeWall();
                    }
                });
}
function generateWalls(){
    for(i=0;i<Game.wallNum;i++){
        makeWall();
    }
}
function makeBorder(){
    //makes border walls
    Crafty.e('2D,Canvas,Color,Wall,Collision')
        .attr({x: 0, y: 0, w:Game.width, h: 5})
        .color('green');
    Crafty.e('2D,Canvas,Color,Wall,Collision')
        .attr({x: 0, y: Game.height-5, w:Game.width, h: 5})
        .color('green');
    Crafty.e('2D,Canvas,Color,Wall,Collision')
        .attr({x: 0, y: 0, w:5, h: Game.height})
        .color('green');
    Crafty.e('2D,Canvas,Color,Wall,Collision')
        .attr({x: Game.width-5, y: 0, w:5, h: Game.height})
        .color('green');
}



//Pre enemy defining
var enemy= Crafty.e('2D,Canvas,Color,Enemy,Collision')
    .attr({x: 300, y: 50, w:10, h: 10, beforeX:300, beforeY:50})
    .color('red');
//starts with clean slate
enemy.destroy();

//makes player
var player= Crafty.e('2D, Canvas, Color, Multiway, Collision, Player')
    .attr({x: 500, y: 250, w:10, h: 10})
    .attach(moneyDisplay)
    .attach(upgradeDisplay)
    .color('#F00')
    .multiway(3,{
        W: -90, S: 90, D: 0, A: 180
    })
    .onHit("Enemy",function(){
        isAlive=false;
        
        this.destroy();
        location.reload();
    })
    .bind('Moved', function(from) {
        if(player.hit('Wall')){
           this.attr({x: from.x, y:from.y});
        }
    });

Crafty.viewport.clampToEntities = false;
Crafty.viewport.follow(player,0,0);

//bullet "shell" for later use and modifacation in spawning enemies
var bullet= Crafty.e('2D,Canvas,Color,Bullet,Collision')
    .attr({x:-3,y:-3,w:3,h:3})
    .color('blue');
    
//gets rid of initial bullet
bullet.destroy();
//Function for spawning an enemy
function spawnChaser(){
    console.log("About to spawn enemy");
    var newEnemy= enemy.clone();
    
    console.log("made a new enemy");
    console.log("spawning its x");
    newEnemy.x=Math.random() * (Game.width - 1) + 1;
    console.log("spawning the y");
    newEnemy.y=Math.random() * (Game.height - 1) + 1;
    newEnemy.one('EnterFrame',function(){
        var temp = this.hit('Player');
        if(temp){
            this.destroy();
            spawnChaser();
        }
    })
    newEnemy.beforeX=newEnemy.x;
    newEnemy.beforeY=newEnemy.y;
    newEnemy.one("EnterFrame",function(){
        if(this.hit("Wall")){
            this.destroy();
            spawnChaser();
        }
    });
    console.log("binding chase commands")
    newEnemy.bind('EnterFrame', function(eventData){
        var bulletHit=newEnemy.hit("Bullet");
            if (bulletHit) {
//                 alert("got it")
                Game.money++;
                moneyDisplay.text("Money: "+Game.money);
//                 alert("fds")
                
                var bulletHit = bulletHit[0].obj;
                bulletHit.destroy();
                this.destroy();
                
            }
        if(player.x<this.x){
            this.x = this.x - enemyProperties.speed * (eventData.dt / 1000);
            if(this.hit('Wall')){
                this.requires('2D,Canvas,Color,Enemy,Collision')
                this.x= this.beforeX;
            }
            if(this.hit('Enemy')){
                this.requires('2D,Canvas,Color,Enemy,Collision')
                this.x= this.beforeX;
            }

        }
        
        if(player.x>this.x){
            this.x = this.x + enemyProperties.speed * (eventData.dt / 1000);
            if(this.hit('Wall')){
                this.requires('2D,Canvas,Color,Enemy,Collision')
                this.x= this.beforeX;
            }
            if(this.hit('Enemy')){
                this.requires('2D,Canvas,Color,Enemy,Collision')
                this.x= this.beforeX;
            }
        }
        if(player.y>this.y){
            this.y = this.y + enemyProperties.speed * (eventData.dt / 1000);
            if(this.hit('Wall')){
                this.requires('2D,Canvas,Color,Enemy,Collision')
                this.y= this.beforeY;
            }
            if(this.hit('Enemy')){
                this.requires('2D,Canvas,Color,Enemy,Collision')
                this.y= this.beforeY;
            }
        }
        if(player.y<this.y){
            this.y = this.y - enemyProperties.speed * (eventData.dt / 1000);
            if(this.hit('Wall')){
                this.requires('2D,Canvas,Color,Enemy,Collision')
                this.y= this.beforeY;
            }
            if(this.hit('Enemy')){
                this.requires('2D,Canvas,Color,Enemy,Collision')
                this.y= this.beforeY;
            }
            
        }
        
        this.beforeX=this.x;
        this.beforeY=this.y;
    })
    
    console.log("finished spawning");
}


//This starts spawning enemies
setInterval(function(){
    spawnChaser();
},enemyProperties.spawnTime);

//Shoots bullets when arrow keys are hit

$(document).keydown(function(e){
    if(bulletTimer){
        bulletTimer=false;
        setTimeout(resetBulletTimer,fireRate)
        if(isAlive){

            switch(e.which){
            case 37:

                var newBullet=bullet.clone();
                newBullet.x=player.x;
                newBullet.y=player.y;
                var counter=0;
                newBullet.bind('EnterFrame', function() {

                    if(this.hit('Wall')){
                        newBullet.destroy();
                    }
                });
                    setInterval(function(){

                        if(counter<50){
                            newBullet.x=newBullet.x-bulletSpeed
                            counter++;
                            if(this.hit('Enemy')){
                                alert("ENEMY HIT BULLET 6")
                                this.destroy();
                            }
                        }else{
                            newBullet.destroy();
                            return;
                        }
                    },10);
            break;
            case 38:

                var newBullet=bullet.clone();
                newBullet.x=player.x;
                newBullet.y=player.y;
                var counter=0;
                newBullet.bind('EnterFrame', function(from) {
                    if(this.hit('Wall')){
                        newBullet.destroy();
                    }
                });
                    setInterval(function(){
                        if(counter<50){
                            newBullet.y=newBullet.y-bulletSpeed
                            counter++
                        }else{
                            newBullet.destroy();
                            return;
                        }
                    },10);
                newBullet.x=player.x;
                newBullet.y=player.y;
            break;
            case 39:

                var newBullet=bullet.clone();
                newBullet.x=player.x;
                newBullet.y=player.y;
                var counter=0;
                newBullet.bind('EnterFrame', function(from) {
                    if(this.hit('Wall')){
                        newBullet.destroy();
                    }
                });
                    setInterval(function(){
                        if(counter<50){
                            newBullet.x=newBullet.x+bulletSpeed
                            counter++
                        }else{
                            newBullet.destroy();
                            return;
                        }
                    },10);
            break;
            case 40:

                var newBullet=bullet.clone();
                newBullet.x=player.x;
                newBullet.y=player.y;
                var counter=0;
                newBullet.bind('EnterFrame', function(from) {
                    if(this.hit('Wall')){
                        newBullet.destroy();
                    }
                });
                    setInterval(function(){
                        if(counter<50){
                            newBullet.y=newBullet.y+bulletSpeed
                            counter++
                        }else{
                            newBullet.destroy();
                            return;
                        }
                    },10);
                newBullet.x=player.x;
                newBullet.y=player.y;
            break;
                case 69:
                    upgradeWeapon();
                break;
            }
        }else{

        }
    }
})

function resetBulletTimer(){
    bulletTimer=true;
}


// TO DO:
// 
// Design more enemy types
// Upgrades?
// Bullet spray?
// Villages????