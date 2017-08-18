module.exports = {
    'screenWidth': window.innerWidth,
    'screenHeight': window.innerHeight,
    '65': 'KEY_LEFT',
    '87': 'KEY_UP',
    '68': 'KEY_RIGHT',
    '83': 'KEY_DOWN',
    'drawing':{
        'drawingOrder': ["perspective", "tracks", "tanks", "bullets", "walls", "ammo", "playerInfo", "scoreboard"],
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
        'scoreboard':{
            'scoreboardHeadingFont': 'bold 18px Arial',
            'heading':{x:115, y:25},
            'scoreboardXOffset': 115,
            'scoreboardYOffset': 50,
            'scoreboardLineSpacing':25,
            'font': '15px Arial',
            'fontColor':'black'
        },
        'tank':{
            'hullHeightScaleFactor': .33,
            'hullWidthScaleFactor': .33,
            'gunHeightScaleFactor': .33,
            'gunWidthScaleFactor': .33
        }
    }
};
