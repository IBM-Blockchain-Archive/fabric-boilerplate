import {Get, Post, JsonController, Param, Body, Req, UseBefore} from 'routing-controllers';
import {JSONWebToken} from '../../utils/JSONWebToken';
import {Thing} from '../../entities/thing.model';
import {UserAuthenticatorMiddleware} from '../../middleware/UserAuthenticatorMiddleware';
import {CORSMiddleware} from '../../middleware/CORSMiddleware';

@JsonController('/things')
@UseBefore(UserAuthenticatorMiddleware, CORSMiddleware)
export class ThingsController {
    @Get('/:id')
    public getThingsByUserID(@Param('id') userID: string, @Req() request: any): any {
        let enrollmentID = new JSONWebToken(request).getUserID();

        return request.blockchain.query('getThingsByUserID', [userID], enrollmentID);
    }

    @Post('/')
    public post(@Body() thing: Thing, @Req() request: any): any {
        let enrollmentID = new JSONWebToken(request).getUserID();

        return request.blockchain.invoke('createThing', [JSON.stringify(thing)], enrollmentID);
    }
}