import {LoggerSettings} from './utils/LoggerSettings';
import * as path from 'path';
import * as winston from 'winston';
import {ChaincodeLocalConfig} from './blockchain/ChaincodeLocalConfig';
import {BlockchainLocal} from './blockchain/BlockchainLocal';
import { DeployPolicy } from './blockchain/Blockchain';

class TestChaincode {
    public async run(): Promise<any> {
        let logger     = new winston.Logger(new LoggerSettings().getLoggerSettings());
        let blockchain = new BlockchainLocal(logger, path.join(process.cwd(), 'server'), new ChaincodeLocalConfig().getConfiguration());

        let cid = await blockchain.init(DeployPolicy.NEVER);
        let client = await blockchain.createClient(cid);
        return client.query('getHomeUsage', ['passw0rd'], 'john');
    }
}

new TestChaincode().run().then((result: any) => {
    console.log('Query complete, results are: ');
    console.log(result);
    process.exit(0);
}, (err: Error) => {
    throw err;
});
