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

        this.cameras.main.setBackgroundColor('#200');
        this.add.text(0,0,'HOST '+ hostId, {fontSize: 64}).alpha = 0.25;

        let peer = new Peer(hostId);

        peer.on('connection', (playerConnection) => {

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

        this.cameras.main.setBackgroundColor('#020');
        this.add.text(0,64,'HOST '+ hostId, {fontSize: 16}).alpha = 0.25;

        let peer = new Peer();
        
        peer.on('open', (id) => {
            this.add.text(0,80,'PEER '+ id, {fontSize: 16}).alpha = 0.25;
            let hostConnection = peer.connect(hostId);
            hostConnection.on('open', () => {
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
            let freshPawn = this.makePawn(id);
            this.pawnsById[id] = freshPawn;
            this.tweens.add({
                targets: freshPawn,
                scale: {from: 0.8, to: 1},
                alpha: {from: 0.0, to: 1.0},
                duration: 250,
                ease: 'Cubic.Out'
            });
        }
        let pawn = this.pawnsById[id];
        pawn.x = x;
        pawn.y = y;
    }

    makePawn(id) {
        let box = this.add.graphics();
        box.fillStyle(0xFFFFFF, 1.0);
        box.fillRect(-5,-5,10,10);
        let label = this.add.text(10,-5, id, {fontSize: 10, color: '#8F8'});
        let container = this.add.container(0,0);
        container.add(box);
        container.add(label);
        return container;
    }
}

const game = new Phaser.Game({
    scene: [Playground]
});