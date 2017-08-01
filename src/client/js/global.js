module.exports = {
    'screenWidth': window.innerWidth,
    'screenHeight': window.innerHeight,
    '65': 'KEY_LEFT',
    '87': 'KEY_UP',
    '68': 'KEY_RIGHT',
    '83': 'KEY_DOWN',
    'drawing':{
        'drawingOrder': ["perspective", "tanks", "bullets", "walls", "ammo", "playerInfo", "scoreboard"],
        'ammo':{
            'tankXOffset': 50,
            'tankYOffset':60,
            'width':7,
            'height':12,
            'spacing': 5,
            'fill': 'black'
        },
        "playerInfo":{
            'tankXOffset': -75,
            'tankYOffset': -68,
            'font':'18px Arial',
            'fontColor': 'black'
        }
    }
};
