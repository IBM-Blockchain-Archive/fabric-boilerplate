'use strict';

import {ChaincodeEnvironmentConfiguration, UserConfig} from './ChaincodeEnvironmentConfiguration';
import {LoggerInstance} from 'winston';
import * as fs from 'fs';
import {
  newChain, Chain, Member, RegistrationRequest, DeployRequest, EventDeployComplete
} from 'hfc/lib/hfc';
import {BlockchainClient} from './client/blockchainClient';
import * as path from 'path';

export enum DeployPolicy {
  ALWAYS,
  NEVER
}

export abstract class Blockchain {
  protected chain: Chain;
  private webAppAdminUserId: string = 'WebAppAdmin';

  public constructor(protected logger: LoggerInstance,
                     protected serverDirectory: string,
                     protected chaincodeEnvironmentConfiguration: ChaincodeEnvironmentConfiguration) {
    this.chain = newChain('deploy-chain-network');
  }

  public async init(deployPolicy: DeployPolicy): Promise<string> {
    // Setting the memberservice and peer urls
    if (!this.chaincodeEnvironmentConfiguration.network || !this.chaincodeEnvironmentConfiguration.network.ca) {
      throw new Error('Blockchain configuration not set correctly.');
    }
    let ca = this.chaincodeEnvironmentConfiguration.network.ca[Object.keys(this.chaincodeEnvironmentConfiguration.network.ca)[0]];
    let peer = this.chaincodeEnvironmentConfiguration.network.peers[0];
    this.chain = await this.configureChain(this.chain, ca, peer);

    this.logger.info('[SDK] Connected to memberservice and peer');

    await this.registerAdmin(this.getAdminUser());
    await this.registerAndEnrollUsers(this.getUsersToRegisterAndEnroll());

    // Do a deployment if so requested, otherwise return chaincode id
    switch (deployPolicy) {
      case DeployPolicy.ALWAYS:
        return this.deployChaincode();
      case DeployPolicy.NEVER:
        return this.loadChaincodeId();
    }
  }

  public async createClient(chaincodeId: string): Promise<BlockchainClient> {
    if (!chaincodeId) {
      throw new Error('ChaincodeId cannot be empty.');
    }

    return new BlockchainClient(chaincodeId, this.chain, this.logger);
  }

  protected abstract async configureChain(chain: Chain, ca: any, peer: any): Promise<Chain>;

