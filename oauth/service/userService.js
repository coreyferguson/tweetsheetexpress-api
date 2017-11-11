
const userRepository = require('../dao/userRepository');
const userModelAssembler = require('./userModelAssembler');

class UserService {

  constructor(options) {
    options = options || {};
    this._userRepository = options.userRepository || userRepository;
    this._userModelAssembler = options.userModelAssembler || userModelAssembler;
  }

  isAuthenticated(userId, token, tokenSecret) {
    console.info(`UserService.isAuthenticated(userId, ...): ${userId}`);
    if (!userId || !token || !tokenSecret) return Promise.resolve(false);
    return this.findOne(userId).then(user => {
      return token === user.token && tokenSecret == user.tokenSecret;
    });
  }

  findOne(userId) {
    console.info(`UserService.findOne(userId): ${userId}`);
    return this._userRepository.findOne(userId).then(entity => {
      return this._userModelAssembler.toModel(entity);
    });
  }

  save(model) {
    console.info('UserService.save(model):', model);
    const entity = this._userModelAssembler.toEntity(model);
    console.info('UserService.save:entity:', entity);
    return this._userRepository.save(entity);
  }

}

// export singleton
const singleton = new UserService();
singleton.UserService = UserService;
module.exports = singleton;
