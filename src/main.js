class Playground extends Phaser.Scene {
    constructor() {
        super("playground");
    }

    create() {
        this.input.keyboard.on('keydown-A', () => this.host());
        this.input.keyboard.on('keydown-B', () => this.join());
    }

    host() {
        let hostId = prompt('Peer id (for hosting)', 'PeerPressure');

        let peer = new Peer(hostId);
        peer.on('open', function(id) {
            console.log('open with', id);
        });
        peer.on('connection', (conn) => {
            console.log('connection with ', conn);
            let player = this.makePlayer(conn.id);
            conn.on('data', (data) => {
                console.log('data!', data, conn);
                let {x,y} = data;
                player.x = x;
                player.y = y;
            });
        });
    }

    join() {
        let hostId = prompt('Peer id (for joining)', 'PeerPressure');
        let peer = new Peer();
        
        peer.on('open', (id) => {
            console.log('open with', id);
            let player = this.makePlayer(id);
            let conn = peer.connect(hostId);
            conn.on('open', () => {
                console.log('connected to host');
                this.input.on('pointermove', (pointer) => {
                    console.log(pointer);
                    player.x = pointer.x;
                    player.y = pointer.y;
                    conn.send({x: player.x, y: player.y});
                });
            });
        });
        
    }

    makePlayer(id) {
        let player = this.add.graphics();
        player.fillStyle(0xFFFFFF, 1.0);
        player.fillRect(0,0,10,10);
        return player;
    }
}

const game = new Phaser.Game({
    scene: [Playground]
});