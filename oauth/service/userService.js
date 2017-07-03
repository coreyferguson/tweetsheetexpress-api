
const userRepository = require('../dao/userRepository');
const userModelAssembler = require('./userModelAssembler');

class UserService {

  constructor(options) {
    options = options || {};
    this._userRepository = options.userRepository || userRepository;
    this._userModelAssembler = options.userModelAssembler || userModelAssembler;
  }

  findOne(userId) {
    return this._userRepository.findOne(userId).then(entity => {
      return this._userModelAssembler.toModel(entity);
    });
  }

  save(model) {
    console.info('userService.save(model):', model);
    const entity = this._userModelAssembler.toEntity(model);
    console.info('userService.save:entity:', entity);
    return this._userRepository.save(entity);
  }

}

// export singleton
const singleton = new UserService();
singleton.UserService = UserService;
module.exports = singleton;