  public deployChaincode(): Promise<string> {
    return new Promise<string>(async(resolve: (chaincodeID: string) => void, reject: (error: Error) => void) => {
      try {
        this.logger.info('[SDK] Going to deploy chaincode');

        let webAppAdmin = <Member>this.chain.getRegistrar();

        // Including a unique string as an argument to make sure each new deploy has a unique id
        let deployRequest = <DeployRequest>{
          fcn: 'init',
          args: [], // new Date().getTime().toString()
          chaincodePath: path.basename(this.chaincodeEnvironmentConfiguration.chaincode.path)
        };

        if (this.chaincodeEnvironmentConfiguration.network.cert_path) {
          deployRequest.certificatePath = this.chaincodeEnvironmentConfiguration.network.cert_path;
        }

        // Deploy the chaincode
        let deployTx = webAppAdmin.deploy(deployRequest);
        deployTx.on('complete', (results: EventDeployComplete) => {
          this.logger.info('[SDK] Successfully deployed chaincode');
          this.logger.info('[SDK] Deploy result: ', results.result);
          this.logger.info('[SDK] Chaincode ID = ', results.chaincodeID);

          resolve(results.chaincodeID);
        });
        deployTx.on('error', (err: any) => {
          this.logger.error('[SDK] Failed to deploy chaincode');
          this.logger.error('[SDK] Deploy error: ', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Enroll admin user which is already registered because it is
  // listed in fabric/membersrvc/membersrvc.yaml with its one time password.
  private async registerAdmin(adminUser: any): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: (error: Error) => void) => {
      this.chain.enroll(adminUser.enrollId, adminUser.enrollSecret, (err: any, webAppAdmin: Member) => {
        if (err) {
          this.logger.error('[SDK] Failed to register WebAppAdmin, ' + err);

          return reject(err);
        }
        this.logger.info('[SDK] Successfully registered WebAppAdmin');
        // Set WebAppAdmin as the chain's registrar which is authorized to register other users.
        this.chain.setRegistrar(webAppAdmin);
        resolve();
      });
    });
  }

  private getAdminUser(): UserConfig {
    let adminUser = this.chaincodeEnvironmentConfiguration.network.users.filter((u: any) => u.enrollId === this.webAppAdminUserId)[0];
    if (!adminUser) {
      throw new Error('Unable to find WebAppAdmin user');
    }

    return adminUser;
  }

  private getUsersToRegisterAndEnroll(): UserConfig[] {
    return this.chaincodeEnvironmentConfiguration.network.users.filter(
      (u: UserConfig) => u.enrollId !== this.webAppAdminUserId
    );
  }

  private async registerAndEnrollUsers(usersToRegister: UserConfig[]): Promise<void> {
    this.logger.info('[SDK] Going to register users');
    let registerAndEnrollUserPromises: Promise<void>[] = [];
    usersToRegister.forEach((userToRegister: UserConfig) => {
      registerAndEnrollUserPromises.push(this.registerAndEnrollUser(userToRegister));
    });

    await Promise.all(registerAndEnrollUserPromises);
  }

  private async registerAndEnrollUser(userToRegister: UserConfig): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: (error: Error) => void) => {
      this.chain.getUser(userToRegister.enrollId, (err: any, userObject: Member) => {
        if (err) {
          this.logger.error('[SDK] Error getting user ', userToRegister.enrollId);
          this.logger.info(err.message + '\n' + err.stack);

          return reject(new Error('Unable to retrieve user'));
        }

        if (userObject.isEnrolled()) {
          this.logger.info('[SDK] User ' + userToRegister.enrollId + ' is already enrolled');
          return resolve();
        }

        // User is not enrolled yet, so perform both registration and enrollment
        let registrationRequest = <RegistrationRequest> {
          enrollmentID: userToRegister.enrollId,
          affiliation: userToRegister.affiliation,
          account: '',
          attributes: userToRegister.attributes || [],
          roles: [userToRegister.role]
        };

        this.chain.registerAndEnroll(registrationRequest, (err: Error) => {
          if (err) {
            this.logger.warn('[SDK] Error registering and enrolling user', userToRegister.enrollId, ' (ignoring...)');
            //this.logger.info(err.message + '\n' + err.stack);
            return resolve();
            //return reject(new Error('Error registering and enrolling user'));
          }

          this.logger.info('[SDK] User ' + userToRegister.enrollId + ' successfully registered and enrolled');

          resolve();
        });
      });
    });
  }

  private getChaincodeIDFilename(): string {
    return path.join(this.serverDirectory, this.chaincodeEnvironmentConfiguration.chaincode.chaincodeIdPath);
  }

  // Get chaincode id from file
  protected loadChaincodeId(): Promise<string> {
    return new Promise<string>((resolve: (chaincodeID: string) => void) => {
      // See if the environment variable is set
      if (process.env.CHAINCODE_ID) {
        return resolve(process.env.CHAINCODE_ID);
      }

      // Read the chaincodeId from the latest deployed file
      fs.readFile(this.getChaincodeIDFilename(), (err: any, data: any) => {
        resolve(data ? data.toString() : null);
      });
    });
  }

  // Store chaincode id for later use (so we don't have to redeploy).
  public saveChaincodeId(chaincodeID: string): void {
    fs.writeFile(this.getChaincodeIDFilename(), chaincodeID, (error: Error) => {
      if (error) {
        this.logger.error('[SDK] Unable to write to ' + this.getChaincodeIDFilename() + '. Reason: ' + error.message);
      } else {
        this.logger.debug('[SDK] Wrote chaincodeId to ', this.getChaincodeIDFilename());
      }
    });
  }
}