class Playground extends Phaser.Scene {
    constructor() {
        super("playground");
    }

    create() {
        this.input.keyboard.on('keydown-A', () => this.host());
        this.input.keyboard.on('keydown-B', () => this.join());

        this.pawnsById = {};
        this.connections = [];
    }

    host() {
        let hostId = prompt('Peer id (for hosting)', 'PeerPressure');

        let host = new Peer(hostId);
        host.on('connection', (playerConnection) => {
            console.log('Got connection from ', playerConnection.peer);
            this.connections.push(playerConnection);
            playerConnection.on('data', (msg) => {
                this.handleUpdate(msg);
                for(let otherConnection of this.connections) {
                    otherConnection.send(msg); // relay msg to all players
                }
            });
        });
    }

    join() {
        let hostId = prompt('Peer id (for joining)', 'PeerPressure');
        let peer = new Peer();
        
        peer.on('open', (id) => {
            console.log('I am', id);
            let hostConnection = peer.connect(hostId);
            hostConnection.on('open', () => {
                console.log('I am connected to host', hostConnection.peer);
                this.input.on('pointermove', (pointer) => {
                    hostConnection.send({id: id, x: pointer.x, y: pointer.y});
                });
            });
            hostConnection.on('data', msg => this.handleUpdate(msg));
        });
    }

    handleUpdate(msg) {
        let {id,x,y} = msg;
        if (this.pawnsById[id] === undefined) {
            this.pawnsById[id] = this.makePawn(id);
        }
        let pawn = this.pawnsById[id];
        pawn.x = x;
        pawn.y = y;
    }

    makePawn(id) {
        let pawn = this.add.graphics();
        pawn.fillStyle(0xFFFFFF, 1.0);
        pawn.fillRect(0,0,10,10);
        return pawn;
    }
}

const game = new Phaser.Game({
    scene: [Playground]
});