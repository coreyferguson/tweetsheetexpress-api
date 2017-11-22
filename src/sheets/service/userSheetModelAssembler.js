
const sheetModelAssembler = require('./sheetModelAssembler');

class UserSheetModelAssembler {

  toModel(sheetEntity, userSheetEntity, userId) {
    if (sheetEntity == null) throw new Error('sheetEntity cannot be null or undefined');
    const sheetModel = sheetModelAssembler.toModel(sheetEntity);
    const userSheetModel = {};
    userSheetModel.userId = (userSheetEntity)
      ? userSheetEntity.Item.userId.S
      : userId;
    userSheetModel.sheetId = (userSheetEntity)
      ? userSheetEntity.Item.sheetId.S
      : sheetModel.id;
    userSheetModel.sheet = sheetModel;

    // TODO: Do this better than O(n^2) time.
    const completionsModel = [];
    const handles = sheetModel.handles;
    const completions = (userSheetEntity)
      ? userSheetEntity.Item.completions.L.map(completion => completion.S)
      : [];
    handles.forEach(handle => {
      const m = {};
      m.handle = handle;
      if (completions.includes(handle)) m.completed = true;
      else m.completed = false;
      completionsModel.push(m);
    });
    userSheetModel.completions = completionsModel;

    return userSheetModel;
  }

  toEntity(model) {
    if (model == null) return null;
    const entity = {};
    entity.userId = { S: model.userId };
    entity.sheetId = { S: model.sheetId };
    entity.completions = {
      L: model.completions
        .filter(completion => completion.completed)
        .map(completion => {
          return { S: completion.handle };
        })
    };
    return entity;
  }

}

// export singleton
const singleton = new UserSheetModelAssembler();
singleton.UserSheetModelAssembler = UserSheetModelAssembler;
module.exports = singleton;
