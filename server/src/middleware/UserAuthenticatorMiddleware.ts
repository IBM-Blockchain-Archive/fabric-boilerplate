import {Middleware, MiddlewareInterface} from 'routing-controllers';
import {Config} from '../config';
import * as jwt from 'jsonwebtoken';
import { JSONWebToken } from '../utils/JSONWebToken';
import {AuthenticationResponse} from '../utils/ClientAuthenticator';

@Middleware()
export class UserAuthenticatorMiddleware implements MiddlewareInterface {
    public use(request: any, response: any, next?: (err?: any) => any): any {
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');

        let token = JSONWebToken.getTokenFromRequest(request);
        if (!token) {
            return this.failAuthentication(response, 'No token provided.');
        }

        jwt.verify(token, new Config().getSecret(), (err: any, decoded: any) => {
            if (err) {
                return this.failAuthentication(response, 'Failed to authenticate token.');
            }
            next();
        });
    }

    private failAuthentication(response: any, message: string): void {
         response.status(403).json(<AuthenticationResponse>{
            success: false,
            message: message
        });
    }
}
