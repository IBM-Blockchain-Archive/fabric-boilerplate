import {Get, Post, JsonController, Param, Body, Req} from 'routing-controllers';
import {JSONWebToken} from '../../utils/JSONWebToken';
import {Thing} from '../../entities/thing.model';

@JsonController('/things')
export class ThingsController {

    @Get('/:id')
    public getThingsByUserID(@Param('id') userID: string, @Req() req: any): any {
        let enrollmentID = new JSONWebToken(req).getUserID();

        return req.blockchain.query('getThingsByUserID', [userID], enrollmentID);
    }

    @Post('/')
    public post(@Body() thing: Thing, @Req() req: any): any {
        let enrollmentID = new JSONWebToken(req).getUserID();

        return req.blockchain.invoke('createThing', [JSON.stringify(thing)], enrollmentID);
    }
}