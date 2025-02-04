"use strict";

const utils = require("../utils");
// Fixed by @NethWs3Dev
function formatData(data) {
  const retObj = {};
  for (const prop in data) {
    if (Object.prototype.hasOwnProperty.call(data, prop)) {
      const innerObj = data[prop];
      retObj[prop] = {
        name: innerObj.name || "Facebook User",
        firstName: innerObj.firstName || "Facebook",
        vanity: innerObj.vanity || prop,
        thumbSrc: innerObj.thumbSrc || "https://i.imgur.com/xPiHPW9.jpeg",
        profileUrl: innerObj.uri || `https://www.facebook.com/profile.php?id=${prop}`,
        gender: innerObj.gender || "[unknown-gender]",
        type: innerObj.type || "user",
        isFriend: innerObj.is_friend || false,
        isBirthday: !!innerObj.is_birthday,
        searchTokens: innerObj.searchTokens || ["User", "Facebook"],
        alternateName: innerObj.alternateName || '',
      };
    }
  }
  return retObj;
}
module.exports = (defaultFuncs, api, ctx) => {
  return (id, callback) => {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });
    if (!callback) {
      callback = (err, data) => {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
    }
    if (utils.getType(id) !== "Array") {
      id = [id];
    }
    const form = {};
    id.map((v, i) => {
      form[`ids[${i}]`] = v;
    });
    defaultFuncs
      .post("https://www.facebook.com/chat/user_info/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData?.error && resData?.error !== 3252001) throw resData;
        const profiles = resData?.payload?.profiles;
        const kupal = formatData(profiles ?? {...id});
        return callback(null, kupal);
      })
      .catch(err => {
        utils.error("getUserInfo", err);
        return callback(err);
      });

    return returnPromise;
  }
};