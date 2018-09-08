module.exports = {
    'screenWidth': window.innerWidth,
    'screenHeight': window.innerHeight,
    "clientCheckinInterval": 15,
    '32': 'KEY_SPACE',
    '65': 'KEY_LEFT',
    '87': 'KEY_UP',
    '68': 'KEY_RIGHT',
    '83': 'KEY_DOWN',
    'drawing':{
        'drawingOrder': ["perspective", "tracks", "tanks", "bullets", "walls", "ammo", "playerInfo", "scoreboard", "radar"],
        'ammo':{
            'tankXOffset': 45,
            'tankYOffset':40,
            'width':5,
            'height':10,
            'spacing': 4,
            'fill': 'black'
        },
        'playerInfo':{
            'tankXOffset': -55,
            'tankYOffset': -48,
            'font':'18px Arial',
            'fontColor': 'black'
        },
        'tank':{
            'hullHeightScaleFactor': .33,
            'hullWidthScaleFactor': .33,
            'gunHeightScaleFactor': .33,
            'gunWidthScaleFactor': .33
        },
        'radar':{
            'height': 200,
            'width': 200,
            'bottomPadding': 40,
            'rightPadding': 6,
            'backgroundFill': 'rgba(128,128,128,0.5)',
            'wallFill': 'rgba(0,0,0,0.5)',
            'tankWidth': 85,
            'tankHeight': 85,
            'tankFill': 'rgba(255,0,0,0.5)',
            'selfTankFill':'rgba(255,255,255,0.5)'
        }
    }
};
