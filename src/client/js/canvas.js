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
        //set the canvas's parent, this will be used for accessing fields like "keysPressed"
        this.canvas.parent = this;
        this.canvas.addEventListener('keydown',this.onKeyDown,false);
        this.canvas.addEventListener('keyup',this.onKeyUp,false);
        //will keep track of the state of key events which are defined in global.js with keycodes
        this.keysPressed = {}
    }

    //get the keys pressed from the canvas
    getKeysPressed(){
        return this.keysPressed;
    }

    //get the component you can actually draw on
    getContext(){
        return this.canvas.getContext("2d");
    }

    //make the canvas blank
    clear(){
        this.getContext().clearRect(0,0,this.canvas.width,this.canvas.height);
    }

    /**
     * The onKeyUp and onKeyDown methods are used for maintaining the state of the keys
     * in the keysPressed object above.These methods should not be called outside of
     * this class, ideally, they would be private.
     */

    onKeyDown(event){
        //don't register key events we haven't defined
        if(typeof global[event.keyCode] === 'undefined'){
            return;
        }
        this.parent.keysPressed[global[event.keyCode]] = true;
    }

    onKeyUp(event){
        //don't register key events we haven't defined
        if(typeof global[event.keyCode] === 'undefined'){
            return;
        }            
        this.parent.keysPressed[global[event.keyCode]] = false;
    }

}

module.exports = Canvas;