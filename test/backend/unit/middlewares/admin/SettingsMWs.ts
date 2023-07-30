/* eslint-disable no-unused-expressions,@typescript-eslint/no-unused-expressions */
import {expect} from 'chai';
import {ErrorDTO} from '../../../../../src/common/entities/Error';
import {ObjectManagers} from '../../../../../src/backend/model/ObjectManagers';
import {SettingsMWs} from '../../../../../src/backend/middlewares/admin/SettingsMWs';
import {ServerUserConfig} from '../../../../../src/common/config/private/PrivateConfig';
import {Config} from '../../../../../src/common/config/private/Config';
import {UserRoles} from '../../../../../src/common/entities/UserDTO';
import {ConfigClassBuilder} from '../../../../../node_modules/typeconfig/node';
import {ServerEnvironment} from '../../../../../src/backend/Environment';
import {EmailMessagingType} from '../../../../../src/common/config/private/MessagingConfig';
import * as fs from 'fs';
import * as path from 'path';


declare const describe: any;
declare const it: any;
declare const beforeEach: any;

describe('Settings middleware', () => {

  const tempDir = path.join(__dirname, '../../../tmp');
  beforeEach(async () => {
    await ObjectManagers.reset();
    await fs.promises.rm(tempDir, {recursive: true, force: true});
  });

  it('should save empty enforced users settings', (done: (err?: any) => void) => {
    console.log('sarting - should save empty enforced users settings');
    ServerEnvironment.sendMailAvailable = false;
    Config.Environment.sendMailAvailable = false;
    Config.Messaging.Email.type = EmailMessagingType.SMTP;
    const req: any = {
      session: {},
      sessionOptions: {},
      query: {},
      params: {},
      body: {
        settingsPath: 'Users',
        settings: ConfigClassBuilder.attachPrivateInterface(new ServerUserConfig()).toJSON()
      }
    };
    console.log('Settings', req);
    req.body.settings.enforcedUsers = [];
    const next: any = (err: ErrorDTO) => {
      try {
        expect(err).to.be.undefined;
        expect(Config.Users.enforcedUsers.length).to.be.equal(0);
        done();
      } catch (err) {
        console.error(err);
        done(err);
      }
    };
    SettingsMWs.updateSettings(req, null, next);


  });
  it('should save enforced users settings', (done: (err?: any) => void) => {
    console.log('sarting - should save enforced users settings');

    ServerEnvironment.sendMailAvailable = false;
    Config.Environment.sendMailAvailable = false;
    Config.Messaging.Email.type = EmailMessagingType.SMTP;
    const req: any = {
      session: {},
      sessionOptions: {},
      query: {},
      params: {},
      body: {
        settingsPath: 'Users',
        settings: {
          enforcedUsers: [],
          authenticationRequired: false,
          unAuthenticatedUserRole: UserRoles.User
        }
      }
    };

    req.body.settings.enforcedUsers = [{name: 'Apple', password: 'Apple pass', role: UserRoles.User}];

    const next2: any = (err: ErrorDTO) => {
      try {
        expect(Config.Users.enforcedUsers.length).to.be.equal(1);
        expect(Config.Users.enforcedUsers[0].name).to.be.equal('Apple');
        expect(Config.Users.enforcedUsers.length).to.be.equal(1);
        Config.original().then((cfg) => {
          try {
            expect(cfg.Users.enforcedUsers.length).to.be.equal(1);
            expect(cfg.Users.enforcedUsers[0].name).to.be.equal('Apple');
            done();
          } catch (err) {
            console.error(err);
            done(err);
          }
        }).catch(done);
      } catch (err) {
        console.error(err);
        done(err);
      }
    };
    SettingsMWs.updateSettings(req, null, next2);

  });


});
