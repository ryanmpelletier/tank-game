var config = require('../../../config.json');
const SpatialHash = require('spatial-hash');

class SpatialHashManager {
    constructor() {
        const range = {
            x: 0,
            y: 0,
            width: config.gameWidth,
            height: config.gameHeight
        };
        const cellSize = config.track.width * config.track.height * 2;

        this.spatialHash1 = new SpatialHash(range, cellSize);
        this.spatialHash2 = new SpatialHash(range, cellSize);

        // Set active spatial hash to 1st initially
        this.activeSpatialHash = this.spatialHash1;
        this.spatialHash1.isActive = true;
        this.spatialHash2.isActive = false;

        this.maxSpatialHashSize = config.track.maxSpatialHashSize;
    }

    /**
     * Inserts a track into the active spatial hash.
     *
     * @param track - The track to insert.
     */
    insertTrack(track) {
        let spacialHashObject = track.forSpacialHash();

        // Check if 1st spatial hash is full and active
        if(this.spatialHash1.itemCount === this.maxSpatialHashSize && this.spatialHash1.isActive) {
            // Remove all tracks in spatial hash, so tracks can be added to it again
            this.spatialHash2.removeAll();

            // Change which spatial hash is active
            this.activeSpatialHash = this.spatialHash2;
            this.spatialHash1.isActive = false;
            this.spatialHash2.isActive = true;
        }

        // Check if 2nd spatial hash is full and active
        if(this.spatialHash2.itemCount === this.maxSpatialHashSize && this.spatialHash2.isActive) {
            // Remove all tracks in spatial hash, so tracks can be added to it again
            this.spatialHash1.removeAll();

            // Change which spatial hash is active
            this.activeSpatialHash = this.spatialHash1;
            this.spatialHash1.isActive = true;
            this.spatialHash2.isActive = false;
        }

        // Check if object already exists in this position
        // NOTE: Spatial hashes suffer a severe performance hit when objects are
        //       placed on top of each other, so this eliminates that issue
        if(!this.activeSpatialHash.any(spacialHashObject.range)) {
            // Add track to spatial hash
            this.activeSpatialHash.insert(spacialHashObject);
        }
    }

    /**
     * Queries a section of the game board and returns all tracks.
     *
     * @param range
     *          The section of the game board to query.
     * @returns {{tracks: Array}} The array of all tracks in the query area.
     */
    queryTracks(range) {
        let visibleTracks = [];

        this.spatialHash1.query(range, function(item) {
            visibleTracks.push(item.object);
        });

        this.spatialHash2.query(range, function(item) {
            visibleTracks.push(item.object);
        });

        return {
            "tracks": visibleTracks
        };
    }
}

module.exports = SpatialHashManager;