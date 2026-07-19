import * as Mongo from "mongodb";
import {
    DB_USER,
    DB_PW,
    DB_URL,
    DB_NAME,
} from '$env/static/private';
import { delay } from "./utils";
import type { RTEvent, RTGame } from "../types";

export class Database {
    static instance: Database | null;

    client!: Mongo.MongoClient;
    connected: boolean = false;
    private games!: Mongo.Collection<RTGame>
    private events!: Mongo.Collection<RTEvent>

    constructor() {
        if (Database.instance) return Database.instance;
        let options: Mongo.MongoClientOptions = {};
        let url: string = `mongodb+srv://${DB_USER}:${DB_PW}@${DB_URL}`;
        if (!DB_USER || !DB_PW) {
            url = `mongodb://${DB_URL}`;
        }
        this.client = new Mongo.MongoClient(url, options);
        this.connected = false;
        this.connect();

        Database.instance = this;
    }

    private async connect() {
        if (this.connected) return;
        await this.client.connect();
        const db = this.client.db(DB_NAME);

        this.games = db.collection<RTGame>("games");
        this.games.createIndex({ event: 1, id: 1 }, { unique: true });

        this.events = db.collection<RTEvent>("events");
        this.events.createIndex({ id: 1 }, { unique: true });

        this.connected = true;
        console.log("DB Connected.")
    }

    async ready() {
        return new Promise<void>(async (resolve, reject) => {
            for (let i: number = 0; i < 50; i++) {
                if (this.connected) {
                    resolve();
                    return;
                }
                await delay(100);
            }
            reject();
        });
    }

    //#region Games
    async addOrModifyGame(game: RTGame, oldId: number = game.id): Promise<void> {
        await this.games.findOneAndReplace({ id: oldId, event: game.event }, game, { upsert: true });
    }

    async getGame(id: number, event: string): Promise<RTGame | null> {
        return this.games.findOne({ id, event }, { projection: { _id: 0 } });
    }

    async getAllGames(): Promise<RTGame[]> {
        return this.games.find({}, { projection: { _id: 0 } }).toArray();
    }
    async getAllGamesOfOneEvent(event: string): Promise<RTGame[]> {
        return this.games.find({ event }, { projection: { _id: 0 } }).toArray();
    }
    //#endregion

    //#region Events
    async getAllEvents(): Promise<RTEvent[]> {
        return this.events.find({}, {projection: {_id: 0}}).toArray();
    }
    //#endregion
}