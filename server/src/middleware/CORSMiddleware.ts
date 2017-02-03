import {Middleware, MiddlewareInterface} from 'routing-controllers';

@Middleware()
export class CORSMiddleware implements MiddlewareInterface {
    public use(request: any, response: any, next?: (err?: any) => any): any {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');

        next();
    }
}
