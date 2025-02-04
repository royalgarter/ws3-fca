"use strict";

const utils = require("../utils");
// Fixed by @NethWs3Dev
function formatData(data) {
  const fullObj = Object.keys(data);
  const retObj = {};
  fullObj.forEach(v => {
    retObj[v] = data?.[v] ?? {
      name: "Facebook User",
      firstName: "Facebook",
      vanity: v,
      thumbSrc: "https://i.imgur.com/xPiHPW9.jpeg",
      profileUrl: `https://www.facebook.com/profile.php?id=${v}`,
      gender: "unknown",
      type: "user",
      isFriend: false,
      isBirthday: false,
      searchTokens: ["User", "Facebook"],
      alternateName: ""
    };
  });
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
        const kupal = formatData(profiles ?? id);
        return callback(null, kupal);
      })
      .catch(err => {
        utils.error("getUserInfo", err);
        return callback(err);
      });

    return returnPromise;
  }
};