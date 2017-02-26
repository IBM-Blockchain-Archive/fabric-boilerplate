import { ChaincodeEnvironmentConfiguration, UserConfig } from './ChaincodeEnvironmentConfiguration';

export class ChaincodeBluemixConfig {
  public getConfiguration(): ChaincodeEnvironmentConfiguration {
    const credentials = require('../../resources/credentials.json').credentials;
    const users = require('../../resources/testData.json').users;
    let env = <ChaincodeEnvironmentConfiguration>{
      network: credentials,
      chaincode: {
        keyValStorePath: '../resources/keyValueStore-bluemix',
        chaincodeIdPath: '../resources/chaincodeId-bluemix',
        path: 'src/build-chaincode',
        certPath: '../resources/certificate.pem',
        certPath2: '../../blockchain/src/build-chaincode/certificate.pem'
      }
    };
    // Add users from testdata
    env.network.users = env.network.users.concat(users.map((user: any) => {
          return <UserConfig>{
            enrollId: user.username,
            attributes: user.attributes,
            role: 'client',
            affiliation: 'group1'
          };
    }));
    return env;
  }
}