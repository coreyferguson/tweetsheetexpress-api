
class UserResourceAssembler {

  toResource(model) {
    if (!model) return model;
    const resource = {};
    resource.id = model.id;
    resource.screenName = model.screenName;
    resource.nextTweetsheetBatch = model.nextTweetsheetBatch;
    return resource;
  }

}

module.exports = new UserResourceAssembler();
