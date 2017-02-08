'use strict';
import {Response} from 'express';
import * as winston from 'winston';
import {Container} from 'typedi';
import {JsonController, Post, Res, Body} from 'routing-controllers';
import {BlockchainClient} from '../../blockchain/client/blockchainClient';
import {ClientAuthenticator, AuthenticationResponse} from '../../utils/ClientAuthenticator';
import {LoggerFactory} from '../../utils/LoggerFactory';

class LoginParams {
    public username: string;
    public password: string;
}

@JsonController()
export class AuthController {
    private logger: winston.LoggerInstance = Container.get(LoggerFactory).create();
    private blockchainClient: BlockchainClient = Container.get(BlockchainClient);

    @Post('/login')
    public async loginAsClient(@Body() loginParams: LoginParams, @Res() response: Response): Promise<AuthenticationResponse> {
        let clientAuthenticator = new ClientAuthenticator(
            this.logger,
            loginParams.username,
            loginParams.password,
            this.blockchainClient
        );

        try {
            return clientAuthenticator.authenticate();
        } catch (error) {
            return Promise.reject(<AuthenticationResponse>{
                success: false,
                message: 'Server error occurred'
            });
        }
    }
}