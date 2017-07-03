
class SheetModelAssembler {

  toModel(entity) {
    if (entity == null) return null;
    const model = {};
    // required properties
    model.id = entity.Item.id.S;
    model.tweet = entity.Item.tweet.S;
    model.handles = entity.Item.handles.L.map(item =>  item.S);
    // optional properties
    model.title = (entity.Item.title)
      ? entity.Item.title.S
      : null;
    model.description = (entity.Item.description)
      ? entity.Item.description.S
      : null;
    return model;
  }

  toEntity(model) {
    if (model == null) return null;
    const entity = {};
    // required properties
    entity.id = { S: model.id };
    entity.tweet = { S: model.tweet };
    entity.handles = {
      L: model.handles.map(value => {
        return { S: value };
      })
    };
    // optional properties
    entity.title = (model.title)
      ? { S: model.title }
      : null;
    entity.description = (model.description)
      ? { S: model.description }
      : null;
    return entity;
  }

}

// export singleton
const singleton = new SheetModelAssembler();
singleton.SheetModelAssembler = SheetModelAssembler;
module.exports = singleton;
