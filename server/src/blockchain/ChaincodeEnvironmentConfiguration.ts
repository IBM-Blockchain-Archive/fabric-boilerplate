'use strict';

export interface ChaincodeEnvironmentConfiguration {
  network: {
    peers: PeerConfig[],
    ca: {
      ca: {
        url: string
      }
    },
    users: UserConfig[],
    cert?: string,
    cert_path?: string
  };
  chaincode: {
    keyValStorePath: string,
    chaincodeIdPath: string,
    path: string,
    certPath?: string,
    certPath2?: string
  };
}

export interface UserConfig {
  enrollId: string;
  enrollSecret?: string;
  role?: string;
  affiliation?: string;
}

export interface PeerConfig {
  discovery_host: string;
  discovery_port: number;
}