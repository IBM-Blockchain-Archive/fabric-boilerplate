import {Middleware, MiddlewareInterface} from 'routing-controllers';
import {Config} from '../config';
import * as jwt from 'jsonwebtoken';
import { JSONWebToken } from '../utils/JSONWebToken';

@Middleware()
export class UserAuthenticatorMiddleware implements MiddlewareInterface {
    public use(request: any, response: any, next?: (err?: any) => any): any {
        let token = JSONWebToken.getTokenFromRequest(request);
        if (!token) {
            return response.status(403).json({
                success: false,
                message: 'No token provided.'
            });
        }

        jwt.verify(token, new Config().getSecret(), (err: any, decoded: any) => {
            if (err) {
                return response.status(403).json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            }

            // if everything is good, save to request for use in other routes
            request.decoded = decoded;
            next();
        });
    }
}
