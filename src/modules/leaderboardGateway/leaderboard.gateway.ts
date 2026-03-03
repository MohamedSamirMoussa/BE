
import { ILeaderboardSocket } from '../gateway';
import { LeaderboardEvents } from './leaderboard.events';

export class LeaderboardGateway {
    private LeaderboardEvents:LeaderboardEvents = new LeaderboardEvents();
    constructor() {}

    register = (socket:ILeaderboardSocket)=>{
     this.LeaderboardEvents.selectServerHandler(socket)
    }
}