const OriginalTour = require("../models/OriginalTour");
const SubTour = require("../models/SubsidiaryTour");
const Account = require("../models/Account");
const Dicount = require("../models/Discount");

const generateCustomId = async (code) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let newId, isDuplicate;

  do {
    let randomPart = "";
    for (let i = 0; i < 8; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    newId = `${code}${randomPart}`;

    switch (code) {
      case "O":
        isDuplicate = await OriginalTour.exists({ originalTourCode: newId });
        break;
      case "S":
        isDuplicate = await SubTour.exists({ subTourCode: newId });
        break;
      case "C":
        isDuplicate = await Account.exists({ accountCode: newId });
        break;
      case "D":
        isDuplicate = await Dicount.exists({ discountCode: newId });
        break;
      case "A":
        isDuplicate = await Account.exists({ accountCode: newId });
        break;
      case "G":
        isDuplicate = await Account.exists({ accountCode: newId });
        break;

      default:
        break;
    }
  } while (isDuplicate);

  return newId;
};

const generateCustomIdMiddleware = async (req, res, next) => {
  try {
    let code =
      req.body.originalTourCode ||
      req.body.subTourCode ||
      req.body.accountCode ||
      req.body.discountCode;

    switch (code) {
      case "O":
        req.body.originalTourCode = await generateCustomId(code);
        break;
      case "S":
        req.body.subTourCode = await generateCustomId(code);
        break;
      case "C":
        req.body.accountCode = await generateCustomId(code);
        break;
      case "D":
        req.body.discountCode = await generateCustomId(code);
        break;

      case "G":
        req.body.accountCode = await generateCustomId(code);
        break;
      case "A":
        req.body.accountCode = await generateCustomId(code);
        break;
      default:
        break;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = generateCustomIdMiddleware;
