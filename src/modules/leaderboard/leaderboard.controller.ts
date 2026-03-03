import { Router } from "express";
import  leaderboardServices from './leaderboard.services'
import { authentication, authorization } from "../../middleware";
import { endpoint } from "../user/user.authorization";
export const router:Router = Router({
    strict:true,
    caseSensitive:true,
    mergeParams:true
})



router.get('/' , leaderboardServices.getLeaderBoard)
router.get('/search' , leaderboardServices.searchPlayers)
router.patch('/:username' , authentication() , authorization(endpoint.block) , leaderboardServices.toggleSupporter)
router.delete('/'   , authentication() , authorization(endpoint.block) , leaderboardServices.deleteServer)




