module.exports = {
    'screenWidth': window.innerWidth,
    'screenHeight': window.innerHeight,
    '65': 'KEY_LEFT',
    '87': 'KEY_UP',
    '68': 'KEY_RIGHT',
    '83': 'KEY_DOWN',
    'drawing':{
        'drawingOrder': ["perspective", "tanks", "bullets", "walls", "ammo"],
        'ammo':{
            'tankXOffset': 50,
            'tankYOffset':60,
            'width':7,
            'height':12,
            'spacing': 5,
            'fill': 'black'
        }
    }
};
