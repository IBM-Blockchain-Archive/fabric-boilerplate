import {Container} from 'typedi';
import {Get, Post, JsonController, Param, Body, Req, UseBefore} from 'routing-controllers';
import {JSONWebToken} from '../../utils/JSONWebToken';
import {Thing} from '../../entities/thing.model';
import {UserAuthenticatorMiddleware} from '../../middleware/UserAuthenticatorMiddleware';
import {BlockchainClient} from '../../blockchain/client/blockchainClient';

@JsonController('/things')
@UseBefore(UserAuthenticatorMiddleware)
export class ThingsController {
    private blockchainClient: BlockchainClient = Container.get(BlockchainClient);

    @Get('/:id')
    public getThingsByUserID(@Param('id') userID: string, @Req() request: any): any {
        let enrollmentID = new JSONWebToken(request).getUserID();

        return this.blockchainClient.query('getThingsByUserID', [userID], enrollmentID);
    }

    @Post('/')
    public post(@Body() thing: Thing, @Req() request: any): any {
        let enrollmentID = new JSONWebToken(request).getUserID();

        return this.blockchainClient.invoke('createThing', [JSON.stringify(thing)], enrollmentID);
    }
}