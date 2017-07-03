
class UserModelAssembler {

  toModel(entity) {
    if (!entity) return null;
    const model = {};
    model.id = entity.Item.id.S;
    model.screenName = (entity.Item.screenName)
      ? entity.Item.screenName.S
      : null;
    model.token = (entity.Item.token)
      ? entity.Item.token.S
      : null;
    model.tokenSecret = (entity.Item.tokenSecret)
      ? entity.Item.tokenSecret.S
      : null;
    model.nextTweetsheetBatch = (entity.Item.nextTweetsheetBatch)
      ? entity.Item.nextTweetsheetBatch.S
      : null;
    return model;
  }

  toEntity(model) {
    if (!model) return null;
    const entity = {};
    entity.id = { S: model.id };
    entity.screenName = (model.screenName)
      ? { S: model.screenName }
      : null;
    entity.token = (model.token)
      ? { S: model.token }
      : null;
    entity.tokenSecret = (model.tokenSecret)
      ? { S: model.tokenSecret }
      : null;
    entity.nextTweetsheetBatch = (model.nextTweetsheetBatch)
      ? { S: model.nextTweetsheetBatch }
      : null;
    return entity;
  }

}

// export singleton
const singleton = new UserModelAssembler();
singleton.UserModelAssembler = UserModelAssembler;
module.exports = singleton;
