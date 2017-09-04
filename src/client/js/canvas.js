var global = require('./global');
/**
 * This is the class that holds a reference to the canvas object.
 * Here we will attach event listeners, and even write our drawing functions. (I think)
 */
class Canvas {
    constructor(canvasId = 'game_canvas') {
        //let this object control the canvas on the HTML page
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = global.screenWidth;
        this.canvas.height = global.screenHeight;

        //set the canvas's parent, this will be used for accessing fields like "keysPressed"
        this.canvas.parent = this;
        this.canvas.addEventListener('keydown',this.onKeyDown,false);
        this.canvas.addEventListener('keyup',this.onKeyUp,false);
        this.canvas.addEventListener('mousedown',this.onMouseDown,false);
        this.canvas.addEventListener('mouseup',this.onMouseUp,false);
        this.canvas.addEventListener('mousemove', this.onMouseMove, false);

        //will keep track of user input
        this.userInput = {
            keysPressed: {},
            mouseClicked:false,
            mouseAngle: 0
        };

        //set focus to canvas so that user input can be collected
        this.canvas.focus();
    }

    setHeight(height) {
        this.canvas.height = height;
    }

    setWidth(width) {
        this.canvas.width = width;
    }

    //get a reference to the canvas element
    getCanvas() {
        return this.canvas;
    }

    //get the component you can actually draw on
    getContext() {
        return this.canvas.getContext("2d");
    }

    //make the canvas blank
    clear() {
        this.getContext().clearRect(0,0,this.canvas.width,this.canvas.height);
    }

    //get the keys pressed from the canvas
    getUserInput() {
        return this.userInput;
    }

    /**
     * The onKeyUp and onKeyDown methods are used for maintaining the state of the keys
     * in the keysPressed object above.These methods should not be called outside of
     * this class, ideally, they would be private.
     */
    onKeyDown(event) {
        //don't register key events we haven't defined
        if(typeof global[event.keyCode] === 'undefined') {
            return;
        }
        this.parent.userInput.keysPressed[global[event.keyCode]] = true;
    }

    onKeyUp(event) {
        //don't register key events we haven't defined
        if(typeof global[event.keyCode] === 'undefined') {
            return;
        }            
        this.parent.userInput.keysPressed[global[event.keyCode]] = false;
    }


    onMouseDown(event) {
        this.parent.userInput.mouseClicked = true;
    }

    onMouseUp(event) {
        this.parent.userInput.mouseClicked = false;
    }

    //remember that y increases as you go DOWN the page, x increases as you go RIGHT on the page
    onMouseMove(event) {
        var x = this.width/2 - event.clientX;
        var y = this.height/2 - event.clientY;
        var angle;
        if(x >= 0 && y <= 0) {
            angle = Math.PI + Math.atan(Math.abs(y)/x);
        } else if(x <=0 && y >=0) {
            angle = Math.atan(y/Math.abs(x));
        } else if(x >= 0 && y >= 0) {
            angle = Math.PI - Math.atan(y/x);
        } else if(x <= 0 && y <= 0) {
            angle = 2*Math.PI - Math.atan(Math.abs(y)/Math.abs(x));
        }
        this.parent.userInput.mouseAngle = angle;
    }
}

module.exports = Canvas;