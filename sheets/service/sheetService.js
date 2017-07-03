
const repository = require('../dao/sheetRepository');
const assembler = require('./sheetModelAssembler');

class SheetService {

  constructor(options) {
    options = options || {};
    this._repository = options.repository || repository;
    this._assembler = options.assembler || assembler;
  }

  findOne(id) {
    return this._repository.findOne(id).then(entity => {
      return this._assembler.toModel(entity);
    });
  }

  save(sheet) {
    const entity = this._assembler.toEntity(sheet);
    return this._repository.save(entity);
  }

}

// export singleton
const singleton = new SheetService();
singleton.SheetService = SheetService;
module.exports = singleton;
