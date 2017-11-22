
const repository = require('../dao/sheetRepository');
const assembler = require('./sheetModelAssembler');

class SheetService {

  constructor(options) {
    options = options || {};
    this._repository = options.repository || repository;
    this._assembler = options.assembler || assembler;
  }

  findOne(id) {
    console.info(`SheetService.findOne(id): ${id}`);
    return this._repository.findOne(id).then(entity => {
      return this._assembler.toModel(entity);
    });
  }

  save(sheet) {
    console.info(`SheetService.save(sheet.id): ${sheet.id}`);
    const entity = this._assembler.toEntity(sheet);
    return this._repository.save(entity);
  }

}

// export singleton
const singleton = new SheetService();
singleton.SheetService = SheetService;
module.exports = singleton;
