var global = require('./global');
/**
 * This is the class that holds a reference to the canvas object.
 * Here we will attach event listeners, and even write our drawing functions. (I think)
 */
class Canvas{
    constructor(){
        //let this object control the canvas on the HTML page
        this.canvas = document.getElementById('game_canvas');
        this.canvas.width = global.screenWidth;
        this.canvas.height = global.screenHeight;

        this.canvas.addEventListener('keydown',this.onKeyDown);
        this.canvas.addEventListener('keyup',this.onKeyUp);
    }

    onKeyUp(event){
        console.log(event.keyCode);
    }

    onKeyDown(event){
        console.log(event.keyCode);
    }

    //get the component you can actually draw on
    getContext(){
        return this.canvas.getContext("2d");
    }

    //make the canvas blank
    clear(){
        this.getContext().clearRect(0,0,this.canvas.width,this.canvas.height);
    }

}

module.exports = Canvas;